import { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  FileSpreadsheet,
  History,
  KeyRound,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import type { LicenseKeyRecord, LicenseStatus } from '../types/license';
import { formatShortTimestamp, formatUsdFromCents } from '../lib/licenseEngine';
import { OpenBoxGlyph } from './Icons';

interface ManageKeysViewProps {
  keys: LicenseKeyRecord[];
  onCopyText: (text: string, label: string) => void;
  onResetHwid: (id: string) => void;
  onRevokeKey: (id: string) => void;
  onDeleteKey: (id: string) => void;
  onBackToGenerator: () => void;
}

export function ManageKeysView({
  keys,
  onCopyText,
  onResetHwid,
  onRevokeKey,
  onDeleteKey,
}: ManageKeysViewProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LicenseStatus>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const counts = useMemo(
    () => ({
      all: keys.length,
      unused: keys.filter((k) => k.status === 'unused').length,
      active: keys.filter((k) => k.status === 'active').length,
      revoked: keys.filter((k) => k.status === 'revoked').length,
    }),
    [keys]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return keys.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!q) return true;
      return (
        item.key.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.validityLabel.toLowerCase().includes(q) ||
        formatShortTimestamp(item.createdAtIso).toLowerCase().includes(q) ||
        (item.hwid && item.hwid.toLowerCase().includes(q))
      );
    });
  }, [keys, query, statusFilter]);

  const visibleItems = showAll ? filtered : filtered.slice(0, 10);

  const handleCopySingle = (record: LicenseKeyRecord) => {
    onCopyText(record.key, record.key);
    setCopiedId(record.id);
    setTimeout(() => setCopiedId(null), 1400);
  };

  const handleDownloadCsv = () => {
    if (filtered.length === 0) return;
    const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const header = [
      'Key',
      'Product',
      'Source',
      'Days',
      'Status',
      'HWID',
      'Created',
    ].join(',');
    const rows = filtered.map((k) =>
      [
        escapeCsv(k.key),
        escapeCsv(k.productName),
        escapeCsv(formatUsdFromCents(k.costCents)),
        escapeCsv(k.days === null ? 'Lifetime' : `${k.days} Days`),
        escapeCsv(k.status.toUpperCase()),
        escapeCsv(k.hwid ?? ''),
        escapeCsv(formatShortTimestamp(k.createdAtIso)),
      ].join(',')
    );
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `key-history-${filtered.length}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filterTabs: {
    id: 'all' | LicenseStatus;
    label: string;
    count: number;
  }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'unused', label: 'Unused', count: counts.unused },
    { id: 'active', label: 'Active', count: counts.active },
    { id: 'revoked', label: 'Revoked', count: counts.revoked },
  ];

  return (
    <section aria-labelledby="manage-keys-heading" className="space-y-4">
      {/* KEY HISTORY Title Strip matching screenshot */}
      <div className="card-top-glow rounded-xl bg-surface px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <History className="h-[17px] w-[17px] shrink-0 text-accent-icon" />
          <h1
            id="manage-keys-heading"
            className="text-[15px] font-bold tracking-[0.09em] text-foreground uppercase"
          >
            KEY HISTORY
          </h1>
        </div>
      </div>

      {/* Search Bar matching screenshot */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-accent-icon" />
          <input
            type="search"
            aria-label="Search keys, products, dates"
            placeholder="Search keys, products, dates..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[42px] w-full rounded-xl bg-well pl-10 pr-9 text-[13.5px] text-foreground placeholder:text-muted/65 focus-visible:outline-2 focus-visible:outline-primary"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Tabs + Copy All */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
          <div
            role="tablist"
            aria-label="Filter keys by status"
            className="flex flex-wrap items-center gap-4"
          >
            {filterTabs.map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`relative pb-1 text-[12.5px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'text-foreground font-semibold'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="ml-1 text-[11px] tabular-nums text-muted">
                    ({tab.count})
                  </span>
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-primary"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={filtered.length === 0}
            onClick={() =>
              onCopyText(
                filtered.map((k) => k.key).join('\n'),
                `${filtered.length} keys`
              )
            }
            className="inline-flex min-h-7 items-center gap-1 text-xs font-medium text-muted hover:text-foreground disabled:opacity-40 cursor-pointer whitespace-nowrap"
          >
            <Copy className="h-3.5 w-3.5 text-accent-icon" />
            <span>Copy All</span>
          </button>
        </div>
      </div>

      {/* Structured 4-Column Ledger */}
      <div className="overflow-hidden rounded-xl bg-surface/65">
        {/* Column Header Bar matching screenshot: KEY | PRODUCT | SRC | DAYS */}
        <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(0,1.1fr)_58px_46px] items-center gap-2 bg-surface-band px-3.5 py-2.5 text-[11px] font-semibold tracking-[0.07em] text-muted uppercase">
          <div className="flex items-center gap-1.5 min-w-0">
            <KeyRound className="h-3.5 w-3.5 shrink-0 text-accent-icon" />
            <span>KEY</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <OpenBoxGlyph className="h-3.5 w-3.5 shrink-0 text-accent-icon" />
            <span>PRODUCT</span>
          </div>
          <div className="text-right">SRC</div>
          <div className="text-right">DAYS</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border/50">
          {visibleItems.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">
                No license keys found
              </p>
              <p className="mt-1 text-xs text-muted">
                Generate keys in Key Generator or adjust your search filter.
              </p>
            </div>
          ) : (
            visibleItems.map((record) => {
              const isCopied = copiedId === record.id;
              const shortDays =
                record.days === null ? 'LT' : `${record.days}D`;
              const statusColor =
                record.status === 'active'
                  ? 'text-emerald-400'
                  : record.status === 'revoked'
                  ? 'text-rose-400'
                  : 'text-subtle';

              return (
                <div key={record.id} className="px-3.5 py-3 space-y-2.5">
                  {/* Top Structured 4-Column Row */}
                  <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(0,1.1fr)_58px_46px] items-start gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopySingle(record)}
                      title="Click to copy key"
                      className="min-w-0 text-left font-mono text-[12px] leading-snug font-medium text-foreground break-all hover:text-accent-icon transition-colors cursor-pointer"
                    >
                      {record.key}
                    </button>

                    <div className="min-w-0 text-[12.5px] leading-snug font-medium text-foreground/90">
                      {record.productName}
                    </div>

                    <div className="text-right text-[12px] font-medium tabular-nums text-muted">
                      {formatUsdFromCents(record.costCents)}
                    </div>

                    <div className="text-right text-[12px] font-semibold tabular-nums text-foreground">
                      {shortDays}
                    </div>
                  </div>

                  {/* Structured Status + Actions Sub-Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-muted">
                      <span className={`font-semibold capitalize ${statusColor}`}>
                        ● {record.status}
                      </span>
                      <span>·</span>
                      <span>{formatShortTimestamp(record.createdAtIso)}</span>
                      {record.hwid && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-[11px] text-foreground/75">
                            {record.hwid}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopySingle(record)}
                        className="inline-flex min-h-[30px] items-center gap-1 rounded-lg bg-well px-2.5 text-[11.5px] font-medium text-foreground hover:bg-surface-band cursor-pointer whitespace-nowrap"
                      >
                        {isCopied ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3 text-accent-icon" />
                        )}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>

                      {record.hwid && record.status !== 'revoked' && (
                        <button
                          type="button"
                          onClick={() => onResetHwid(record.id)}
                          className="inline-flex min-h-[30px] items-center gap-1 rounded-lg bg-well px-2.5 text-[11.5px] font-medium text-foreground hover:bg-surface-band cursor-pointer whitespace-nowrap"
                        >
                          <RotateCcw className="h-3 w-3 text-accent-icon" />
                          <span>Reset HWID</span>
                        </button>
                      )}

                      {record.status !== 'revoked' ? (
                        <button
                          type="button"
                          onClick={() => onRevokeKey(record.id)}
                          className="inline-flex min-h-[30px] items-center rounded-lg bg-well px-2.5 text-[11.5px] font-medium text-muted hover:text-rose-400 cursor-pointer whitespace-nowrap"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onDeleteKey(record.id)}
                          className="inline-flex min-h-[30px] items-center gap-1 rounded-lg bg-well px-2.5 text-[11.5px] font-medium text-rose-400 hover:bg-rose-500/15 cursor-pointer whitespace-nowrap"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {filtered.length > 10 && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="min-h-8 px-3 text-xs font-medium text-muted hover:text-foreground cursor-pointer"
          >
            {showAll
              ? 'Show fewer keys'
              : `Show all ${filtered.length} keys`}
          </button>
        </div>
      )}

      {/* Centered Glowing DOWNLOAD CSV Button matching screenshot */}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={handleDownloadCsv}
          disabled={filtered.length === 0}
          className="cta-purple-btn inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl px-5 text-[12.5px] font-semibold tracking-[0.06em] text-primary-foreground uppercase transition-[transform,filter,box-shadow] duration-150 ease-out active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer whitespace-nowrap disabled:opacity-45 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet className="h-4 w-4 shrink-0" />
          <span>DOWNLOAD CSV</span>
        </button>
      </div>
    </section>
  );
}
