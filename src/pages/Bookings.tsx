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
  BookingStatus,
  getBookingHistory,
  saveBookingHistory,
  StoredBooking,
} from "@/services/bookingService";
import { getCurrentUser } from "@/services/authService";
import { listMyBillings } from "@/services/renterBillingService";
import {
  createPayOSPaymentLink,
  extractCheckoutUrl,
  extractQrCode,
  mockMarkPaymentAsPaid,
  type PayOSPaymentLinkResponse,
  createDemoPaymentInfo,
} from "@/services/paymentService";

type ToastFn = ReturnType<typeof useToast>["toast"];

const statusColor = (status: BookingStatus) => {
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

const statusText = (status: BookingStatus) => {
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

const fallbackImage = "https://via.placeholder.com/128x96?text=EV";

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
      if (localEntry.deposit != null && merged.deposit == null) {
        merged.deposit = localEntry.deposit;
      }
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
    const timeA = parseTime(a.startDay) || parseTime(a.bookingTime);
    const timeB = parseTime(b.startDay) || parseTime(b.bookingTime);
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
        payload: PayOSPaymentLinkResponse;
        checkoutUrl?: string;
        qrUrl?: string;
      };
  onClose: () => void;
  toast?: ToastFn;
  onSuccess?: () => Promise<void> | void;
}) => {
  if (!state) return null;
  const { bookingId, payload, checkoutUrl, qrUrl } = state;
  const amountLabel =
    typeof payload.amount === "number"
      ? formatCurrency(payload.amount)
      : undefined;
  const expiryLabel = formatEpochSeconds(payload.expiredAt);

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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Thanh toán PayOS cho hóa đơn #{bookingId}</DialogTitle>
          <DialogDescription>
            Hoàn tất thanh toán bằng một trong các tùy chọn bên dưới. Sau khi hệ
            thống PayOS ghi nhận giao dịch, nhân viên sẽ phê duyệt để bạn tiếp
            tục quy trình thuê xe.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow
              icon={FileText}
              label="Mã thanh toán"
              value={payload.paymentLinkId || `Billing #${bookingId}`}
            />
            <InfoRow
              icon={CreditCard}
              label="Số tiền"
              value={amountLabel || "—"}
            />
            <InfoRow icon={Calendar} label="Hết hạn" value={expiryLabel} />
            {payload.status && (
              <InfoRow
                icon={CreditCard}
                label="Trạng thái"
                value={payload.status}
              />
            )}
          </div>

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
            <img
              src={qrUrl}
              alt="QR PayOS"
              className="mx-auto h-48 w-48 rounded-md border bg-white p-3 shadow-sm"
            />
          )}

          <p className="text-xs text-muted-foreground">
            Lưu ý: Thanh toán thành công không tự động chuyển sang &quot;Đã thanh
            toán&quot;. Nhân viên sẽ kiểm tra và xác nhận trước khi bạn có thể
            tiếp tục.
          </p>
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
      Thanh toán demo (đánh dấu thành công)
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
  const [paymentDialog, setPaymentDialog] = useState<
    | null
    | {
        bookingId: number;
        payload: PayOSPaymentLinkResponse;
        checkoutUrl?: string;
        qrUrl?: string;
      }
  >(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const loadBookings = useCallback(
    async (userId: number, options?: { silent?: boolean }) => {
      const localHistory = getBookingHistory(userId);
      if (!options?.silent) {
        setBookings(localHistory);
      }

      try {
        const remoteList = await listMyBillings();
        const normalizedRemote = remoteList.map((entry) => ({
          ...entry,
          bookingId: entry.id ?? entry.bookingId,
        })) as StoredBooking[];
        const merged = mergeBookings(normalizedRemote, localHistory);
        setBookings(merged);
        saveBookingHistory(userId, merged);
        setError(null);
        return true;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Không tải được danh sách hóa đơn";
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
    const ok = await loadBookings(currentUserId, { silent: true });
    setRefreshing(false);
    if (ok) {
      toast({
        title: "Đã cập nhật danh sách hóa đơn",
      });
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
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Đang tải dữ liệu...</span>
          </CardContent>
        </Card>
      );
    }

    if (items.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <Car className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">{emptyTitle}</h3>
            <p className="text-muted-foreground">{emptyDesc}</p>
          </CardContent>
        </Card>
      );
    }

    return items.map((booking, index) => {
      const id = booking.id ?? booking.bookingId;
      const total = booking.totalCost ?? booking.totalCharge ?? null;
      const start = formatDate(booking.startDay);
      const end = formatDate(booking.endDay);
      const bookingTime = formatDateTime(booking.bookingTime);
      const hours =
        booking.startDay && booking.endDay
          ? differenceInHours(
              parseISO(booking.endDay),
              parseISO(booking.startDay)
            )
          : undefined;
      const vehicleName =
        booking.localVehicleName ?? booking.vehicleModel ?? `Hóa đơn #${id}`;
      const allowPay = booking.status === "WAITING";

      return (
        <Card key={id ?? `local-${index}`}>
          <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="text-xl">{vehicleName}</CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {id ? `Mã hóa đơn #${id}` : "Chưa có mã hóa đơn"}
                </span>
                {booking.renterName && (
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {booking.renterName}
                  </span>
                )}
              </div>
            </div>
            <Badge className={statusColor(booking.status)}>
              {statusText(booking.status)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="lg:w-40">
                <img
                  src={booking.localVehicleImage || fallbackImage}
                  alt={vehicleName}
                  className="h-24 w-40 rounded-md border object-cover"
                  onError={(event) => {
                    (event.target as HTMLImageElement).src = fallbackImage;
                  }}
                />
              </div>
              <div className="grid flex-1 gap-4 sm:grid-cols-2">
                <InfoRow icon={Calendar} label="Ngày thuê" value={`${start} → ${end}`} />
                <InfoRow
                  icon={Clock}
                  label="Thời gian đặt"
                  value={bookingTime}
                />
                <InfoRow
                  icon={CreditCard}
                  label="Tổng tiền"
                  value={formatCurrency(total)}
                />
                {/* Đã xóa hiển thị tiền cọc */}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow
                icon={Car}
                label="Trạng thái"
                value={statusText(booking.status)}
              />
              <InfoRow
                icon={CreditCard}
                label="Phương thức thanh toán"
                value={paymentMethodText(booking.paymentMethod)}
              />
              {booking.pickupLocation && (
                <InfoRow
                  icon={MapPin}
                  label="Điểm nhận xe"
                  value={booking.pickupLocation}
                />
              )}
              {typeof hours === "number" && hours > 0 && (
                <InfoRow
                  icon={Clock}
                  label="Thời lượng ước tính"
                  value={`${hours} giờ`}
                />
              )}
            </div>

            {allowPay && (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={async () => {
                    // Mock mode: chỉ hiển thị popup QR demo, không gọi API thật
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
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Thanh toán PayOS (Mock)
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      // Call backend API to cancel booking
                      const billingId = booking.id ?? booking.bookingId;
                      if (!billingId) throw new Error("Không tìm thấy mã hóa đơn");
                      // Truyền Authorization header để backend xác thực
                      const { getAuthToken, authHeaders } = await import("@/services/authService");
                      const token = getAuthToken();
                      const resp = await fetch(`/api/renter/billings/${billingId}/cancel`, {
                        method: "POST",
                        headers: authHeaders(token),
                      });
                      if (!resp.ok) {
                        const data = await resp.json().catch(() => ({}));
                        throw new Error(data?.message || resp.statusText);
                      }
                      toast({
                        title: "Đã hủy đơn thành công",
                        description: `Hóa đơn #${billingId} đã được hủy.`,
                      });
                      if (currentUserId) await loadBookings(currentUserId, { silent: true });
                    } catch (err) {
                      toast({
                        title: "Không thể hủy đơn",
                        description: err instanceof Error ? err.message : "Vui lòng thử lại sau.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Hủy đơn
                </Button>
                <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
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
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 to-accent/20">
      <Navbar isLoggedIn={isLoggedIn} username={username} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Lịch sử đặt xe</h1>
            <p className="text-muted-foreground">
              Quản lý và theo dõi tất cả hóa đơn thuê xe của bạn.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {error && (
              <Badge variant="destructive" className="text-sm">
                {error}
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing || loading}>
              {refreshing || loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tải
                </>
              ) : (
                "Làm mới"
              )}
            </Button>
            <Button size="sm" onClick={() => navigate("/")}>
              Đặt xe ngay
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">Tất cả ({bookings.length})</TabsTrigger>
            <TabsTrigger value="waiting">
              Chờ thanh toán ({waitingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="payed">
              Đã thanh toán ({payedBookings.length})
            </TabsTrigger>
            <TabsTrigger value="renting">
              Đang thuê ({rentingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="done">
              Hoàn thành ({doneBookings.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Đã hủy ({cancelledBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderList(
              bookings,
              "Chưa có hóa đơn nào",
              "Hãy bắt đầu hành trình với một chiếc xe điện ngay hôm nay!"
            )}
          </TabsContent>
          <TabsContent value="waiting" className="space-y-4">
            {renderList(
              waitingBookings,
              "Không có hóa đơn chờ thanh toán",
              "Khi tạo hóa đơn mới, bạn có thể thanh toán PayOS tại đây."
            )}
          </TabsContent>
          <TabsContent value="payed" className="space-y-4">
            {renderList(
              payedBookings,
              "Chưa có hóa đơn đã thanh toán",
              "Sau khi thanh toán và được nhân viên xác nhận, hóa đơn sẽ xuất hiện tại đây."
            )}
          </TabsContent>
          <TabsContent value="renting" className="space-y-4">
            {renderList(
              rentingBookings,
              "Không có chuyến đi đang diễn ra",
              "Khi bạn nhận xe, trạng thái sẽ hiển thị tại đây."
            )}
          </TabsContent>
          <TabsContent value="done" className="space-y-4">
            {renderList(
              doneBookings,
              "Chưa có chuyến đi hoàn thành",
              "Hoàn tất một chuyến đi để xem lại chi tiết tại đây."
            )}
          </TabsContent>
          <TabsContent value="cancelled" className="space-y-4">
            {renderList(
              cancelledBookings,
              "Không có hóa đơn bị hủy",
              "Nếu bạn hủy đặt xe, hóa đơn sẽ hiển thị tại đây."
            )}
          </TabsContent>
        </Tabs>

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
          <Card className="mt-6">
            <CardContent className="py-8 text-center">
              <p className="mb-4 text-muted-foreground">
                Bạn chưa có hóa đơn nào. Trải nghiệm dịch vụ thuê xe điện ngay!
              </p>
              <Button onClick={() => navigate("/")}>Đặt xe ngay</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Bookings;
