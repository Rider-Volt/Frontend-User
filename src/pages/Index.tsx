import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Car,
  User,
  Menu,
  Zap,
  Clock,
  Shield,
  HeartHandshake,
  Ticket,
  Search,
  Battery,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

type VehicleType = "" | "suv" | "sedan" | "hatchback";

interface EVCardProps {
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
  customerInfo: {
    name: string;
    phone: string;
    email: string;
    licenseNumber: string;
  };
  pickupLocation: string;
  paymentMethod: string;
}

// EVCard Component
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
   onBookingSubmit
 }: EVCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all overflow-hidden">
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
      
       <CardHeader className="pb-3">
         <CardTitle className="text-lg font-semibold mb-2">{name}</CardTitle>
         <p className="text-muted-foreground text-sm mb-3">{type}</p>
         <div className="text-primary font-bold text-xl">{pricePerDay.toLocaleString()}đ/ngày</div>
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
             vehicle={{
               id,
               name,
               type,
               pricePerDay,
               location,
               image,
               batteryLevel,
               range
             }}
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

// BookingModal Component
const BookingModal = ({ vehicle, onBookingSubmit }: { vehicle: any, onBookingSubmit: (bookingData: BookingData) => void }) => {
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
        <Button variant="default" className="w-full bg-primary hover:bg-accent">
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
                     <span className="font-medium">{vehicle.pricePerDay.toLocaleString()}đ/ngày</span>
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
                     <Label htmlFor="duration">Thời gian thuê</Label>
                     <Select value={duration.toString()} onValueChange={(value) => setDuration(Number(value))}>
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

          

          

          {/* Total Price */}
          <Card className="bg-primary/10 border-primary">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                 <div>
                   <h3 className="font-semibold text-lg">Tổng cộng</h3>
                   <p className="text-muted-foreground">{duration} ngày × {vehicle.pricePerDay.toLocaleString()}đ</p>
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

const Index: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("username");
    
    if (token) {
      setIsLoggedIn(true);
      if (name) setUsername(name);
    } else {
      setIsLoggedIn(false);
      setUsername("");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUsername("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.append("location", location);
    if (startDate) params.append("start", startDate);
    if (endDate) params.append("end", endDate);
    if (vehicleType) params.append("type", vehicleType);
    navigate(`/search?${params.toString()}`);
  };

   const popularCars = [
     {
       id: 1,
       name: "VinFast VF e34",
       type: "Ô tô điện",
       batteryLevel: 85,
       range: 300,
       pricePerDay: 600000,
       location: "Quận 1, TP.HCM",
       image: "/src/image/imagecar/e34.jpg",
       available: true
     },
     {
       id: 2,
       name: "VINFAST VF 3",
       type: "Ô tô điện",
       batteryLevel: 92,
       range: 450,
       pricePerDay: 1200000,
       location: "Quận 2, TP.HCM",
       image: "/src/image/imagecar/vf3.jpg",
       available: true
     },
     {
       id: 3,
       name: "VINFAST VF 5",
       type: "SÔ tô điện",
       batteryLevel: 78,
       range: 380,
       pricePerDay: 960000,
       location: "Quận 7, TP.HCM",
       image: "/src/image/imagecar/vf5.jpg",
       available: false
     },
     {
       id: 4,
       name: "VINFAST VF 6",
       type: "Ô tô điện",
       batteryLevel: 88,
       range: 420,
       pricePerDay: 1080000,
       location: "Quận 3, TP.HCM",
       image: "/src/image/imagecar/vf6.jpg",
       available: true
     },
     {
      id: 55,
      name: "VINFAST VF 7",
      type: "Ô tô điện",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/src/image/imagecar/vf7.jpg",
      available: true
    },
    {
      id: 6,
      name: "VINFAST VF 7 plus",
      type: "Ô tô điện",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/src/image/imagecar/vf7.jpg",
      available: true
    },
    {
      id: 7,
      name: "VINFAST VF 8",
      type: "Ô tô điện",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/src/image/imagecar/vf8.jpg",
      available: true
    },
    {
      id: 8,
      name: "VinFast VF 8 plus",
      type: "Ô tô điện",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/src/image/imagecar/vf8.jpg",
      available: true
    },
    {
      id: 9,
      name: "VinFast VF 9",
      type: "Ô tô điện",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/src/image/imagecar/vf9.jpg",
      available: true
    },
    {
      id: 10,
      name: "VinFast VF 9 plus",
      type: "Ô tô điện",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/src/image/imagecar/vf9.jpg",
      available: true
    },
    {
      id: 11,
      name: "xe máy điện VinFast feliz",
      type: "Xe máy điện",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/src/image/imagecar/feliz.jpg",
      available: true
    },
    {
      id: 12,
      name: "xe máy điện VinFast klara Neo ",
      type: "Xe máy điện",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/src/image/imagecar/klaraneo.jpg",
      available: true
    },
    {
      id: 13,
      name: "xe máy điện VinFast evoneo",
      type: "Xe máy điện",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/src/image/imagecar/evoneo.jpg",
      available: true
    },
    {
      id: 14,
      name: "xe máy điện VinFast evogrand",
      type: "Xe máy điện",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/src/image/imagecar/evogrand.jpg",
      available: true
    },
    {
      id: 15,
      name: "xe máy điện VinFast ventoneo",
      type: "Xe máy điện",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/src/image/imagecar/ventoneo.jpg",
      available: true
    },
    
   ];

  const handleBookingSubmit = (bookingData: BookingData) => {
    console.log("Booking submitted:", bookingData);
    // Here you would typically send the booking data to your backend
    alert(`Đặt xe thành công! Tổng tiền: ${bookingData.totalPrice.toLocaleString()}đ`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary/20 to-accent/20">
      {/* Header */}
      <header className="bg-white shadow border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary p-2 rounded-xl">
              <Car className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary">EV Rental</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary font-medium">
              Trang chủ
            </Link>
            <Link to="/search" className="text-foreground hover:text-primary font-medium">
              Tìm xe
            </Link>
            <Link to="/rental-points" className="text-foreground hover:text-primary font-medium">
              Điểm thuê
            </Link>
            <Link to="/cars" className="text-foreground hover:text-primary font-medium">
            lịch sử đặt xe
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <span
                  className="text-primary font-medium cursor-pointer hover:underline"
                  onClick={() => navigate("/profile")}
                >
                  👋 Xin chào, {username}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="text-primary border-secondary">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-primary hover:bg-accent text-primary-foreground">
                    Đăng ký
                  </Button>
                </Link>
              </>
            )}
            <button className="md:hidden p-2 rounded-lg border">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

         {/* Hero */}
         <main className="flex-1">
           <section className="relative h-screen flex items-center justify-center overflow-hidden">
             {/* Background image with overlay */}
             <div className="absolute inset-0">
               <img 
                 src="/src/image/imagecar/indexcar.jpg" 
                 alt="VinFast Electric Vehicle" 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-black/40" />
             </div>
             
             {/* Content */}
             <div className="relative z-10 container mx-auto px-4 text-center">
               <div className="max-w-6xl mx-auto">
                 <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
                   Thuê xe điện
                   <span className="block bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                     Tương lai xanh
                   </span>
                 </h1>
                 
                 <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
                   Trải nghiệm công nghệ xe điện tiên tiến. 
                   Thuê xe theo ngày, thuận tiện và thân thiện với môi trường.
                 </p>

                 {/* Search Form Overlay */}
                 <div className="w-full max-w-5xl mx-auto">
                   <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                     <form
                       onSubmit={handleSearchSubmit}
                       className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
                     >
                       <div>
                         <label className="text-xs text-muted-foreground">Địa điểm</label>
                         <input
                           value={location}
                           onChange={(e) => setLocation(e.target.value)}
                           placeholder="Ví dụ: Quận 1, Quận 2"
                           className="mt-1 w-full border rounded-lg px-3 py-2"
                         />
                       </div>

                       <div>
                         <label className="text-xs text-muted-foreground">Ngày nhận xe</label>
                         <input
                           type="date"
                           value={startDate}
                           onChange={(e) => setStartDate(e.target.value)}
                           className="mt-1 w-full border rounded-lg px-3 py-2"
                         />
                       </div>

                       <div>
                         <label className="text-xs text-muted-foreground">Ngày trả xe</label>
                         <input
                           type="date"
                           value={endDate}
                           onChange={(e) => setEndDate(e.target.value)}
                           className="mt-1 w-full border rounded-lg px-3 py-2"
                         />
                       </div>

                       <div>
                         <label className="text-xs text-muted-foreground">Loại xe</label>
                         <div className="flex gap-2">
                           <select
                             value={vehicleType}
                             onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                             className="mt-1 w-full border rounded-lg px-3 py-2"
                           >
                             <option value="">Tất cả</option>
                             <option value="xe máy điện">Xe máy điện</option>
                             <option value="ô tô điện">Ô tô điện</option>
                             <option value="mô tô điện">Mô tô điện</option>
                           </select>
                           <Button type="submit" className="bg-primary hover:bg-accent text-primary-foreground">
                             <Search className="h-4 w-4 mr-2" /> Tìm
                           </Button>
                         </div>
                       </div>
                     </form>
                   </div>
                 </div>
               </div>
             </div>
           </section>

        {/* Popular Cars */}
        <section className="py-16 px-4 bg-secondary/10">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-foreground text-center mb-8">Xe phổ biến</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {popularCars.map((car) => (
                 <EVCard
                   key={car.id}
                   id={car.id}
                   name={car.name}
                   type={car.type}
                   batteryLevel={car.batteryLevel}
                   range={car.range}
                   pricePerDay={car.pricePerDay}
                   location={car.location}
                   image={car.image}
                   available={car.available}
                   onBookingSubmit={handleBookingSubmit}
                 />
               ))}
             </div>
          </div>
        </section>

        {/* Why choose */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-7xl text-center">
            <h3 className="text-2xl font-bold mb-6">Tại sao chọn EV Rental?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <Shield className="h-12 w-12 mx-auto text-primary mb-4" />
                <h4 className="font-semibold">Uy tín</h4>
                <p className="text-muted-foreground">Đối tác & bảo hiểm cho mọi chuyến đi</p>
              </div>
               <div>
                 <Ticket className="h-12 w-12 mx-auto text-primary mb-4" />
                 <h4 className="font-semibold">Thuê theo ngày</h4>
                 <p className="text-muted-foreground">Linh hoạt từ 1 ngày đến 1 tháng</p>
               </div>
              <div>
                <HeartHandshake className="h-12 w-12 mx-auto text-primary mb-4" />
                <h4 className="font-semibold">Hỗ trợ 24/7</h4>
                <p className="text-muted-foreground">Chăm sóc khách hàng tận tâm</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 mt-auto">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Car className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-white">EV Rental</span>
              </div>
              <p className="text-gray-400">Đồng hành cùng bạn trên mọi hành trình xanh.</p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Dịch vụ</h4>
              <ul className="space-y-2">
                <li className="hover:text-white cursor-pointer">Đặt xe</li>
                <li className="hover:text-white cursor-pointer">Bảng giá</li>
                <li className="hover:text-white cursor-pointer">Khuyến mãi</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Hỗ trợ</h4>
              <ul className="space-y-2">
                <li className="hover:text-white cursor-pointer">Liên hệ</li>
                <li className="hover:text-white cursor-pointer">FAQ</li>
                <li className="hover:text-white cursor-pointer">Chính sách</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Theo dõi</h4>
              <ul className="space-y-2">
                <li className="hover:text-white cursor-pointer">Facebook</li>
                <li className="hover:text-white cursor-pointer">Instagram</li>
                <li className="hover:text-white cursor-pointer">Twitter</li>
              </ul>
            </div>
          </div>

          <div className="text-center text-gray-500 mt-8 border-t border-gray-700 pt-6">
            
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
