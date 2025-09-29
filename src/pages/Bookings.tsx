import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Car, CreditCard, Phone, Mail, User, Eye, X } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Navbar from "@/components/heroUi/Navbar";
import { useNavigate } from "react-router-dom";

interface Booking {
  id: string;
  vehicle: {
    name: string;
    type: string;
    image: string;
  };
  startDate: Date;
  endDate: Date;
  duration: number;
  totalPrice: number;
  status: "confirmed" | "active" | "completed" | "cancelled";
  customerInfo: {
    name: string;
    phone: string;
    email: string;
    licenseNumber: string;
  };
  pickupLocation: string;
  paymentMethod: string;
  createdAt: Date;
}

const mockBookings: Booking[] = [
  {
    id: "BK001",
    vehicle: {
      name: "VinFast VF 8",
      type: "SUV Điện Cao Cấp",
      image: "https://vinfast.vn/wp-content/uploads/2023/03/VF8-1.jpg"
    },
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-01-16"),
    duration: 24,
    totalPrice: 3600000,
    status: "completed",
    customerInfo: {
      name: "Nguyễn Văn A",
      phone: "0901234567",
      email: "nguyenvana@email.com",
      licenseNumber: "A123456789"
    },
    pickupLocation: "Quận 1, TP.HCM",
    paymentMethod: "credit-card",
    createdAt: new Date("2024-01-10")
  },
  {
    id: "BK002",
    vehicle: {
      name: "VinFast VF e34",
      type: "Sedan Điện Premium",
      image: "https://vinfast.vn/wp-content/uploads/2023/03/VFe34-1.jpg"
    },
    startDate: new Date("2024-01-20"),
    endDate: new Date("2024-01-21"),
    duration: 8,
    totalPrice: 1600000,
    status: "confirmed",
    customerInfo: {
      name: "Trần Thị B",
      phone: "0907654321",
      email: "tranthib@email.com",
      licenseNumber: "B987654321"
    },
    pickupLocation: "Quận 3, TP.HCM",
    paymentMethod: "momo",
    createdAt: new Date("2024-01-18")
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-blue-100 text-blue-800";
    case "active":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-gray-100 text-gray-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "confirmed":
      return "Đã xác nhận";
    case "active":
      return "Đang sử dụng";
    case "completed":
      return "Hoàn thành";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
};

const Bookings = () => {
  const [bookings] = useState<Booking[]>(mockBookings);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const confirmedBookings = bookings.filter(b => b.status === "confirmed");
  const activeBookings = bookings.filter(b => b.status === "active");
  const completedBookings = bookings.filter(b => b.status === "completed");

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "active":
        return "secondary";
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận";
      case "active":
        return "Đang sử dụng";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={booking.vehicle.image} 
              alt={booking.vehicle.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <CardTitle className="text-lg">{booking.vehicle.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{booking.vehicle.type}</p>
              <p className="text-sm font-medium text-primary">#{booking.id}</p>
            </div>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            {getStatusText(booking.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Ngày bắt đầu</p>
              <p className="text-sm text-muted-foreground">
                {format(booking.startDate, "dd/MM/yyyy", { locale: vi })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Ngày kết thúc</p>
              <p className="text-sm text-muted-foreground">
                {format(booking.endDate, "dd/MM/yyyy", { locale: vi })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Thời gian thuê</p>
              <p className="text-sm text-muted-foreground">{booking.duration} giờ</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Địa điểm nhận</p>
              <p className="text-sm text-muted-foreground">{booking.pickupLocation}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Thanh toán</p>
            <p className="text-sm text-muted-foreground">
              {booking.paymentMethod === "credit-card" ? "Thẻ tín dụng" :
               booking.paymentMethod === "momo" ? "Ví MoMo" :
               booking.paymentMethod === "zalopay" ? "Ví ZaloPay" :
               booking.paymentMethod}
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Tổng cộng:</span>
            <span className="text-lg font-bold text-primary">
              {booking.totalPrice.toLocaleString()}đ
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {booking.status === "confirmed" && (
            <>
              <Button variant="outline" size="sm" className="flex-1">
                Hủy đặt xe
              </Button>
              <Button variant="electric" size="sm" className="flex-1">
                Bắt đầu thuê
              </Button>
            </>
          )}
          {booking.status === "active" && (
            <Button variant="outline" size="sm" className="w-full">
              Kết thúc thuê
            </Button>
          )}
          {booking.status === "completed" && (
            <Button variant="outline" size="sm" className="w-full">
              Đặt lại
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Tất cả ({bookings.length})</TabsTrigger>
            <TabsTrigger value="confirmed">Đã xác nhận ({confirmedBookings.length})</TabsTrigger>
            <TabsTrigger value="active">Đang sử dụng ({activeBookings.length})</TabsTrigger>
            <TabsTrigger value="completed">Hoàn thành ({completedBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Chưa có đặt xe nào</h3>
                  <p className="text-muted-foreground">
                    Bạn chưa có đặt xe nào. Hãy bắt đầu đặt xe điện ngay!
                  </p>
                  <Button 
                    className="mt-4" 
                    onClick={() => navigate("/")}
                  >
                    Đặt xe ngay
                  </Button>
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="confirmed" className="space-y-4">
            {confirmedBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Không có đặt xe đã xác nhận</h3>
                  <p className="text-muted-foreground">
                    Bạn chưa có đặt xe nào đã được xác nhận.
                  </p>
                </CardContent>
              </Card>
            ) : (
              confirmedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="active" className="space-y-4">
            {activeBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Không có xe đang sử dụng</h3>
                  <p className="text-muted-foreground">
                    Bạn hiện tại không có xe nào đang được sử dụng.
                  </p>
                </CardContent>
              </Card>
            ) : (
              activeBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {completedBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Chưa có đặt xe hoàn thành</h3>
                  <p className="text-muted-foreground">
                    Bạn chưa hoàn thành đặt xe nào.
                  </p>
                </CardContent>
              </Card>
            ) : (
              completedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Bookings;
