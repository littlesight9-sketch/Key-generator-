import type {
  ActivityLogItem,
  LicenseKeyRecord,
  PlatformState,
  ProductOption,
  ThemeId,
  ValidityOption,
} from '../types/license';

export const STORAGE_KEY = 'license_premium_platform_v1';

export const THEME_OPTIONS: {
  id: ThemeId;
  name: string;
  swatch: string;
  hint: string;
}[] = [
  { id: 'dark', name: 'Obsidian Violet', swatch: '#be26ff', hint: 'Default dark plum' },
  { id: 'black', name: 'Pure Black', swatch: '#18181b', hint: 'OLED monochrome' },
  { id: 'light', name: 'Clean White', swatch: '#f8fafc', hint: 'Crisp slate daylight' },
  { id: 'midnight', name: 'Midnight Cobalt', swatch: '#3b82f6', hint: 'Deep navy blue' },
  { id: 'emerald', name: 'Emerald Matrix', swatch: '#10b981', hint: 'Dark pine green' },
  { id: 'crimson', name: 'Crimson Velvet', swatch: '#f43f5e', hint: 'Dark ruby red' },
  { id: 'amber', name: 'Obsidian Gold', swatch: '#f59e0b', hint: 'Warm amber gold' },
  { id: 'cyber', name: 'Cyber Cyan', swatch: '#06b6d4', hint: 'Slate cyan' },
  { id: 'sakura', name: 'Rose Noir', swatch: '#ec4899', hint: 'Charcoal pink' },
];

export const PRODUCTS: ProductOption[] = [
  {
    id: 'fluorite-ff-ios',
    name: 'Fluorite FF IOS',
    prefix: 'FLFF',
    platform: 'iOS Non-JB / TrollStore',
    priceMultiplier: 150,
  },
  {
    id: 'fluorite-mlbb-ios',
    name: 'Fluorite MLBB IOS',
    prefix: 'FLML',
    platform: 'iOS Non-JB / TrollStore',
    priceMultiplier: 150,
  },
  {
    id: 'fluorite-8bp-ios',
    name: 'Fluorite 8BP IOS',
    prefix: 'FL8B',
    platform: 'iOS Non-JB / TrollStore',
    priceMultiplier: 140,
  },
  {
    id: 'cloud-codm-ios',
    name: 'Cloud CODM IOS',
    prefix: 'CLCD',
    platform: 'iOS 16–18 IPA',
    priceMultiplier: 160,
  },
  {
    id: 'drip-android-apkmod',
    name: 'Drip Android ApkMod',
    prefix: 'DRIP',
    platform: 'Android Non-Root / Root',
    priceMultiplier: 100,
  },
  {
    id: 'drip-proxy-apk',
    name: 'Drip Proxy Apk',
    prefix: 'DRPX',
    platform: 'Android Network Proxy',
    priceMultiplier: 100,
  },
  {
    id: '8ball-ios-gbd',
    name: '8ball IOS GBD',
    prefix: '8BGB',
    platform: 'iOS IPA',
    priceMultiplier: 130,
  },
  {
    id: 'drip-aimkill-pc',
    name: 'Drip Aimkill Pc',
    prefix: 'DRAK',
    platform: 'Windows 10 / 11 x64',
    priceMultiplier: 200,
  },
  {
    id: 'drip-silentaim-pc',
    name: 'Drip SilentAim Pc',
    prefix: 'DRSA',
    platform: 'Windows 10 / 11 x64',
    priceMultiplier: 200,
  },
  {
    id: 'gbox-ios-signer',
    name: 'Gbox IOS Signer',
    prefix: 'GBOX',
    platform: 'iOS Enterprise Signer',
    priceMultiplier: 120,
  },
  {
    id: 'easy-victory-8bp',
    name: 'Easy Victory 8BP',
    prefix: 'EZ8B',
    platform: 'Android / Emulator',
    priceMultiplier: 120,
  },
];

export const VALIDITY_OPTIONS: ValidityOption[] = [
  {
    id: '1d',
    daysLabel: '1 Days',
    durationCode: '1D',
    days: 1,
    baseCents: 100,
  },
  {
    id: '3d',
    daysLabel: '3 Days',
    durationCode: '3D',
    days: 3,
    baseCents: 250,
  },
  {
    id: '7d',
    daysLabel: '7 Days',
    durationCode: '7D',
    days: 7,
    baseCents: 500,
  },
  {
    id: '14d',
    daysLabel: '14 Days',
    durationCode: '14D',
    days: 14,
    baseCents: 850,
  },
  {
    id: '30d',
    daysLabel: '30 Days',
    durationCode: '30D',
    days: 30,
    baseCents: 1500,
  },
  {
    id: 'lifetime',
    daysLabel: 'Lifetime',
    durationCode: 'LT',
    days: null,
    baseCents: 4500,
  },
];

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatUsdFromCents(cents: number): string {
  const safeCents = Number.isFinite(cents) ? Math.round(cents) : 0;
  return usdFormatter.format(safeCents / 100);
}

/**
 * Computes unit cost in integer cents for a product + validity tier.
 * Known test case: Drip Android ApkMod (multiplier 100) + 1 Days (baseCents 100) => 100 cents ($1.00).
 * Invariant: computeBatchTotalCents(product, validity, q) === computeUnitPriceCents(product, validity) * q for integer q >= 1.
 */
export function computeUnitPriceCents(
  product: ProductOption,
  validity: ValidityOption
): number {
  return Math.round((validity.baseCents * product.priceMultiplier) / 100);
}

