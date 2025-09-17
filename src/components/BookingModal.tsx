import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, Clock, MapPin, CreditCard, User, Phone } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface BookingModalProps {
  vehicle: {
    id: number;
    name: string;
    type: string;
    pricePerHour: number;
    location: string;
    image: string;
    batteryLevel: number;
    range: number;
  };
  onBookingSubmit: (bookingData: BookingData) => void;
}

interface BookingData {
  vehicleId: number;
  startDate: Date;
  endDate: Date;
  duration: number;
  totalPrice: number;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
    licenseNumber: string;
  };
  pickupLocation: string;
  paymentMethod: string;
}

export const BookingModal = ({ vehicle, onBookingSubmit }: BookingModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [duration, setDuration] = useState<number>(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    licenseNumber: ""
  });
  const [pickupLocation, setPickupLocation] = useState(vehicle.location);
  const [paymentMethod, setPaymentMethod] = useState("");

  const calculateTotalPrice = () => {
    return duration * vehicle.pricePerHour;
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
      customerInfo,
      pickupLocation,
      paymentMethod
    };

    onBookingSubmit(bookingData);
    setIsOpen(false);
  };

  const isFormValid = () => {
    return startDate && endDate && 
           customerInfo.name && customerInfo.phone && 
           customerInfo.email && customerInfo.licenseNumber &&
           paymentMethod;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="electric" className="w-full">
          Đặt xe ngay
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Đặt xe {vehicle.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vehicle Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Thông tin xe
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Loại xe:</span>
                    <span className="font-medium">{vehicle.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Giá thuê:</span>
                    <span className="font-medium">{vehicle.pricePerHour.toLocaleString()}đ/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pin:</span>
                    <Badge variant="secondary">{vehicle.batteryLevel}%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tầm hoạt động:</span>
                    <span className="font-medium">{vehicle.range}km</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Chi tiết đặt xe
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Ngày bắt đầu</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="end-date">Ngày kết thúc</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            disabled={(date) => !startDate || date < startDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Thời gian thuê (giờ)</Label>
                    <Select value={duration.toString()} onValueChange={(value) => setDuration(Number(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 4, 6, 8, 12, 24].map((hours) => (
                          <SelectItem key={hours} value={hours.toString()}>
                            {hours} giờ
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="pickup">Địa điểm nhận xe</Label>
                    <Select value={pickupLocation} onValueChange={setPickupLocation}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={vehicle.location}>{vehicle.location}</SelectItem>
                        <SelectItem value="Quận 1, TP.HCM">Quận 1, TP.HCM</SelectItem>
                        <SelectItem value="Quận 2, TP.HCM">Quận 2, TP.HCM</SelectItem>
                        <SelectItem value="Quận 3, TP.HCM">Quận 3, TP.HCM</SelectItem>
                        <SelectItem value="Quận 4, TP.HCM">Quận 4, TP.HCM</SelectItem>
                        <SelectItem value="Quận 5, TP.HCM">Quận 5, TP.HCM</SelectItem>
                        <SelectItem value="Quận 6, TP.HCM">Quận 6, TP.HCM</SelectItem>
                        <SelectItem value="Quận 7, TP.HCM">Quận 7, TP.HCM</SelectItem>
                        <SelectItem value="Quận 8, TP.HCM">Quận 8, TP.HCM</SelectItem>
                        <SelectItem value="Quận 9, TP.HCM">Quận 9, TP.HCM</SelectItem>
                        <SelectItem value="Quận 10, TP.HCM">Quận 10, TP.HCM</SelectItem>
                        <SelectItem value="Quận 11, TP.HCM">Quận 11, TP.HCM</SelectItem>
                        <SelectItem value="Quận 12, TP.HCM">Quận 12, TP.HCM</SelectItem>
                        <SelectItem value="Quận Bình Thạnh, TP.HCM">Quận Bình Thạnh, TP.HCM</SelectItem>
                        <SelectItem value="Quận Gò Vấp, TP.HCM">Quận Gò Vấp, TP.HCM</SelectItem>
                        <SelectItem value="Quận Phú Nhuận, TP.HCM">Quận Phú Nhuận, TP.HCM</SelectItem>
                        <SelectItem value="Quận Tân Bình, TP.HCM">Quận Tân Bình, TP.HCM</SelectItem>
                        <SelectItem value="Quận Tân Phú, TP.HCM">Quận Tân Phú, TP.HCM</SelectItem>
                        <SelectItem value="Quận Thủ Đức, TP.HCM">Quận Thủ Đức, TP.HCM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Thông tin khách hàng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Họ và tên *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    placeholder="Nhập email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="license">Số bằng lái xe *</Label>
                  <Input
                    id="license"
                    value={customerInfo.licenseNumber}
                    onChange={(e) => setCustomerInfo({...customerInfo, licenseNumber: e.target.value})}
                    placeholder="Nhập số bằng lái xe"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Phương thức thanh toán
              </h3>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phương thức thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit-card">Thẻ tín dụng</SelectItem>
                  <SelectItem value="debit-card">Thẻ ghi nợ</SelectItem>
                  <SelectItem value="bank-transfer">Chuyển khoản ngân hàng</SelectItem>
                  <SelectItem value="momo">Ví MoMo</SelectItem>
                  <SelectItem value="zalopay">Ví ZaloPay</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Total Price */}
          <Card className="bg-electric-gradient/10 border-electric">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">Tổng cộng</h3>
                  <p className="text-muted-foreground">{duration} giờ × {vehicle.pricePerHour.toLocaleString()}đ</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {calculateTotalPrice().toLocaleString()}đ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Hủy
            </Button>
            <Button 
              type="submit" 
              variant="electric" 
              className="flex-1"
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
