import { useEffect, useMemo, useState } from "react";
import { differenceInHours, format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Car, CreditCard, User, FileText } from "lucide-react";
import Navbar from "@/components/heroUi/Navbar";
import { useNavigate } from "react-router-dom";
import {
  BookingStatus,
  getBookingHistory,
  StoredBooking,
  saveBookingHistory,
} from "@/services/bookingService";
import { getCurrentUser } from "@/services/authService";

const statusColor = (status: BookingStatus) => {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-800";
    case "APPROVED":
      return "bg-emerald-100 text-emerald-800";
    case "COMPLETED":
      return "bg-gray-100 text-gray-800";
    case "CANCELLED":
    case "DENIED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const statusText = (status: BookingStatus) => {
  switch (status) {
    case "PENDING":
      return "Chờ thanh toán";
    case "APPROVED":
      return "Đã duyệt";
    case "COMPLETED":
      return "Hoàn thành";
    case "DENIED":
      return "Từ chối";
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

const fallbackImage = "https://via.placeholder.com/64x64?text=EV";
const formatCurrency = (value: number) =>
  value.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "₫";

const Bookings = () => {
  const [bookings, setBookings] = useState<StoredBooking[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  // Removed hold countdown logic
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      setBookings([]);
      return;
    }
    setIsLoggedIn(true);
    setUsername(user.full_name || user.username || "Người dùng");
    const resolved = Number(user.id ?? user.userId);
    if (!Number.isFinite(resolved) || resolved <= 0) {
      setBookings([]);
      return;
    }
    setCurrentUserId(resolved);
    const parseTime = (value?: string) => (value ? Date.parse(value) : 0);
    const history = getBookingHistory(resolved).sort(
      (a, b) =>
        parseTime(b.startTime || b.bookingTime) -
        parseTime(a.startTime || a.bookingTime)
    );
    setBookings(history);
  }, []);

  // No countdown timer needed anymore

  // No auto-cancel on hold expiration anymore

  const handleCancel = (bookingId: number) => {
    if (!currentUserId) return;
    const updated = bookings.map((booking) =>
      booking.bookingId === bookingId
        ? { ...booking, status: "CANCELLED" as BookingStatus }
        : booking
    );
    setBookings(updated);
    saveBookingHistory(currentUserId, updated);
  };
  // Removed hold countdown computations

  const pendingBookings = useMemo(
    () => bookings.filter((b) => b.status === "PENDING"),
    [bookings]
  );

  const approvedBookings = useMemo(
    () => bookings.filter((b) => b.status === "APPROVED"),
    [bookings]
  );

  const completedBookings = useMemo(
    () => bookings.filter((b) => b.status === "COMPLETED"),
    [bookings]
  );

  const cancelledBookings = useMemo(
    () => bookings.filter((b) => b.status === "CANCELLED" || b.status === "DENIED"),
    [bookings]
  );

  const BookingCard = ({ booking }: { booking: StoredBooking }) => {
    const start = booking.startTime ? parseISO(booking.startTime) : null;
    const end = booking.endTime ? parseISO(booking.endTime) : null;
    const bookingTime = booking.bookingTime ? parseISO(booking.bookingTime) : null;
    const durationHours =
      start && end ? Math.max(differenceInHours(end, start), 1) : undefined;
  // No hold countdown

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img
                src={booking.vehicle.image || fallbackImage}
                alt={booking.vehicle.model || booking.vehicle.name}
                className="w-16 h-16 object-cover rounded-lg border border-muted"
              />
              <div>
                <CardTitle className="text-lg">
                  {booking.vehicle.model || booking.vehicle.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {booking.vehicle.type || booking.vehicle.model}
                </p>
                <p className="text-sm font-medium text-primary">
                  #{booking.bookingId}
                </p>
              </div>
            </div>
            <Badge className={statusColor(booking.status)}>
              {statusText(booking.status)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* No pending countdown banner */}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Ngày bắt đầu</p>
                <p className="text-sm text-muted-foreground">
                  {start ? format(start, "dd/MM/yyyy HH:mm", { locale: vi }) : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Ngày kết thúc</p>
                <p className="text-sm text-muted-foreground">
                  {end ? format(end, "dd/MM/yyyy HH:mm", { locale: vi }) : "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Thời gian thuê</p>
                <p className="text-sm text-muted-foreground">
                  {durationHours ? `${durationHours} giờ` : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Địa điểm nhận</p>
                <p className="text-sm text-muted-foreground">
                  {booking.pickupLocation || "Sẽ liên hệ xác nhận"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Thanh toán</p>
                <p className="text-sm text-muted-foreground">
                  {paymentMethodText(booking.paymentMethod)}
                </p>
              </div>
            </div>
            {bookingTime && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Ngày tạo</p>
                  <p className="text-sm text-muted-foreground">
                    {format(bookingTime, "dd/MM/yyyy HH:mm", { locale: vi })}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Biển số</p>
              <p className="text-sm text-muted-foreground">
                {booking.vehicle.licensePlate || "Đang cập nhật"}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tiền thuê</span>
                <span className="font-medium">
                  {typeof booking.price === "number"
                    ? formatCurrency(booking.price)
                    : "Đang cập nhật"}
                </span>
              </div>
              {typeof booking.deposit === "number" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đặt cọc</span>
                  <span className="font-medium">{formatCurrency(booking.deposit)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1 border-t border-muted-foreground/20">
                <span className="text-sm font-medium">Tổng thanh toán</span>
                <span className="text-lg font-bold text-primary">
                  {typeof booking.totalCharge === "number"
                    ? formatCurrency(booking.totalCharge)
                    : typeof booking.price === "number"
                    ? formatCurrency(booking.price + (booking.deposit ?? 0))
                    : "Đang cập nhật"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {booking.status === "PENDING" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleCancel(booking.bookingId)}
                >
                  Hủy đặt xe
                </Button>
                <Button variant="electric" size="sm" className="flex-1">
                  Thanh toán ngay
                </Button>
              </>
            )}
            {booking.status === "APPROVED" && (
              <Button variant="electric" size="sm" className="w-full">
                Bắt đầu thuê
              </Button>
            )}
            {booking.status === "COMPLETED" && (
              <Button variant="outline" size="sm" className="w-full">
                Đặt lại
              </Button>
            )}
            {(booking.status === "CANCELLED" || booking.status === "DENIED") && (
              <Button variant="outline" size="sm" className="w-full">
                Đặt lại
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderList = (items: StoredBooking[], emptyTitle: string, emptyDesc: string) => {
    if (items.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{emptyTitle}</h3>
            <p className="text-muted-foreground">{emptyDesc}</p>
          </CardContent>
        </Card>
      );
    }

    return items.map((booking) => (
      <BookingCard key={booking.bookingId} booking={booking} />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 to-accent/20">
      <Navbar isLoggedIn={isLoggedIn} username={username} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Lịch sử đặt xe</h1>
          <p className="text-muted-foreground">
            Quản lý và theo dõi tất cả các đặt xe của bạn
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Tất cả ({bookings.length})</TabsTrigger>
            <TabsTrigger value="pending">Chờ thanh toán ({pendingBookings.length})</TabsTrigger>
            <TabsTrigger value="approved">Đã duyệt ({approvedBookings.length})</TabsTrigger>
            <TabsTrigger value="completed">Hoàn thành ({completedBookings.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Đã hủy ({cancelledBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderList(
              bookings,
              "Chưa có đặt xe nào",
              "Bạn chưa có đặt xe nào. Hãy bắt đầu đặt xe điện ngay!"
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {renderList(
              pendingBookings,
              "Không có đặt xe chờ thanh toán",
              "Chưa có đơn đặt xe nào đang chờ thanh toán."
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {renderList(
              approvedBookings,
              "Không có đặt xe đã duyệt",
              "Hiện bạn chưa có đơn đặt xe nào được duyệt."
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {renderList(
              completedBookings,
              "Chưa có đặt xe hoàn thành",
              "Bạn chưa hoàn thành chuyến đi nào."
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {renderList(
              cancelledBookings,
              "Không có đơn bị hủy",
              "Chưa có đơn đặt xe nào bị hủy hoặc từ chối."
            )}
          </TabsContent>
        </Tabs>

        {bookings.length === 0 && (
          <Card className="mt-6">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                Bạn chưa đặt xe nào. Trải nghiệm dịch vụ ngay thôi!
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