export function computeBatchTotalCents(
  product: ProductOption,
  validity: ValidityOption,
  quantity: number
): number {
  const clampedQty = clampQuantity(quantity);
  return computeUnitPriceCents(product, validity) * clampedQty;
}

export function formatValidityDropdownLabel(
  product: ProductOption,
  validity: ValidityOption
): string {
  const unitCents = computeUnitPriceCents(product, validity);
  return `${validity.daysLabel} - ${formatUsdFromCents(unitCents)}`;
}

export function clampQuantity(value: number): number {
  if (!Number.isFinite(value) || Number.isNaN(value)) return 1;
  return Math.min(100, Math.max(1, Math.floor(value)));
}

const KEY_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function randomChars(length: number): string {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  let out = '';
  for (let i = 0; i < length; i++) {
    out += KEY_ALPHABET[bytes[i] % KEY_ALPHABET.length];
  }
  return out;
}

export function generateLicenseKeyString(
  product: ProductOption,
  validity: ValidityOption
): string {
  return [
    product.prefix,
    validity.durationCode,
    randomChars(4),
    randomChars(4),
    randomChars(4),
  ].join('-');
}

export function createBatchRecords(
  product: ProductOption,
  validity: ValidityOption,
  quantity: number
): LicenseKeyRecord[] {
  const safeQty = clampQuantity(quantity);
  const unitCents = computeUnitPriceCents(product, validity);
  const nowIso = new Date().toISOString();
  const seen = new Set<string>();
  const records: LicenseKeyRecord[] = [];

  for (let i = 0; i < safeQty; i++) {
    let keyStr = generateLicenseKeyString(product, validity);
    while (seen.has(keyStr)) {
      keyStr = generateLicenseKeyString(product, validity);
    }
    seen.add(keyStr);
    records.push({
      id: `lic_${Date.now()}_${i}_${randomChars(5)}`,
      key: keyStr,
      productId: product.id,
      productName: product.name,
      validityId: validity.id,
      validityLabel: validity.daysLabel,
      days: validity.days,
      costCents: unitCents,
      status: 'unused',
      hwid: null,
      createdAtIso: nowIso,
      activatedAtIso: null,
    });
  }

  return records;
}

export function buildDefaultState(): PlatformState {
  const now = Date.now();
  const d1 = new Date(now - 1000 * 60 * 42).toISOString();
  const d2 = new Date(now - 1000 * 60 * 195).toISOString();
  const d3 = new Date(now - 1000 * 60 * 510).toISOString();

  const seededKeys: LicenseKeyRecord[] = [
    {
      id: 'seed_1',
      key: 'DRIP-7D-8K4M-9X2P-W7Q5',
      productId: 'drip-android-apkmod',
      productName: 'Drip Android ApkMod',
      validityId: '7d',
      validityLabel: '7 Days',
      days: 7,
      costCents: 500,
      status: 'active',
      hwid: 'AND-98F4-2C19-E7B0',
      createdAtIso: d1,
      activatedAtIso: new Date(now - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'seed_2',
      key: 'DRIP-1D-3N7V-5L9R-T4H2',
      productId: 'drip-android-apkmod',
      productName: 'Drip Android ApkMod',
      validityId: '1d',
      validityLabel: '1 Days',
      days: 1,
      costCents: 100,
      status: 'unused',
      hwid: null,
      createdAtIso: d2,
      activatedAtIso: null,
    },
    {
      id: 'seed_3',
      key: 'FLFF-30D-6P2W-4Q8K-M5J9',
      productId: 'fluorite-ff-ios',
      productName: 'Fluorite FF IOS',
      validityId: '30d',
      validityLabel: '30 Days',
      days: 30,
      costCents: 2250,
      status: 'active',
      hwid: 'IOS-UDID-77A3-91D4',
      createdAtIso: d3,
      activatedAtIso: new Date(now - 1000 * 60 * 480).toISOString(),
    },
  ];

  const seededLogs: ActivityLogItem[] = [
    {
      id: 'log_seed_1',
      action: 'Generated 1 key',
      detail: 'Drip Android ApkMod · 7 Days',
      amountCents: -500,
      timestampIso: d1,
    },
    {
      id: 'log_seed_2',
      action: 'Generated 1 key',
      detail: 'Drip Android ApkMod · 1 Days',
      amountCents: -100,
      timestampIso: d2,
    },
    {
      id: 'log_seed_3',
      action: 'Reseller Wallet Funded',
      detail: 'Platform credit deposit',
      amountCents: 25000,
      timestampIso: d3,
    },
  ];

  return {
    version: 1,
    username: 'InfinityMods',
    balanceCents: 24400,
    keys: seededKeys,
    logs: seededLogs,
  };
}

export function loadPlatformState(): PlatformState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefaultState();
    const parsed = JSON.parse(raw) as Partial<PlatformState>;
    if (
      parsed.version !== 1 ||
      typeof parsed.balanceCents !== 'number' ||
      !Array.isArray(parsed.keys) ||
      !Array.isArray(parsed.logs)
    ) {
      return buildDefaultState();
    }
    return {
      version: 1,
      username:
        typeof parsed.username === 'string' && parsed.username.trim()
          ? parsed.username.trim()
          : 'InfinityMods',
      balanceCents: parsed.balanceCents,
      keys: parsed.keys,
      logs: parsed.logs,
    };
  } catch {
    return buildDefaultState();
  }
}

export function savePlatformState(state: PlatformState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function formatShortTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  } catch {
    return 'Unknown date';
  }
}
