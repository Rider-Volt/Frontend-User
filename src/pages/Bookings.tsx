import { useCallback, useEffect, useMemo, useState } from "react";
import { differenceInHours, format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Car,
  Clock,
  CreditCard,
  FileText,
  Loader2,
  MapPin,
  User,
} from "lucide-react";

import Navbar from "@/components/heroUi/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  BookingStatuses,
  getBookingHistory,
  saveBookingHistory,
  StoredBooking,
} from "@/services/bookingService";
import { getCurrentUser } from "@/services/authService";
import { listMyBillings, type BillingStatus, cancelBilling, getBillingDetail } from "@/services/renterBillingService";
import {
  createPayOSPaymentLink,
  extractCheckoutUrl,
  extractQrCode,
  mockMarkPaymentAsPaid,
  type PayOSPaymentLinkResponse,
  createDemoPaymentInfo,
  type DemoPaymentInfo,
} from "@/services/paymentService";

type ToastFn = ReturnType<typeof useToast>["toast"];

const statusColor = (status: BillingStatus) => {
  switch (status) {
    case "WAITING":
      return "bg-amber-100 text-amber-800";
    case "PAYED":
      return "bg-emerald-100 text-emerald-800";
    case "RENTING":
      return "bg-sky-100 text-sky-800";
    case "DONE":
      return "bg-gray-100 text-gray-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const statusText = (status: BillingStatus) => {
  switch (status) {
    case "WAITING":
      return "Chờ thanh toán";
    case "PAYED":
      return "Đã thanh toán";
    case "RENTING":
      return "Đang thuê";
    case "DONE":
      return "Hoàn thành";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status;
  }
};

const paymentMethodText = (method?: string) => {
  switch (method) {
    case "credit-card":
      return "Thẻ tín dụng";
    case "momo":
      return "Ví MoMo";
    case "zalopay":
      return "Ví ZaloPay";
    case "cash":
      return "Tiền mặt";
    default:
      return method || "Chưa chọn";
  }
};

const fallbackImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9Ijk2IiB2aWV3Qm94PSIwIDAgMTI4IDk2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iOTYiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI2NCIgeT0iNTIiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RVY8L3RleHQ+PC9zdmc+";

const formatDate = (value?: string | null, pattern = "dd/MM/yyyy") => {
  if (!value) return "—";
  try {
    return format(parseISO(value), pattern, { locale: vi });
  } catch {
    return value;
  }
};

const formatDateTime = (value?: string | null) =>
  formatDate(value, "dd/MM/yyyy HH:mm");

const formatCurrency = (value?: number | null) => {
  if (value == null) return "—";
  return (
    Number(value).toLocaleString("vi-VN", {
      maximumFractionDigits: 0,
    }) + "₫"
  );
};

const parseTime = (value?: string | null) => {
  if (!value) return 0;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const formatEpochSeconds = (value?: number | null) => {
  if (!value) return "—";
  try {
    return format(new Date(value * 1000), "dd/MM/yyyy HH:mm", { locale: vi });
  } catch {
    return `${value}`;
  }
};

const mergeBookings = (
  remote: StoredBooking[],
  local: StoredBooking[]
): StoredBooking[] => {
  const localById = new Map<number, StoredBooking>();
  local.forEach((entry) => {
    const id = entry.id ?? entry.bookingId;
    if (id != null) {
      localById.set(id, entry);
    }
  });

  const mergedRemote = remote.map((entry) => {
    const id = entry.id ?? entry.bookingId;
    const localEntry = id != null ? localById.get(id) : undefined;
    const merged: StoredBooking = {
      ...(localEntry ?? {}),
      ...entry,
      id,
      bookingId: id,
      status: entry.status,
    };

    if (localEntry) {
      if (localEntry.totalCharge != null && merged.totalCharge == null) {
        merged.totalCharge = localEntry.totalCharge;
      }
      if (localEntry.pickupLocation && !merged.pickupLocation) {
        merged.pickupLocation = localEntry.pickupLocation;
      }
      if (localEntry.paymentMethod && !merged.paymentMethod) {
        merged.paymentMethod = localEntry.paymentMethod;
      }
      if (localEntry.localVehicleName && !merged.localVehicleName) {
        merged.localVehicleName = localEntry.localVehicleName;
      }
      if (localEntry.localVehicleImage && !merged.localVehicleImage) {
        merged.localVehicleImage = localEntry.localVehicleImage;
      }
    }

    return merged;
  });

  const remoteIds = new Set(
    mergedRemote.map((entry) => entry.id ?? entry.bookingId)
  );
  const onlyLocal = local.filter((entry) => {
    const id = entry.id ?? entry.bookingId;
    return id == null || !remoteIds.has(id);
  });

  const combined = [...mergedRemote, ...onlyLocal];
  combined.sort((a, b) => {
    const timeA = parseTime((a as any).startDay) || parseTime(a.bookingTime);
    const timeB = parseTime((b as any).startDay) || parseTime(b.bookingTime);
    return timeB - timeA;
  });

  return combined;
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <Icon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
);

const PaymentDialog = ({
  state,
  onClose,
  toast,
  onSuccess,
}: {
  state:
    | null
    | {
        bookingId: number;
        payload: PayOSPaymentLinkResponse | DemoPaymentInfo;
        checkoutUrl?: string;
        qrUrl?: string;
      };
  onClose: () => void;
  toast?: ToastFn;
  onSuccess?: () => Promise<void> | void;
}) => {
  if (!state) return null;
  const { bookingId, payload, checkoutUrl, qrUrl } = state;
  
  // Check if this is DemoPaymentInfo (VietQR) or PayOSPaymentLinkResponse
  const isVietQR = 'bankName' in payload && 'accountName' in payload && 'accountNumber' in payload;
  
  const amountLabel =
    typeof payload.amount === "number"
      ? formatCurrency(payload.amount)
      : undefined;
  const expiryLabel = 'expiredAt' in payload ? formatEpochSeconds(payload.expiredAt) : "—";
  
  // Get VietQR bank info if available
  const bankInfo = isVietQR ? {
    bankName: (payload as DemoPaymentInfo).bankName,
    accountName: (payload as DemoPaymentInfo).accountName,
    accountNumber: (payload as DemoPaymentInfo).accountNumber,
    note: (payload as DemoPaymentInfo).note
  } : null;

const handleCopyLink = async () => {
  if (!checkoutUrl) return;
  try {
    await navigator.clipboard.writeText(checkoutUrl);
    toast?.({
      title: "Đã sao chép liên kết thanh toán",
      description: checkoutUrl,
    });
  } catch (error) {
    console.warn("Không thể sao chép liên kết PayOS", error);
    toast?.({
      title: "Không thể sao chép liên kết",
      description: checkoutUrl,
      variant: "destructive",
    });
  }
};

  return (
    <Dialog open={!!state} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isVietQR ? `Thanh toán VietQR cho hóa đơn #${bookingId}` : `Thanh toán PayOS cho hóa đơn #${bookingId}`}
          </DialogTitle>
          <DialogDescription>
            {isVietQR 
              ? "Chuyển khoản vào tài khoản bên dưới hoặc scan QR code. Sau khi chuyển khoản thành công, nhân viên sẽ xác nhận và cập nhật trạng thái."
              : "Hoàn tất thanh toán bằng một trong các tùy chọn bên dưới. Sau khi hệ thống PayOS ghi nhận giao dịch, nhân viên sẽ phê duyệt để bạn tiếp tục quy trình thuê xe."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow
              icon={FileText}
              label="Mã hóa đơn"
              value={isVietQR ? `#${bookingId}` : (payload.paymentLinkId || `Billing #${bookingId}`)}
            />
            <InfoRow
              icon={CreditCard}
              label="Số tiền"
              value={isVietQR && 'amountLabel' in payload ? String(payload.amountLabel) : (amountLabel || "—")}
            />
            {!isVietQR && (
              <>
                <InfoRow icon={Calendar} label="Hết hạn" value={expiryLabel} />
                {'status' in payload && payload.status && (
                  <InfoRow
                    icon={CreditCard}
                    label="Trạng thái"
                    value={payload.status}
                  />
                )}
              </>
            )}
          </div>
          
          {isVietQR && bankInfo && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="mb-3 font-semibold">Thông tin ngân hàng nhận thanh toán</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoRow
                  icon={CreditCard}
                  label="Ngân hàng"
                  value={String(bankInfo.bankName)}
                />
                <InfoRow
                  icon={User}
                  label="Chủ tài khoản"
                  value={String(bankInfo.accountName)}
                />
                <InfoRow
                  icon={CreditCard}
                  label="Số tài khoản"
                  value={String(bankInfo.accountNumber)}
                />
              </div>
            </div>
          )}

          {(checkoutUrl || qrUrl) && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1"
                onClick={() =>
                  checkoutUrl &&
                  window.open(checkoutUrl, "_blank", "noopener,noreferrer")
                }
                disabled={!checkoutUrl}
              >
                Mở trang thanh toán
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCopyLink}
                disabled={!checkoutUrl}
              >
                Sao chép liên kết
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() =>
                  qrUrl && window.open(qrUrl, "_blank", "noopener,noreferrer")
                }
                disabled={!qrUrl}
              >
                Mở mã QR
              </Button>
            </div>
          )}

          {qrUrl && (
            <div className="space-y-2">
              <img
                src={qrUrl}
                alt="QR Code thanh toán"
                className="mx-auto h-64 w-64 rounded-md border bg-white p-3 shadow-sm"
              />
              <p className="text-center text-sm text-muted-foreground">
                Scan QR code bằng ứng dụng ngân hàng để chuyển khoản
              </p>
            </div>
          )}

          {bankInfo && bankInfo.note && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-900">{String(bankInfo.note)}</p>
            </div>
          )}

          {!isVietQR && (
            <p className="text-xs text-muted-foreground">
              Lưu ý: Thanh toán thành công không tự động chuyển sang &quot;Đã thanh
              toán&quot;. Nhân viên sẽ kiểm tra và xác nhận trước khi bạn có thể
              tiếp tục.
            </p>
          )}
        </div>
  <DialogFooter>
    <Button variant="secondary" onClick={onClose}>
      Đóng
    </Button>
    <Button
      onClick={() => onSuccess?.()}
      disabled={!onSuccess}
      className="bg-emerald-600 hover:bg-emerald-700 text-white"
    >
      {isVietQR ? "Đã chuyển khoản (xác nhận)" : "Thanh toán demo (đánh dấu thành công)"}
    </Button>
  </DialogFooter>
