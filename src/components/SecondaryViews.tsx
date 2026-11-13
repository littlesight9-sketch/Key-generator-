import { useState } from 'react';
import {
  ArrowLeft,
  Check,
  PlusCircle,
  RotateCcw,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import type { ActivityLogItem, LicenseKeyRecord, ThemeId } from '../types/license';
import {
  THEME_OPTIONS,
  formatShortTimestamp,
  formatUsdFromCents,
} from '../lib/licenseEngine';
import { Button } from './ui';

interface KeyValidatorViewProps {
  keys: LicenseKeyRecord[];
  onBindMockDevice: (id: string) => void;
  onResetHwid: (id: string) => void;
  onBackToGenerator: () => void;
}

export function KeyValidatorView({
  keys,
  onBindMockDevice,
  onResetHwid,
  onBackToGenerator,
}: KeyValidatorViewProps) {
  const [inputKey, setInputKey] = useState(keys[0]?.key ?? '');

  const normalized = inputKey.trim().toUpperCase();
  const matched = keys.find((k) => k.key.toUpperCase() === normalized) ?? null;

  return (
    <section aria-labelledby="validator-heading" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1
            id="validator-heading"
            className="text-xl font-bold tracking-tight text-foreground"
          >
            Verify & HWID
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            Check license activation status or reset device lock
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToGenerator}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-surface-band px-3.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface cursor-pointer whitespace-nowrap"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-accent-icon" />
          <span>Key Generator</span>
        </button>
      </div>

      <div className="space-y-3">
        <label
          htmlFor="validator-key-input"
          className="block text-xs font-semibold tracking-[0.06em] text-muted uppercase"
        >
          Enter License Key
        </label>
        <input
          id="validator-key-input"
          type="text"
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          placeholder="Paste key e.g. DRIP-7D-8K4M-9X2P-W7Q5"
          className="min-h-12 w-full rounded-xl bg-surface-band px-4 font-mono text-sm text-foreground placeholder:text-muted/65 focus-visible:outline-2 focus-visible:outline-primary"
        />

        {keys.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted mr-1">Quick pick:</span>
            {keys.slice(0, 3).map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setInputKey(k.key)}
                className="min-h-8 rounded-lg bg-surface-band px-2.5 font-mono text-xs text-foreground hover:bg-surface cursor-pointer"
              >
                {k.key}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2">
        {!normalized ? (
          <p className="text-sm text-muted">
            Enter a key above or pick a recent key to view its details.
          </p>
        ) : !matched ? (
          <p className="text-sm font-medium text-rose-400">
            No matching key found. Check the key string or generate a new key.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 pb-1">
              <div className="flex items-center gap-2 text-base font-bold text-foreground">
                <ShieldCheck className="h-5 w-5 text-accent-icon" />
                <span>{matched.productName}</span>
              </div>
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  matched.status === 'active'
                    ? 'text-emerald-400'
                    : matched.status === 'revoked'
                    ? 'text-rose-400'
                    : 'text-subtle'
                }`}
              >
                {matched.status}
              </span>
            </div>

            <div className="divide-y divide-border/55 text-sm">
              <div className="flex justify-between gap-4 py-3">
                <span className="text-muted">Validity</span>
                <span className="font-semibold text-foreground">
                  {matched.validityLabel} · {formatUsdFromCents(matched.costCents)}
                </span>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <span className="text-muted">Bound Device HWID</span>
                <span className="font-mono text-xs text-foreground">
                  {matched.hwid ?? 'Unbound (ready for first login)'}
                </span>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <span className="text-muted">Issued On</span>
                <span className="text-foreground">
                  {formatShortTimestamp(matched.createdAtIso)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              {matched.status === 'unused' && (
                <Button
                  tone="primary"
                  className="flex-1 text-sm"
                  onClick={() => onBindMockDevice(matched.id)}
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Simulate Device Login</span>
                </Button>
              )}
              {matched.hwid && matched.status !== 'revoked' && (
                <Button
                  tone="primary"
                  className="flex-1 text-sm"
                  onClick={() => onResetHwid(matched.id)}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset HWID Lock</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

interface WalletViewProps {
  balanceCents: number;
  keysCount: number;
  logs: ActivityLogItem[];
  onAddFunds: (cents: number) => void;
  onBackToGenerator: () => void;
}

export function WalletView({
  balanceCents,
  keysCount,
  logs,
  onAddFunds,
  onBackToGenerator,
}: WalletViewProps) {
  const [showAllLogs, setShowAllLogs] = useState(false);
  const visibleLogs = showAllLogs ? logs : logs.slice(0, 6);

  return (
    <section aria-labelledby="wallet-heading" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1
            id="wallet-heading"
            className="text-xl font-bold tracking-tight text-foreground"
          >
            Reseller Wallet
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            Available platform credit and transaction history
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToGenerator}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-surface-band px-3.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface cursor-pointer whitespace-nowrap"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-accent-icon" />
          <span>Key Generator</span>
        </button>
      </div>

      {/* Balance Summary (No Box Border) */}
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-[0.06em] text-muted uppercase">
            Current Balance
          </div>
          <div className="mt-1 text-3xl font-bold tabular-nums text-foreground">
            {formatUsdFromCents(balanceCents)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted">Total Keys Issued</div>
          <div className="mt-0.5 text-base font-bold tabular-nums text-foreground">
            {keysCount}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <Button
          tone="primary"
          className="flex-1 text-sm"
          onClick={() => onAddFunds(5000)}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add $50.00</span>
        </Button>
        <button
          type="button"
          onClick={() => onAddFunds(10000)}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-surface-band px-4 text-sm font-semibold text-foreground hover:bg-surface cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="h-4 w-4 text-accent-icon" />
          <span>Add $100.00</span>
        </button>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-bold text-foreground">Recent Activity</h2>
        <div className="divide-y divide-border/55">
          {visibleLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between gap-3 py-3 text-sm"
            >
              <div className="min-w-0">
                <div className="font-medium text-foreground truncate">
                  {log.action}
                </div>
                <div className="text-xs text-muted truncate">
                  {log.detail} · {formatShortTimestamp(log.timestampIso)}
                </div>
              </div>
              {log.amountCents !== null && (
                <span
                  className={`shrink-0 font-semibold tabular-nums text-xs ${
                    log.amountCents >= 0 ? 'text-emerald-400' : 'text-foreground'
                  }`}
                >
                  {log.amountCents >= 0 ? '+' : '-'}
                  {formatUsdFromCents(Math.abs(log.amountCents))}
                </span>
              )}
            </div>
          ))}
        </div>

        {logs.length > 6 && (
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => setShowAllLogs((p) => !p)}
              className="min-h-9 px-3 text-xs font-semibold text-subtle hover:text-foreground cursor-pointer"
            >
              {showAllLogs
                ? 'Show fewer entries'
                : `Show all ${logs.length} entries`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

interface SettingsViewProps {
  username: string;
  activeTheme: ThemeId;
  onUpdateUsername: (nextName: string) => void;
  onSelectTheme: (theme: ThemeId) => void;
  onResetPlatform: () => void;
  onBackToGenerator: () => void;
}

export function SettingsView({
  username,
  activeTheme,
  onUpdateUsername,
  onSelectTheme,
  onResetPlatform,
  onBackToGenerator,
}: SettingsViewProps) {
  const [draftName, setDraftName] = useState(username);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = draftName.trim().slice(0, 28);
    if (cleaned) {
      onUpdateUsername(cleaned);
    }
  };

  return (
    <section aria-labelledby="settings-heading" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1
            id="settings-heading"
            className="text-xl font-bold tracking-tight text-foreground"
          >
            Settings
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            Customize appearance theme and header username
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToGenerator}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-surface-band px-3.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface cursor-pointer whitespace-nowrap"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-accent-icon" />
          <span>Key Generator</span>
        </button>
      </div>

      {/* Appearance Theme Selector (Moved from Header into Settings) */}
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-bold text-foreground">Color Theme</h2>
          <p className="text-xs text-muted">
            Choose a dark, pure black, white, or accent theme
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Color theme options"
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
        >
          {THEME_OPTIONS.map((opt) => {
            const selected = activeTheme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onSelectTheme(opt.id)}
                className={`flex min-h-[52px] items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                  selected
                    ? 'bg-primary/18 text-foreground ring-2 ring-primary'
                    : 'bg-surface-band text-foreground/90 hover:bg-surface'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 rounded-full ring-1 ring-foreground/20"
                    style={{ backgroundColor: opt.swatch }}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {opt.name}
                    </span>
                    <span className="block truncate text-[11.5px] text-muted">
                      {opt.hint}
                    </span>
                  </span>
                </span>
                {selected && (
                  <Check className="h-4 w-4 shrink-0 text-accent-icon" strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Header Username */}
      <form onSubmit={handleSaveName} className="space-y-2.5 pt-2">
        <label
          htmlFor="settings-username-input"
          className="block text-sm font-bold text-foreground"
        >
          Display Username
        </label>
        <div className="flex flex-wrap gap-2.5">
          <input
            id="settings-username-input"
            type="text"
            maxLength={28}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="Enter username"
            className="min-h-11 min-w-0 flex-1 rounded-xl bg-surface-band px-3.5 text-sm text-foreground placeholder:text-muted/65 focus-visible:outline-2 focus-visible:outline-primary"
          />
          <Button type="submit" tone="primary" className="min-h-11 px-4 text-sm">
            Save Name
          </Button>
        </div>
      </form>

      {/* Reset Platform Data */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/55 pt-4">
        <div>
          <div className="text-sm font-semibold text-foreground">
            Reset Platform Data
          </div>
          <div className="text-xs text-muted">
            Restore initial reseller credit and default seed keys
          </div>
        </div>

        {!confirmingReset ? (
          <button
            type="button"
            onClick={() => setConfirmingReset(true)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-surface-band px-3.5 text-xs font-semibold text-foreground hover:bg-surface cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5 text-accent-icon" />
            <span>Reset All</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onResetPlatform();
                setDraftName('InfinityMods');
                setConfirmingReset(false);
              }}
              className="inline-flex min-h-10 items-center rounded-xl bg-rose-500/20 px-3.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/30 cursor-pointer whitespace-nowrap"
            >
              Confirm Reset
            </button>
            <button
              type="button"
              onClick={() => setConfirmingReset(false)}
              className="inline-flex min-h-10 items-center rounded-xl px-3 text-xs font-medium text-muted hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
