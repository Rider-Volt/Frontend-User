import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Battery, Zap, MapPin, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export interface EVCardProps {
  id: number;
  name: string;
  type: string;
  batteryLevel: number;
  range: number;
  pricePerDay: number;
  location: string;
  image: string;
  available: boolean;
  onBookingSubmit?: (bookingData: any) => void;
}

interface BookingData {
  vehicleId: number;
  startDate: Date;
  endDate: Date;
  duration: number;
  totalPrice: number;
  pickupLocation: string;
  paymentMethod: string;
}

const EVCard = ({
  id,
  name,
  type,
  batteryLevel,
  range,
  pricePerDay,
  location,
  image,
  available,
  onBookingSubmit,
}: EVCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all overflow-hidden">
      {/* Hình ảnh */}
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
        />
        <div className="absolute top-4 right-4">
          {available ? (
            <Badge className="bg-green-500 text-white font-semibold px-3 py-1 rounded-full shadow">
              Có sẵn
            </Badge>
          ) : (
            <Badge className="bg-white text-gray-400 font-semibold px-3 py-1 rounded-full shadow border border-gray-200">
              Đã thuê
            </Badge>
          )}
        </div>
      </div>

      {/* Nội dung */}
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold mb-2">{name}</CardTitle>
        <p className="text-muted-foreground text-sm mb-3">{type}</p>
        <div className="text-primary font-bold text-xl">
          {pricePerDay.toLocaleString()}đ/ngày
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Battery className="w-4 h-4 text-primary" />
            <span className="text-sm">{batteryLevel}% pin</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent-foreground" />
            <span className="text-sm">{range}km</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{location}</span>
        </div>

        {available ? (
          <BookingModal
            vehicle={{ id, name, type, pricePerDay, location, batteryLevel, range }}
            onBookingSubmit={onBookingSubmit || (() => {})}
          />
        ) : (
          <Button variant="outline" className="w-full" disabled>
            Không có sẵn
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// BookingModal (giống cái cũ, không có info khách hàng)
const BookingModal = ({
  vehicle,
  onBookingSubmit,
}: {
  vehicle: any;
  onBookingSubmit: (bookingData: BookingData) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [duration, setDuration] = useState<number>(1);
  const [pickupLocation, setPickupLocation] = useState(vehicle.location);
  const [paymentMethod, setPaymentMethod] = useState("");

  const calculateTotalPrice = () => {
    return duration * vehicle.pricePerDay;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    const bookingData: BookingData = {
      vehicleId: vehicle.id,
      startDate,
      endDate,
      duration,
      totalPrice: calculateTotalPrice(),
      pickupLocation,
      paymentMethod,
    };

    onBookingSubmit(bookingData);
    setIsOpen(false);
  };

  const isFormValid = () => {
    return startDate && endDate && duration > 0 && pickupLocation && paymentMethod;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full bg-primary hover:bg-accent">
          Đặt xe ngay
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Đặt xe {vehicle.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Thông tin xe */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Thông tin xe
                </h3>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loại xe:</span>
                  <span className="font-medium">{vehicle.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giá thuê:</span>
                  <span className="font-medium">
                    {vehicle.pricePerDay.toLocaleString()}đ/ngày
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pin:</span>
                  <Badge variant="secondary">{vehicle.batteryLevel}%</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tầm hoạt động:</span>
                  <span className="font-medium">{vehicle.range}km</span>
                </div>
              </CardContent>
            </Card>

            {/* Chi tiết đặt xe */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Chi tiết đặt xe
                </h3>

                {/* Ngày nhận trả */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ngày bắt đầu</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate
                            ? format(startDate, "dd/MM/yyyy", { locale: vi })
                            : "Chọn ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Ngày kết thúc</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate
                            ? format(endDate, "dd/MM/yyyy", { locale: vi })
                            : "Chọn ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) => !startDate || date < startDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Thời gian thuê */}
                <div>
                  <Label>Thời gian thuê</Label>
                  <Select
                    value={duration.toString()}
                    onValueChange={(val) => setDuration(Number(val))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 ngày</SelectItem>
                      <SelectItem value="2">2 ngày</SelectItem>
                      <SelectItem value="3">3 ngày</SelectItem>
                      <SelectItem value="7">1 tuần</SelectItem>
                      <SelectItem value="14">2 tuần</SelectItem>
                      <SelectItem value="30">1 tháng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Địa điểm */}
                <div>
                  <Label>Địa điểm nhận xe</Label>
                  <Select value={pickupLocation} onValueChange={setPickupLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={vehicle.location}>{vehicle.location}</SelectItem>
                      <SelectItem value="Quận 1, TP.HCM">Quận 1, TP.HCM</SelectItem>
                      <SelectItem value="Quận 3, TP.HCM">Quận 3, TP.HCM</SelectItem>
                      <SelectItem value="Quận 7, TP.HCM">Quận 7, TP.HCM</SelectItem>
                      <SelectItem value="Quận Bình Thạnh, TP.HCM">Quận Bình Thạnh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Thanh toán */}
                <div>
                  <Label>Phương thức thanh toán</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phương thức" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Tiền mặt</SelectItem>
                      <SelectItem value="card">Thẻ tín dụng</SelectItem>
                      <SelectItem value="momo">Momo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tổng tiền */}
          <Card className="bg-primary/10 border-primary">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">Tổng cộng</h3>
                <p className="text-muted-foreground">
                  {duration} ngày × {vehicle.pricePerDay.toLocaleString()}đ
                </p>
              </div>
              <p className="text-2xl font-bold text-primary">
                {calculateTotalPrice().toLocaleString()}đ
              </p>
            </CardContent>
          </Card>

          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="default"
              className="flex-1 bg-primary hover:bg-accent"
              disabled={!isFormValid()}
            >
              Xác nhận đặt xe
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EVCard;
