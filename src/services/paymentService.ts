import { API_BASE, authHeaders, getAuthToken } from "./authService";

export interface DemoPaymentInfo {
  billingId: number;
  amount: number;
  amountLabel: string;
  description: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrImageUrl: string;
  note?: string;
}

interface DemoPaymentOptions {
  billingId: number;
  amount?: number;
  accountNumber?: string;
  accountName?: string;
  bankCode?: string;
  bankName?: string;
  description?: string;
}

export interface PayOSPaymentLinkResponse {
  orderCode?: number;
  amount?: number;
  description?: string;
  status?: string;
  paymentLinkId?: string;
  checkoutUrl?: string;
  qrCode?: string;
  currency?: string;
  expiredAt?: number;
  code?: string | number;
  desc?: string;
  deeplink?: string;
  message?: string;
  error?: string;
  bin?: string;
  accountName?: string;
  accountNumber?: string;
  [key: string]: unknown;
}

const DEFAULT_BANK_CODE = "970422"; // MB Bank
const DEFAULT_ACCOUNT_NUMBER = "0867976303";
const DEFAULT_ACCOUNT_NAME = "NGUYEN MINH HUNG";
const DEFAULT_BANK_NAME = "Ngân hàng TMCP Quân đội (MB)";
const PAYOS_BASE = `${API_BASE}/payments`;

function requireToken(): string {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Vui lòng đăng nhập để thanh toán qua PayOS");
  }
  return token;
}

export async function createPayOSPaymentLink(
  billingId: number
): Promise<PayOSPaymentLinkResponse> {
  if (!Number.isFinite(billingId)) {
    throw new Error("Mã hóa đơn không hợp lệ");
  }

  const token = requireToken();
  const resp = await fetch(`${PAYOS_BASE}/create`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ billingId }),
  });

  const data: PayOSPaymentLinkResponse = await resp
    .json()
    .catch(() => ({} as PayOSPaymentLinkResponse));

  if (!resp.ok) {
    const message =
      data?.message ||
      data?.error ||
      (typeof data?.desc === "string" ? data.desc : undefined) ||
      resp.statusText ||
      "Không tạo được liên kết thanh toán";
    throw new Error(message);
  }

  return data;
}

export async function mockMarkPaymentAsPaid(billingId: number): Promise<void> {
  if (!Number.isFinite(billingId)) {
    throw new Error("Mã hóa đơn không hợp lệ");
  }
  const token = requireToken();
  const resp = await fetch(`${PAYOS_BASE}/mock/mark-paid?billingId=${billingId}`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({})) as { message?: string; error?: string };
    const message = data?.message || data?.error || resp.statusText;
    throw new Error(`Không thể đánh dấu thanh toán: ${message}`);
  }
}

export function extractCheckoutUrl(
  payload: PayOSPaymentLinkResponse | null | undefined
): string | undefined {
  if (!payload) return undefined;
  if (typeof payload.checkoutUrl === "string" && payload.checkoutUrl.length > 0) {
    return payload.checkoutUrl;
  }
  if (typeof payload.deeplink === "string" && payload.deeplink.length > 0) {
    return payload.deeplink;
  }
  const data: any = (payload as any).data;
  if (data && typeof data.checkoutUrl === "string") {
    return data.checkoutUrl;
  }
  if (data && typeof data.deeplink === "string") {
    return data.deeplink;
  }
  return undefined;
}

export function extractQrCode(
  payload: PayOSPaymentLinkResponse | null | undefined
): string | undefined {
  if (!payload) return undefined;
  if (typeof payload.qrCode === "string" && payload.qrCode.length > 0) {
    return payload.qrCode;
  }
  const data: any = (payload as any).data;
  if (data && typeof data.qrCode === "string" && data.qrCode.length > 0) {
    return data.qrCode;
  }
  return undefined;
}

export async function createDemoPaymentInfo(
  options: DemoPaymentOptions
): Promise<DemoPaymentInfo> {
  const {
    billingId,
    amount,
    accountNumber = DEFAULT_ACCOUNT_NUMBER,
    accountName = DEFAULT_ACCOUNT_NAME,
    bankCode = DEFAULT_BANK_CODE,
    bankName = DEFAULT_BANK_NAME,
    description = `Thanh toán đơn hàng #${billingId}`,
  } = options;

  if (!Number.isFinite(billingId)) {
    throw new Error("billingId không hợp lệ");
  }

  const normalizedAmount = Math.max(1, Math.round(amount ?? 0));
  const formattedAmount = normalizedAmount.toLocaleString("vi-VN") + " ₫";
  const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact.png?amount=${normalizedAmount}&addInfo=${encodeURIComponent(
    description
  )}`;

  return {
    billingId,
    amount: normalizedAmount,
    amountLabel: formattedAmount,
    description,
    bankName,
    accountName,
    accountNumber,
    qrImageUrl: qrUrl,
    note: "Scan QR code hoặc chuyển khoản vào tài khoản trên để thanh toán. Sau khi chuyển khoản, nhân viên sẽ xác nhận và cập nhật trạng thái.",
  };
}