</DialogContent>
    </Dialog>
  );
};

const Bookings = () => {
  const [bookings, setBookings] = useState<StoredBooking[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [paymentDialog, setPaymentDialog] = useState<
    | null
    | {
        bookingId: number;
        payload: PayOSPaymentLinkResponse | DemoPaymentInfo;
        checkoutUrl?: string;
        qrUrl?: string;
      }
  >(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const loadBookings = useCallback(
    async (userId: number, options?: { silent?: boolean; forceRefresh?: boolean }) => {
      const localHistory = getBookingHistory(userId);
      if (!options?.silent) {
        setBookings(localHistory);
      }

      try {
        // Force refresh từ backend nếu được yêu cầu
        const remoteList = await listMyBillings();
        const normalizedRemote = remoteList.map((entry) => ({
          ...entry,
          bookingId: entry.id,
          // Map new API fields to legacy fields for backward compatibility
          startDay: (entry as any).plannedStartDate ?? (entry as any).startDay,
          endDay: (entry as any).plannedEndDate ?? (entry as any).endDay,
        })) as StoredBooking[];
        const merged = mergeBookings(normalizedRemote, localHistory);
        setBookings(merged);
        saveBookingHistory(userId, merged);
        setLastRefreshTime(Date.now());
        setError(null);
        return true;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Không tải được danh sách hóa đơn";
        
        // Don't show error if it's a server error (500) - just return empty
        if (message.includes("500") || message.includes("Lỗi hệ thống")) {
          setError(null);
          return true; // Return true with empty bookings
        }
        
        setError(message);
        if (!options?.silent) {
          toast({
            title: "Không thể đồng bộ hóa đơn",
            description: message,
            variant: "destructive",
          });
        }
        return false;
      }
    },
    [toast]
  );

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      setIsLoggedIn(false);
      setUsername("");
      setCurrentUserId(null);
      setBookings([]);
      setLoading(false);
      return;
    }

    setIsLoggedIn(true);
    setUsername(user.full_name || user.username || "Người dùng");
    const resolvedId = Number(user.id ?? user.userId);
    if (!Number.isFinite(resolvedId) || resolvedId <= 0) {
      setCurrentUserId(null);
      setBookings([]);
      setLoading(false);
      return;
    }

    setCurrentUserId(resolvedId);

    (async () => {
      setLoading(true);
      await loadBookings(resolvedId);
      setLoading(false);
    })();
  }, [loadBookings]);

  // Auto-refresh mỗi 30 giây để cập nhật trạng thái từ staff
  useEffect(() => {
    if (!currentUserId) return;
    
    const interval = setInterval(() => {
      loadBookings(currentUserId, { silent: true });
    }, 30000); // 30 giây

    return () => clearInterval(interval);
  }, [currentUserId, loadBookings]);

  const waitingBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "WAITING"),
    [bookings]
  );
  const payedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "PAYED"),
    [bookings]
  );
  const rentingBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "RENTING"),
    [bookings]
  );
  const doneBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "DONE"),
    [bookings]
  );
  const cancelledBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "CANCELLED"),
    [bookings]
  );

  const handleRefresh = async () => {
    if (!currentUserId) return;
    setRefreshing(true);
    
    // Clear cache để force refresh từ backend
    if (currentUserId) {
      localStorage.removeItem(`booking_history_${currentUserId}`);
    }
    
    const ok = await loadBookings(currentUserId, { silent: true, forceRefresh: true });
    setRefreshing(false);
    if (ok) {
      toast({
        title: "Đã cập nhật danh sách hóa đơn",
        description: "Trạng thái từ staff đã được đồng bộ",
      });
    }
  };

  const refreshSingleBooking = async (billingId: number) => {
    try {
      const updatedBilling = await getBillingDetail(billingId);
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === billingId || booking.bookingId === billingId
            ? { ...booking, ...updatedBilling, bookingId: updatedBilling.id }
            : booking
        )
      );
      return true;
    } catch (err) {
      console.error("Failed to refresh single booking:", err);
      return false;
    }
  };

  const handlePay = async (booking: StoredBooking) => {
    const billingId = booking.id ?? booking.bookingId;
    if (!billingId) {
      toast({
        title: "Không tìm thấy mã hóa đơn",
        variant: "destructive",
      });
      return;
    }

    try {
      setPayingId(billingId);
      const payload = await createPayOSPaymentLink(billingId);
      const checkoutUrl = extractCheckoutUrl(payload);
      const qrUrl = extractQrCode(payload);
      if (!checkoutUrl && !qrUrl) {
        toast({
          title: "Không tìm thấy liên kết PayOS",
          description: "Vui lòng thử lại sau hoặc liên hệ hỗ trợ.",
          variant: "destructive",
        });
        return;
      }
      setPaymentDialog({
        bookingId: billingId,
        payload,
        checkoutUrl,
        qrUrl,
      });
      toast({
        title: "Liên kết PayOS sẵn sàng",
        description: "Hoàn tất thanh toán trong cửa sổ popup.",
      });
    } catch (err) {
      toast({
        title: "Không tạo được liên kết thanh toán",
        description:
          err instanceof Error ? err.message : "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setPayingId(null);
    }
  };

  const renderList = (
    items: StoredBooking[],
    emptyTitle: string,
    emptyDesc: string
  ) => {
    if (loading) {
      return (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="flex items-center justify-center gap-3 py-16 bg-white">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <span className="text-gray-600 font-medium">Đang tải dữ liệu...</span>
          </CardContent>
        </Card>
      );
    }

    if (items.length === 0) {
      return (
        <Card className="border-gray-200 shadow-sm bg-gradient-to-br from-white to-gray-50">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <Car className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-900">{emptyTitle}</h3>
            <p className="text-gray-600 max-w-md mx-auto">{emptyDesc}</p>
          </CardContent>
        </Card>
      );
    }

    return items.map((booking, index) => {
      const id = booking.id ?? booking.bookingId;
      const total = booking.totalCost ?? booking.totalCharge ?? null;
      const start = formatDate((booking as any).startDay);
      const end = formatDate((booking as any).endDay);
      const bookingTime = formatDateTime(booking.bookingTime);
      const actualPickup = formatDateTime((booking as any).actualPickupAt);
      const actualReturn = formatDateTime((booking as any).actualReturnAt);
      
      // Only show return time if we have actual return time
      const showReturnTime = actualReturn !== "—";
      // Use rentedDay from API if available, otherwise calculate from dates
      const days = booking.rentedDay ?? (
        (booking as any).startDay && (booking as any).endDay
          ? Math.ceil(differenceInHours(
              parseISO((booking as any).endDay),
              parseISO((booking as any).startDay)
            ) / 24)
          : undefined
      );
      const vehicleName =
        booking.localVehicleName ?? booking.vehicleModel ?? `Hóa đơn #${id}`;
      const allowPay = booking.status === "WAITING";

      return (
        <Card key={id ?? `local-${index}`} className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-white pb-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="lg:w-32 lg:h-24 w-24 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                    <img
                      src={booking.localVehicleImage || fallbackImage}
                      alt={vehicleName}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        (event.target as HTMLImageElement).src = fallbackImage;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {vehicleName}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5 font-medium">
                        <FileText className="h-4 w-4 text-emerald-600" />
                        {id ? `#${id}` : "Chưa có mã"}
                      </span>
                      {booking.vehicleCode && (
                        <span className="flex items-center gap-1.5">
                          <Car className="h-4 w-4 text-gray-400" />
                          Mã xe: {booking.vehicleCode}
                        </span>
                      )}
                      {booking.stationName && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {booking.stationName}
                        </span>
                      )}
                      {booking.renterName && (
                        <span className="flex items-center gap-1.5">
                          <User className="h-4 w-4 text-gray-400" />
                          {booking.renterName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <Badge className={`${statusColor(booking.status)} shrink-0 font-semibold px-3 py-1.5 text-xs uppercase tracking-wide`}>
                {statusText(booking.status)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-5 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                      NGÀY THUÊ
                    </p>
                    <p className="text-sm font-semibold text-gray-900 break-words">
                      {start !== "—" && end !== "—" ? `${start} → ${end}` : "Chưa xác định"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                      TỔNG TIỀN
                    </p>
                    <p className="text-lg font-bold text-emerald-600">
                      {formatCurrency(total)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                      THỜI GIAN ĐẶT
                    </p>
                    <p className="text-sm font-semibold text-gray-900 break-words">
                      {bookingTime}
                    </p>
                  </div>
                </div>
              </div>

              {days != null && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                        SỐ NGÀY THUÊ
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {days} {days === 1 ? 'ngày' : 'ngày'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {actualPickup !== "—" && (
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-1">
                        Nhận xe thực tế
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {actualPickup}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {showReturnTime && (
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-1">
                        Trả xe thực tế
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {actualReturn}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {booking.pickupLocation && (
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-1">
                      ĐIỂM NHẬN XE
                    </p>
                    <p className="text-sm font-medium text-gray-900 break-words">
                      {booking.pickupLocation}
                    </p>
                  </div>
                </div>
              </div>
            )}


            {allowPay && (
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  onClick={async () => {
                    // VietQR payment with real bank account
                    const info = await createDemoPaymentInfo({
                      billingId: booking.bookingId,
                      amount: booking.totalCharge || 10000,
                    });
                    setPaymentDialog({
                      bookingId: booking.bookingId,
                      payload: info,
                      checkoutUrl: undefined,
                      qrUrl: info.qrImageUrl,
                    });
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 shadow-sm"
                >
                  Thanh toán VietQR
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      const billingId = booking.id ?? booking.bookingId;
                      if (!billingId) throw new Error("Không tìm thấy mã hóa đơn");
                      
                      await cancelBilling(billingId);
                      toast({
                        title: "Đã hủy đơn thành công",
                        description: `Hóa đơn #${billingId} đã được hủy.`,
                      });
                      // Refresh booking cụ thể thay vì refresh toàn bộ
                      await refreshSingleBooking(billingId);
                    } catch (err) {
                      toast({
                        title: "Không thể hủy đơn",
                        description: err instanceof Error ? err.message : "Vui lòng thử lại sau.",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="font-semibold px-6 shadow-sm"
                >
                  Hủy đơn
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleRefresh} 
                  disabled={refreshing}
                  className="font-semibold px-6 border-gray-300 hover:bg-gray-50"
                >
                  {refreshing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang cập nhật
                    </>
                  ) : (
                    "Làm mới trạng thái"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <Navbar isLoggedIn={isLoggedIn} username={username} />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
                Lịch sử đặt xe
              </h1>
              <p className="text-gray-600 text-base">
                Quản lý và theo dõi tất cả hóa đơn thuê xe của bạn
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                {error && (
                  <Badge variant="destructive" className="text-xs px-3 py-1.5">
                    {error}
                  </Badge>
                )}
                {lastRefreshTime > 0 && (
                  <Badge variant="outline" className="text-xs px-3 py-1.5 bg-white border-gray-200 text-gray-600">
                    <Clock className="h-3 w-3 mr-1.5" />
                    {new Date(lastRefreshTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </Badge>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh} 
                  disabled={refreshing || loading}
                  className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 font-medium"
                >
                  {refreshing || loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tải
                    </>
                  ) : (
                    "Làm mới"
                  )}
                </Button>
              </div>
              <Button 
                size="sm" 
                onClick={() => navigate("/")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
              >
                Đặt xe ngay
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-white border border-gray-200 rounded-lg p-1.5 gap-1 h-auto">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-xs font-semibold py-2.5 rounded-md transition-all"
              >
                Tất cả ({bookings.length})
              </TabsTrigger>
              <TabsTrigger 
                value="waiting"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-sm text-xs font-semibold py-2.5 rounded-md transition-all"
              >
                Chờ thanh toán ({waitingBookings.length})
              </TabsTrigger>
              <TabsTrigger 
                value="payed"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm text-xs font-semibold py-2.5 rounded-md transition-all"
              >
                Đã thanh toán ({payedBookings.length})
              </TabsTrigger>
              <TabsTrigger 
                value="renting"
                className="data-[state=active]:bg-sky-500 data-[state=active]:text-white data-[state=active]:shadow-sm text-xs font-semibold py-2.5 rounded-md transition-all"
              >
                Đang thuê ({rentingBookings.length})
              </TabsTrigger>
              <TabsTrigger 
                value="done"
                className="data-[state=active]:bg-gray-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-xs font-semibold py-2.5 rounded-md transition-all"
              >
                Hoàn thành ({doneBookings.length})
              </TabsTrigger>
              <TabsTrigger 
                value="cancelled"
                className="data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-sm text-xs font-semibold py-2.5 rounded-md transition-all"
              >
                Đã hủy ({cancelledBookings.length})
              </TabsTrigger>
            </TabsList>

          <TabsContent value="all" className="space-y-5 mt-6">
            {renderList(
              bookings,
              "Chưa có hóa đơn nào",
              "Hãy bắt đầu hành trình với một chiếc xe điện ngay hôm nay!"
            )}
          </TabsContent>
          <TabsContent value="waiting" className="space-y-5 mt-6">
            {renderList(
              waitingBookings,
              "Không có hóa đơn chờ thanh toán",
              "Khi tạo hóa đơn mới, bạn có thể thanh toán PayOS tại đây."
            )}
          </TabsContent>
          <TabsContent value="payed" className="space-y-5 mt-6">
            {renderList(
              payedBookings,
              "Chưa có hóa đơn đã thanh toán",
              "Sau khi thanh toán và được nhân viên xác nhận, hóa đơn sẽ xuất hiện tại đây."
            )}
          </TabsContent>
          <TabsContent value="renting" className="space-y-5 mt-6">
            {renderList(
              rentingBookings,
              "Không có chuyến đi đang diễn ra",
              "Khi bạn nhận xe, trạng thái sẽ hiển thị tại đây."
            )}
          </TabsContent>
          <TabsContent value="done" className="space-y-5 mt-6">
            {renderList(
              doneBookings,
              "Chưa có chuyến đi hoàn thành",
              "Hoàn tất một chuyến đi để xem lại chi tiết tại đây."
            )}
          </TabsContent>
          <TabsContent value="cancelled" className="space-y-5 mt-6">
            {renderList(
              cancelledBookings,
              "Không có hóa đơn bị hủy",
              "Nếu bạn hủy đặt xe, hóa đơn sẽ hiển thị tại đây."
            )}
          </TabsContent>
        </Tabs>
        </div>

        <PaymentDialog
          state={paymentDialog}
          onClose={() => setPaymentDialog(null)}
          toast={toast}
          onSuccess={async () => {
            if (!paymentDialog) return;
            try {
              await mockMarkPaymentAsPaid(paymentDialog.bookingId);
              toast({
                title: "Đã ghi nhận thanh toán demo",
                description: "Hóa đơn sẽ chuyển sang trạng thái chờ xác nhận của nhân viên.",
              });
              setPaymentDialog(null);
              if (currentUserId) {
                await loadBookings(currentUserId, { silent: true });
              }
            } catch (err) {
              toast({
                title: "Không thể đánh dấu thanh toán",
                description:
                  err instanceof Error ? err.message : "Vui lòng thử lại sau.",
                variant: "destructive",
              });
            }
          }}
        />

        {!loading && bookings.length === 0 && (
          <Card className="mt-6 border-gray-200 shadow-sm bg-gradient-to-br from-white to-gray-50">
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                <Car className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Chưa có hóa đơn nào</h3>
              <p className="mb-6 text-gray-600 max-w-md mx-auto">
                Bạn chưa có hóa đơn nào. Trải nghiệm dịch vụ thuê xe điện ngay!
              </p>
              <Button 
                onClick={() => navigate("/")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 shadow-sm"
              >
                Đặt xe ngay
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Bookings;
