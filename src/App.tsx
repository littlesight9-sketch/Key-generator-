import { useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { Check, Copy, Download, KeyRound, PlusCircle, X } from 'lucide-react';
import type {
  ActivityLogItem,
  AppView,
  LicenseKeyRecord,
  PlatformState,
  ThemeId,
} from './types/license';
import {
  PRODUCTS,
  THEME_OPTIONS,
  VALIDITY_OPTIONS,
  buildDefaultState,
  clampQuantity,
  computeBatchTotalCents,
  createBatchRecords,
  formatUsdFromCents,
  formatValidityDropdownLabel,
  loadPlatformState,
  savePlatformState,
} from './lib/licenseEngine';
import { CustomSelect } from './components/CustomSelect';
import {
  BoltGlyph,
  CodeBracketsGlyph,
  HeartGlyph,
  HourglassGlyph,
  InfinityModsWatermark,
  MenuGlyph,
  MinusGlyph,
  OpenBoxGlyph,
  PlusGlyph,
  PyramidBlocksGlyph,
  WandSparklesGlyph,
} from './components/Icons';
import { ManageKeysView } from './components/ManageKeysView';
import { NavigationDrawer } from './components/NavigationDrawer';
import {
  KeyValidatorView,
  SettingsView,
  WalletView,
} from './components/SecondaryViews';
import { Button, Field, Surface } from './components/ui';

const THEME_STORAGE_KEY = 'license_premium_theme_v1';

export default function App() {
  const [platform, setPlatform] = useState<PlatformState>(() =>
    loadPlatformState()
  );
  const [theme, setTheme] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
      return THEME_OPTIONS.some((t) => t.id === saved) && saved
        ? saved
        : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [activeView, setActiveView] = useState<AppView>('generator');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Generator form state (defaults match screenshot: Drip Android ApkMod, 1 Days - $1.00, Quantity 1)
  const [selectedProductId, setSelectedProductId] = useState<string>(
    'drip-android-apkmod'
  );
  const [selectedValidityId, setSelectedValidityId] = useState<string>(
    VALIDITY_OPTIONS[0].id
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [quantityRaw, setQuantityRaw] = useState<string>('1');

  // Newly generated keys from the most recent submission
  const [recentBatch, setRecentBatch] = useState<LicenseKeyRecord[]>([]);
  const [statusNotice, setStatusNotice] = useState<string>('');
  const [errorNotice, setErrorNotice] = useState<string>('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage quota errors in restricted frames
    }
  }, [theme]);

  const persistPlatform = (updater: (prev: PlatformState) => PlatformState) => {
    setPlatform((prev) => {
      const next = updater(prev);
      const saved = savePlatformState(next);
      if (!saved) {
        setErrorNotice(
          'Browser storage is unavailable; changes remain active for this session.'
        );
      }
      return next;
    });
  };

  const selectedProduct = useMemo(
    () => PRODUCTS.find((p) => p.id === selectedProductId) ?? PRODUCTS[0],
    [selectedProductId]
  );

  const selectedValidity = useMemo(
    () =>
      VALIDITY_OPTIONS.find((v) => v.id === selectedValidityId) ??
      VALIDITY_OPTIONS[0],
    [selectedValidityId]
  );

  const productOptions = useMemo(
    () =>
      PRODUCTS.map((p) => ({
        value: p.id,
        label: p.name,
      })),
    []
  );

  const validityOptions = useMemo(
    () =>
      VALIDITY_OPTIONS.map((v) => ({
        value: v.id,
        label: formatValidityDropdownLabel(selectedProduct, v),
      })),
    [selectedProduct]
  );

  const batchCostCents = useMemo(
    () => computeBatchTotalCents(selectedProduct, selectedValidity, quantity),
    [selectedProduct, selectedValidity, quantity]
  );

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatusNotice(`Copied ${label} to clipboard`);
      setErrorNotice('');
    } catch {
      setErrorNotice('Clipboard permission denied in this browser context.');
    }
  };

  const handleQuantityStep = (delta: number) => {
    setErrorNotice('');
    const next = clampQuantity(quantity + delta);
    setQuantity(next);
    setQuantityRaw(String(next));
  };

  const handleQuantityInputChange = (raw: string) => {
    setErrorNotice('');
    if (raw === '') {
      setQuantityRaw('');
      return;
    }
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) return;
    const clamped = clampQuantity(parsed);
    setQuantity(clamped);
    setQuantityRaw(String(clamped));
  };

  const handleQuantityBlur = () => {
    const parsed = Number.parseInt(quantityRaw, 10);
    const safe = clampQuantity(parsed);
    setQuantity(safe);
    setQuantityRaw(String(safe));
  };

  const handleGenerateKeys = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice('');

    const safeQty = clampQuantity(quantity);
    setQuantity(safeQty);
    setQuantityRaw(String(safeQty));

    const totalCost = computeBatchTotalCents(
      selectedProduct,
      selectedValidity,
      safeQty
    );

    if (platform.balanceCents < totalCost) {
      setErrorNotice(
        `Insufficient credit (${formatUsdFromCents(
          platform.balanceCents
        )} available, ${formatUsdFromCents(totalCost)} required).`
      );
      return;
    }

    const generated = createBatchRecords(
      selectedProduct,
      selectedValidity,
      safeQty
    );

    const logEntry: ActivityLogItem = {
      id: `log_${Date.now()}`,
      action: `Generated ${safeQty} ${safeQty === 1 ? 'key' : 'keys'}`,
      detail: `${selectedProduct.name} · ${selectedValidity.daysLabel}`,
      amountCents: -totalCost,
      timestampIso: new Date().toISOString(),
    };

    persistPlatform((prev) => ({
      ...prev,
      balanceCents: prev.balanceCents - totalCost,
      keys: [...generated, ...prev.keys],
      logs: [logEntry, ...prev.logs],
    }));

    setRecentBatch(generated);
    setStatusNotice(
      `Generated ${safeQty} ${safeQty === 1 ? 'key' : 'keys'} (${formatUsdFromCents(
        totalCost
      )})`
    );
  };

  const handleDownloadRecentBatch = () => {
    if (recentBatch.length === 0) return;
    const content = recentBatch
      .map((k) => `${k.key} | ${k.productName} | ${k.validityLabel}`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedProduct.prefix.toLowerCase()}-${selectedValidity.durationCode.toLowerCase()}-keys.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportAllKeys = () => {
    if (platform.keys.length === 0) return;
    const content = platform.keys
      .map(
        (k) =>
          `${k.key} | ${k.productName} | ${k.validityLabel} | ${k.status.toUpperCase()}`
      )
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `license-premium-all-keys-${platform.keys.length}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusNotice(`Exported ${platform.keys.length} keys to .TXT`);
  };

  const handleResetHwid = (id: string) => {
    const target = platform.keys.find((k) => k.id === id);
    if (!target) return;
    persistPlatform((prev) => ({
      ...prev,
      keys: prev.keys.map((k) =>
        k.id === id
          ? { ...k, hwid: null, status: 'unused', activatedAtIso: null }
          : k
      ),
      logs: [
        {
          id: `log_${Date.now()}`,
          action: 'HWID Lock Reset',
          detail: target.key,
          amountCents: null,
          timestampIso: new Date().toISOString(),
        },
        ...prev.logs,
      ],
    }));
    setStatusNotice(`Reset HWID binding for ${target.key}`);
  };

  const handleBindMockDevice = (id: string) => {
    const target = platform.keys.find((k) => k.id === id);
    if (!target) return;
    const mockHwid = `DEV-${Math.random()
      .toString(16)
      .slice(2, 6)
      .toUpperCase()}-${Math.random()
      .toString(16)
      .slice(2, 6)
      .toUpperCase()}`;
    persistPlatform((prev) => ({
      ...prev,
      keys: prev.keys.map((k) =>
        k.id === id
          ? {
              ...k,
              status: 'active',
              hwid: mockHwid,
              activatedAtIso: new Date().toISOString(),
            }
          : k
      ),
      logs: [
        {
          id: `log_${Date.now()}`,
          action: 'Device HWID Bound',
          detail: `${target.key} · ${mockHwid}`,
          amountCents: null,
          timestampIso: new Date().toISOString(),
        },
        ...prev.logs,
      ],
    }));
    setStatusNotice(`Bound ${target.key} to ${mockHwid}`);
  };

  const handleRevokeKey = (id: string) => {
    const target = platform.keys.find((k) => k.id === id);
    if (!target) return;
    persistPlatform((prev) => ({
      ...prev,
      keys: prev.keys.map((k) =>
        k.id === id ? { ...k, status: 'revoked' } : k
      ),
      logs: [
        {
          id: `log_${Date.now()}`,
          action: 'Revoked License Key',
          detail: target.key,
          amountCents: null,
          timestampIso: new Date().toISOString(),
        },
        ...prev.logs,
      ],
    }));
    setStatusNotice(`Revoked ${target.key}`);
  };

  const handleDeleteKey = (id: string) => {
    persistPlatform((prev) => ({
      ...prev,
      keys: prev.keys.filter((k) => k.id !== id),
    }));
    setRecentBatch((prev) => prev.filter((k) => k.id !== id));
    setStatusNotice('Deleted revoked license key');
  };

  const handleAddFunds = (cents: number) => {
    persistPlatform((prev) => ({
      ...prev,
      balanceCents: prev.balanceCents + cents,
      logs: [
        {
          id: `log_${Date.now()}`,
          action: 'Reseller Credit Added',
          detail: 'Instant wallet top-up',
          amountCents: cents,
          timestampIso: new Date().toISOString(),
        },
        ...prev.logs,
      ],
    }));
    setErrorNotice('');
    setStatusNotice(`Added ${formatUsdFromCents(cents)} to reseller balance`);
  };

  const handleUpdateUsername = (nextName: string) => {
    persistPlatform((prev) => ({
      ...prev,
      username: nextName,
    }));
    setStatusNotice(`Updated username to ${nextName}`);
  };

  const handleResetPlatform = () => {
    const fresh = buildDefaultState();
    savePlatformState(fresh);
    setPlatform(fresh);
    setRecentBatch([]);
    setSelectedProductId('drip-android-apkmod');
    setSelectedValidityId(VALIDITY_OPTIONS[0].id);
    setQuantity(1);
    setQuantityRaw('1');
    setErrorNotice('');
    setStatusNotice('Platform state reset to initial defaults');
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-dvh flex-col bg-background text-foreground">
        {/* Top Bar: small website logo / username on left, avatar + hamburger menu on right */}
        <header className="w-full border-b border-border/80 bg-header">
          <div className="mx-auto flex h-[48px] max-w-[90rem] items-center justify-between px-3.5 sm:px-5">
            {/* Left: Small Website Logo / Username */}
            <button
              type="button"
              onClick={() => setActiveView('generator')}
              aria-label="Go to Key Generator"
              className="flex items-center gap-2 min-w-0 rounded-lg py-1 pr-2 text-left transition-opacity duration-150 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-primary cursor-pointer"
            >
              <WandSparklesGlyph className="h-[18px] w-[18px] shrink-0 text-accent-icon" />
              <span
                aria-hidden="true"
                className="text-muted/60 text-sm select-none"
              >
                /
              </span>
              <span className="truncate text-[14px] font-semibold text-foreground">
                {platform.username}
              </span>
            </button>

            {/* Right: Far-right Hamburger menu */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation menu"
                className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg text-foreground/90 transition-colors duration-150 hover:bg-surface-band hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary cursor-pointer"
              >
                <MenuGlyph className="h-[19px] w-[19px]" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content: compact card for Key Generator, clean wider borderless canvas for other tabs */}
        <main
          className={`mx-auto w-full flex-1 px-3.5 pt-4 pb-8 sm:pt-6 ${
            activeView === 'generator' ? 'max-w-[404px]' : 'max-w-[560px]'
          }`}
        >
          {activeView === 'generator' && (
            <Surface className="relative">
              {/* Bright top highlight edge */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-5 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/85 to-transparent"
              />

              {/* Card Header */}
              <div className="card-top-glow rounded-t-[17px] px-4 pt-4 pb-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <BoltGlyph className="h-4 w-4 shrink-0 text-accent-icon" />
                  <h1 className="text-[15.5px] font-bold tracking-[0.09em] text-foreground uppercase">
                    KEY GENERATOR
                  </h1>
                </div>
                <div
                  aria-hidden="true"
                  className="mx-auto mt-2.5 h-px w-[54%] bg-border/90"
                />
              </div>

              {/* Subtitle Strip */}
              <div className="border-y border-border/90 bg-surface-band/85 px-4 py-2 text-center">
                <p className="text-[12.5px] text-subtle">
                  Generate license keys for your customers
                </p>
              </div>

              {/* Form Body */}
              <form
                onSubmit={handleGenerateKeys}
                className="p-4 sm:p-4.5 space-y-3.5"
              >
                <Field
                  label="PRODUCT TYPE:"
                  htmlFor="product-type-select"
                  icon={<OpenBoxGlyph className="h-[15px] w-[15px]" />}
                >
                  <CustomSelect
                    id="product-type-select"
                    ariaLabel="Product Type"
                    value={selectedProductId}
                    options={productOptions}
                    onChange={setSelectedProductId}
                  />
                </Field>

                <Field
                  label="VALIDITY:"
                  htmlFor="validity-select"
                  icon={<HourglassGlyph className="h-[14px] w-[14px]" />}
                >
                  <CustomSelect
                    id="validity-select"
                    ariaLabel="Validity"
                    value={selectedValidityId}
                    options={validityOptions}
                    onChange={setSelectedValidityId}
                  />
                </Field>

                <Field
                  label="QUANTITY:"
                  htmlFor="quantity-input"
                  icon={<PyramidBlocksGlyph className="h-[15px] w-[15px]" />}
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      aria-disabled={quantity <= 1}
                      onClick={() => handleQuantityStep(-1)}
                      className="cta-purple-btn inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] text-primary-foreground transition-[transform,filter,box-shadow] duration-150 ease-out active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
                    >
                      <MinusGlyph className="h-3.5 w-3.5" />
                    </button>

                    <input
                      id="quantity-input"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={100}
                      value={quantityRaw}
                      onChange={(e) => handleQuantityInputChange(e.target.value)}
                      onBlur={handleQuantityBlur}
                      className="h-[42px] min-w-0 flex-1 rounded-[10px] border border-well-border bg-well px-3 text-center text-[15px] font-bold tabular-nums text-foreground transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    />

                    <button
                      type="button"
                      aria-label="Increase quantity"
                      aria-disabled={quantity >= 100}
                      onClick={() => handleQuantityStep(1)}
                      className="cta-purple-btn inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] text-primary-foreground transition-[transform,filter,box-shadow] duration-150 ease-out active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
                    >
                      <PlusGlyph className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </Field>

                <button
                  type="submit"
                  title={`Generate ${quantity} ${
                    quantity === 1 ? 'key' : 'keys'
                  } (${formatUsdFromCents(batchCostCents)})`}
                  className="cta-purple-btn mt-0.5 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[10px] px-4 text-[13.5px] font-semibold tracking-[0.08em] text-primary-foreground uppercase transition-[transform,filter,box-shadow] duration-150 ease-out active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer whitespace-nowrap"
                >
                  <BoltGlyph className="h-[15px] w-[15px] shrink-0 text-primary-foreground" />
                  <span>GENERATE KEYS</span>
                </button>

                {errorNotice && (
                  <div
                    role="alert"
                    className="border-t border-border pt-3.5 flex flex-wrap items-center justify-between gap-2 text-xs text-rose-400"
                  >
                    <span>{errorNotice}</span>
                    <button
                      type="button"
                      onClick={() => handleAddFunds(5000)}
                      className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-border bg-well px-2.5 font-semibold text-foreground hover:border-primary/50 cursor-pointer whitespace-nowrap"
                    >
                      <PlusCircle className="h-3.5 w-3.5 text-accent-icon" />
                      <span>+$50.00 Credit</span>
                    </button>
                  </div>
                )}
              </form>

              {/* Output Panel shown after generating keys */}
              {recentBatch.length > 0 && (
                <div className="border-t border-border px-4 py-4 sm:px-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div
                      role="status"
                      aria-live="polite"
                      className="text-xs font-medium text-subtle"
                    >
                      {statusNotice ||
                        `Generated ${recentBatch.length} ${
                          recentBatch.length === 1 ? 'key' : 'keys'
                        }`}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          void copyToClipboard(
                            recentBatch.map((k) => k.key).join('\n'),
                            `${recentBatch.length} ${
                              recentBatch.length === 1 ? 'key' : 'keys'
                            }`
                          )
                        }
                        className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-well-border bg-well px-2.5 text-xs font-medium text-foreground hover:border-primary/50 cursor-pointer whitespace-nowrap"
                      >
                        <Copy className="h-3.5 w-3.5 text-accent-icon" />
                        <span>Copy All</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadRecentBatch}
                        className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-well-border bg-well px-2.5 text-xs font-medium text-foreground hover:border-primary/50 cursor-pointer whitespace-nowrap"
                      >
                        <Download className="h-3.5 w-3.5 text-accent-icon" />
                        <span>.TXT</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveView('keys')}
                        className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-well-border bg-well px-2.5 text-xs font-medium text-foreground hover:border-primary/50 cursor-pointer whitespace-nowrap"
                      >
                        <KeyRound className="h-3.5 w-3.5 text-accent-icon" />
                        <span>Manage</span>
                      </button>
                      <button
                        type="button"
                        aria-label="Dismiss generated batch preview"
                        onClick={() => setRecentBatch([])}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-well-border bg-well text-muted hover:text-foreground cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 divide-y divide-border border-t border-border">
                    {recentBatch.slice(0, 10).map((item) => {
                      const isCopied = copiedKeyId === item.id;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2.5 py-2.5"
                        >
                          <span
                            title={item.key}
                            className="min-w-0 truncate font-mono text-[13.5px] font-medium text-foreground"
                          >
                            {item.key}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              void copyToClipboard(item.key, item.key);
                              setCopiedKeyId(item.id);
                              setTimeout(() => setCopiedKeyId(null), 1500);
                            }}
                            className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-lg border border-well-border bg-well px-2.5 text-xs font-medium text-foreground hover:border-primary/50 cursor-pointer whitespace-nowrap"
                          >
                            {isCopied ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-accent-icon" />
                            )}
                            <span>{isCopied ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {recentBatch.length > 10 && (
                    <div className="mt-2 text-center">
                      <Button
                        tone="ghost"
                        className="min-h-8 text-xs"
                        onClick={() => setActiveView('keys')}
                      >
                        View all {recentBatch.length} generated keys in Manage Keys
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Surface>
          )}

          {activeView === 'keys' && (
            <ManageKeysView
              keys={platform.keys}
              onCopyText={(txt, lbl) => void copyToClipboard(txt, lbl)}
              onResetHwid={handleResetHwid}
              onRevokeKey={handleRevokeKey}
              onDeleteKey={handleDeleteKey}
              onBackToGenerator={() => setActiveView('generator')}
            />
          )}

          {activeView === 'validator' && (
            <KeyValidatorView
              keys={platform.keys}
              onBindMockDevice={handleBindMockDevice}
              onResetHwid={handleResetHwid}
              onBackToGenerator={() => setActiveView('generator')}
            />
          )}

          {activeView === 'wallet' && (
            <WalletView
              balanceCents={platform.balanceCents}
              keysCount={platform.keys.length}
              logs={platform.logs}
              onAddFunds={handleAddFunds}
              onBackToGenerator={() => setActiveView('generator')}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView
              username={platform.username}
              activeTheme={theme}
              onUpdateUsername={handleUpdateUsername}
              onSelectTheme={setTheme}
              onResetPlatform={handleResetPlatform}
              onBackToGenerator={() => setActiveView('generator')}
            />
          )}

          {/* Live status line when on secondary views */}
          {activeView !== 'generator' && statusNotice && (
            <div
              role="status"
              aria-live="polite"
              className="mt-4 text-center text-xs text-subtle"
            >
              {statusNotice}
            </div>
          )}

          {/* Footer & INFINITY MODS Watermark on Key Generator & Key History */}
          {(activeView === 'generator' || activeView === 'keys') && (
            <footer className="mt-4 border-t border-border/65 pt-3 text-center">
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11.5px] text-muted">
                <CodeBracketsGlyph className="h-3 w-3.5 shrink-0 text-accent-icon" />
                <span>© 2026 License Premium - Secured Platform</span>
                <HeartGlyph className="h-3 w-3 shrink-0 text-accent-icon" />
              </div>
              <InfinityModsWatermark />
            </footer>
          )}
        </main>

        {/* Bottom Navigation Sheet */}
        <NavigationDrawer
          open={drawerOpen}
          activeView={activeView}
          balanceCents={platform.balanceCents}
          totalKeysCount={platform.keys.length}
          onSelectView={setActiveView}
          onExportAll={handleExportAllKeys}
          onClose={() => setDrawerOpen(false)}
        />
      </div>
    </MotionConfig>
  );
}
