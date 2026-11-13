export type AppView = 'generator' | 'keys' | 'validator' | 'wallet' | 'settings';

export type ThemeId =
  | 'dark'
  | 'black'
  | 'light'
  | 'midnight'
  | 'emerald'
  | 'crimson'
  | 'amber'
  | 'cyber'
  | 'sakura';

export interface ProductOption {
  id: string;
  name: string;
  prefix: string;
  platform: string;
  priceMultiplier: number; // integer percent e.g. 100 = 1.0x
}

export interface ValidityOption {
  id: string;
  daysLabel: string;
  durationCode: string;
  days: number | null; // null = Lifetime
  baseCents: number;
}

export type LicenseStatus = 'unused' | 'active' | 'revoked';

export interface LicenseKeyRecord {
  id: string;
  key: string;
  productId: string;
  productName: string;
  validityId: string;
  validityLabel: string;
  days: number | null;
  costCents: number;
  status: LicenseStatus;
  hwid: string | null;
  createdAtIso: string;
  activatedAtIso: string | null;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  detail: string;
  amountCents: number | null; // negative for debit, positive for credit
  timestampIso: string;
}

export interface PlatformState {
  version: number;
  username: string;
  balanceCents: number;
  keys: LicenseKeyRecord[];
  logs: ActivityLogItem[];
}
