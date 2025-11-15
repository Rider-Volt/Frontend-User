export type IdentityStatus = "PENDING" | "APPROVED" | "REJECTED" | string;

export type IdentityAssetType =
  | "CCCD_FRONT"
  | "CCCD_BACK"
  | "GPLX_FRONT"
  | "GPLX_BACK"
  | string;

export interface IdentityAsset {
  id?: number;
  type?: IdentityAssetType;
  url?: string;
  note?: string | null;
  takenAt?: string | null;
  takenBy?: number | null;
}

export interface IdentitySet {
  id: number;
  cccdNumber?: string | null;
  gplxNumber?: string | null;
  note?: string | null;
  status?: IdentityStatus;
  reviewNote?: string | null;
  reviewedBy?: number | null;
  reviewedAt?: string | null;
  assets: IdentityAsset[];
}

