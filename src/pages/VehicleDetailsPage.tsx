import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Battery, Zap, MapPin, Calendar as CalendarIcon, Clock,Users,Settings,Fuel,Leaf,ArrowLeft,Share2,Crown,AlertCircle,CheckCircle} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Navbar from "@/components/heroUi/Navbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Nếu bạn dùng Radix hoặc custom dialog

interface Vehicle {
  id: number;
  name: string;
  type: string;
  batteryLevel: number;
  range: number;
  pricePerDay: number;
  location: string;
  image: string;
  available: boolean;
  features?: {
    seats: number;
    transmission: string;
    fuel: string;
    consumption: string;
  };
  description?: string;
  fullAddress?: string;
}

const VehicleDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  
  // Booking form state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("4");
  const [pickupOption, setPickupOption] = useState("self");
  const [paymentMethod, setPaymentMethod] = useState("");

  // Modal state
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setIsLoggedIn(true);
      try {
        const user = JSON.parse(userData);
        setUsername(user.name || user.username || "User");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Mock data - in real app, fetch from API using id
    const mockVehicles: Vehicle[] = [
      {
        id: 1,
        name: "VinFast VF e34",
        type: "Ô tô điện",
        batteryLevel: 85,
        range: 300,
        pricePerDay: 600000,
        location: "Quận 1, TP.HCM",
        image: "/images/imagecar/e34.jpg",
        available: true,
        features: {
          seats: 5,
          transmission: "Số tự động",
          fuel: "Điện",
          consumption: "0l/100km"
        },
        description: "Xe điện cao cấp với thiết kế hiện đại, phù hợp cho việc di chuyển trong thành phố và các chuyến đi dài. Được trang bị công nghệ tiên tiến và tiết kiệm năng lượng.",
        fullAddress: "Quận 1, TP.HCM"
      },
      {
        id: 2,
        name: "VinFast VF 3",
        type: "Ô tô điện",
        batteryLevel: 92,
        range: 450,
        pricePerDay: 1200000,
        location: "Quận 2, TP.HCM",
        image: "/images/imagecar/vf3.jpg",
        available: true,
        features: {
          seats: 5,
          transmission: "Số tự động",
          fuel: "Điện",
          consumption: "0l/100km"
        },
        description: "VinFast VF 3 là mẫu xe điện thông minh với công nghệ AI tiên tiến, phù hợp cho gia đình hiện đại.",
        fullAddress: "123 Đường Nguyễn Văn Cừ, Quận 2, TP.HCM"
      },
      {
        id: 3,
        name: "VinFast VF 5",
        type: "Ô tô điện",
        batteryLevel: 78,
        range: 380,
        pricePerDay: 960000,
        location: "Quận 7, TP.HCM",
        image: "/images/imagecar/vf5.jpg",
        available: false,
        features: {
          seats: 7,
          transmission: "Số tự động",
          fuel: "Điện",
          consumption: "0l/100km"
        },
        description: "VinFast VF 5 là SUV điện 7 chỗ với không gian rộng rãi, lý tưởng cho gia đình đông người.",
        fullAddress: "456 Đường Huỳnh Tấn Phát, Quận 7, TP.HCM"
      },
      {
        id: 4,
        name: "VinFast VF 6",
        type: "Ô tô điện",
        batteryLevel: 88,
        range: 420,
        pricePerDay: 1080000,
        location: "Quận 3, TP.HCM",
        image: "/images/imagecar/vf6.jpg",
        available: true,
        features: {
          seats: 5,
          transmission: "Số tự động",
          fuel: "Điện",
          consumption: "0l/100km"
        },
        description: "VinFast VF 6 với thiết kế thể thao và hiệu suất cao, phù hợp cho những người yêu thích tốc độ.",
        fullAddress: "789 Đường Võ Văn Tần, Quận 3, TP.HCM"
      },
      {
        id: 5,
        name: "VinFast VF 7",
        type: "Ô tô điện",
        batteryLevel: 90,
        range: 400,
        pricePerDay: 800000,
        location: "Quận 1, TP.HCM",
        image: "/images/imagecar/vf7.jpg",
        available: true,
        features: {
          seats: 5,
          transmission: "Số tự động",
          fuel: "Điện",
          consumption: "0l/100km"
        },
        description: "VinFast VF 7 là sedan điện sang trọng với nội thất cao cấp và công nghệ tiên tiến.",
        fullAddress: "321 Đường Lê Lợi, Quận 1, TP.HCM"
      },
      {
        id: 6,
        name: "VinFast VF 8",
        type: "Ô tô điện",
        batteryLevel: 95,
        range: 500,
        pricePerDay: 1500000,
        location: "Quận 1, TP.HCM",
        image: "/images/imagecar/vf8.jpg",
        available: true,
        features: {
          seats: 5,
          transmission: "Số tự động",
          fuel: "Điện",
          consumption: "0l/100km"
        },
        description: "VinFast VF 8 là flagship với công nghệ AI và tự lái, đại diện cho tương lai của xe điện.",
        fullAddress: "654 Đường Nguyễn Huệ, Quận 1, TP.HCM"
      },
      {
        id: 7,
        name: "VinFast VF 9",
        type: "Ô tô điện",
        batteryLevel: 88,
        range: 480,
        pricePerDay: 1800000,
        location: "Quận 2, TP.HCM",
        image: "/images/imagecar/vf9.jpg",
        available: true,
        features: {
          seats: 7,
          transmission: "Số tự động",
          fuel: "Điện",
          consumption: "0l/100km"
        },
        description: "VinFast VF 9 là SUV điện cao cấp với không gian rộng rãi và công nghệ tiên tiến nhất.",
        fullAddress: "987 Đường Điện Biên Phủ, Quận 2, TP.HCM"
      },
      {
        id: 8,
        name: "VinFast Feliz",
        type: "Xe máy điện",
        batteryLevel: 90,
        range: 80,
        pricePerDay: 150000,
        location: "Quận 1, TP.HCM",
        image: "/images/imagecar/feliz.jpg",
        available: true,
        features: {
          seats: 2,
          transmission: "Tự động",
          fuel: "Điện",
          consumption: "0l/100km"
        },
        description: "VinFast Feliz là xe máy điện thông minh với thiết kế hiện đại, phù hợp cho di chuyển trong thành phố.",
        fullAddress: "147 Đường Pasteur, Quận 1, TP.HCM"
      },
      {
        id: 9,
        name: "VinFast Klara Neo",
        type: "Xe máy điện",
        batteryLevel: 95,
        range: 70,
        pricePerDay: 120000,
        location: "Quận 2, TP.HCM",
        image: "/images/imagecar/klaraneo.jpg",
        available: true,
        features: {
          seats: 2,
          transmission: "Tự động",
          fuel: "Điện",
          consumption: "0l/100km"
        },
        description: "VinFast Klara Neo là xe máy điện thế hệ mới với pin lithium-ion và công nghệ thông minh.",
        fullAddress: "258 Đường Cách Mạng Tháng 8, Quận 2, TP.HCM"
      },
      // Bổ sung các mẫu xe máy điện dùng ở trang Index/Search (IDs 11-15)
      {
        id: 11,
        name: "VinFast Feliz",
        type: "Xe máy điện",
        batteryLevel: 90,
        range: 80,
        pricePerDay: 150000,
        location: "Quận 1, TP.HCM",
        image: "/images/imagecar/feliz.jpg",
        available: true,
        features: {
          seats: 2,
          transmission: "Tự động",
          fuel: "Điện",
          consumption: "0l/100km"
        },
        description: "VinFast Feliz là xe máy điện thông minh với thiết kế hiện đại, phù hợp cho di chuyển trong thành phố.",
        fullAddress: "147 Đường Pasteur, Quận 1, TP.HCM"
      },
      {
        id: 12,
        name: "VinFast Klara Neo",
        type: "Xe máy điện",
        batteryLevel: 95,
        range: 70,
        pricePerDay: 120000,
        location: "Quận 2, TP.HCM",
        image: "/images/imagecar/klaraneo.jpg",
        available: true,
        features: {
          seats: 2,
          transmission: "Tự động",
          fuel: "Điện",
          consumption: "0l/100km"
        },
        description: "VinFast Klara Neo là xe máy điện thế hệ mới với pin lithium-ion và công nghệ thông minh.",
        fullAddress: "258 Đường Cách Mạng Tháng 8, Quận 2, TP.HCM"
      },
      {
        id: 13,
        name: "VinFast Evo Neo",
        type: "Xe máy điện",
        batteryLevel: 85,
        range: 75,
        pricePerDay: 130000,
        location: "Quận 1, TP.HCM",
        image: "/images/imagecar/evoneo.jpg",
        available: true,
        features: {
          seats: 2,
          transmission: "Tự động",
          fuel: "Điện",
          consumption: "0l/100km"
        },
        description: "VinFast Evo Neo nhỏ gọn, tiết kiệm và phù hợp đi lại hằng ngày trong nội đô.",
        fullAddress: "12 Nguyễn Thị Minh Khai, Quận 1, TP.HCM"
      },
      {
        id: 14,
        name: "VinFast Evo Grand",
        type: "Xe máy điện",
        batteryLevel: 88,
        range: 85,
        pricePerDay: 140000,
        location: "Quận 3, TP.HCM",
        image: "/images/imagecar/evogrand.jpg",
        available: true,
        features: {
          seats: 2,
          transmission: "Tự động",
          fuel: "Điện",
          consumption: "0l/100km"
        },
        description: "VinFast Evo Grand có thiết kế hiện đại, vận hành êm ái và bền bỉ.",
        fullAddress: "45 Võ Văn Tần, Quận 3, TP.HCM"
      },
      {
        id: 15,
        name: "VinFast Vento Neo",
        type: "Xe máy điện",
        batteryLevel: 92,
        range: 90,
        pricePerDay: 150000,
        location: "Quận 1, TP.HCM",
        image: "/images/imagecar/ventoneo.jpg",
        available: true,
        features: {
          seats: 2,
          transmission: "Tự động",
          fuel: "Điện",
          consumption: "0l/100km"
        },
        description: "VinFast Vento Neo cao cấp với hiệu năng tốt, phù hợp di chuyển linh hoạt.",
        fullAddress: "90 Lê Lợi, Quận 1, TP.HCM"
      }
    ];
    
    const vehicleId = parseInt(id || "1");
    const foundVehicle = mockVehicles.find(v => v.id === vehicleId);
    
    if (foundVehicle) {
      setVehicle(foundVehicle);
    } else {
      setVehicle(null);
    }
  }, [id]);

  // Dynamic pricing based on vehicle price
  const basePrice = vehicle?.pricePerDay || 600000;
  const pricingOptions = [
    
    { 
      duration: "8", 
      price: Math.round(basePrice * 1.1), 
      originalPrice: Math.round(basePrice * 1.25), 
      discount: 12 
    },   
    { 
      duration: "24", 
      price: Math.round(basePrice * 1.6), 
      originalPrice: Math.round(basePrice * 1.8), 
      discount: 12 
    },
  ];

  const selectedPricing = pricingOptions.find(p => p.duration === selectedDuration) || pricingOptions[0];

  const handleBooking = () => {
    if (startDate && endDate && paymentMethod && vehicle) {
      const bookingData = {
        vehicleId: vehicle.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        duration: parseInt(selectedDuration),
        totalPrice: selectedPricing.price,
        pickupLocation: pickupOption === "self" ? vehicle.fullAddress : "The Beverly Solari, 39693 Phước Thiện, Long Bình, Quận 9, Hồ Chí Minh",
        paymentMethod,
      };
      
      // Handle booking submission
      console.log("Booking data:", bookingData);
      alert(`Đặt xe thành công! Tổng tiền: ${selectedPricing.price.toLocaleString()}đ`);
    }
  };

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy xe</h1>
          <Button onClick={() => navigate("/")}>Quay về trang chủ</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar isLoggedIn={isLoggedIn} username={username} />
      
      {/* Header */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg font-semibold">Chi tiết xe</h1>
            </div>
            
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Vehicle Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Title and Badge */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{vehicle.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{vehicle.location}</span>
                </div>
              </div>
              
            </div>

            {/* Main Image */}
            <div>
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="w-full rounded-lg"
              />
            </div>

            {/* Features */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b-2 border-green-500 pb-2 inline-block">
                Đặc điểm
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div>
                    <span className="text-sm text-muted-foreground">Số ghế</span>
                    <p className="font-medium">{vehicle.features?.seats} chỗ</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-blue-500" />
                  <div>
                    <span className="text-sm text-muted-foreground">Truyền động</span>
                    <p className="font-medium">{vehicle.features?.transmission}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Battery className="w-5 h-5 text-blue-500" />
                  <div>
                    <span className="text-sm text-muted-foreground">Nhiên liệu</span>
                    <p className="font-medium">{vehicle.features?.fuel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Leaf className="w-5 h-5 text-blue-500" />
                  <div>
                    <span className="text-sm text-muted-foreground">Tiêu hao</span>
                    <p className="font-medium">{vehicle.features?.consumption}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b-2 border-green-500 pb-2 inline-block">
                Mô tả
              </h2>
              <p className="text-muted-foreground leading-relaxed">{vehicle.description}</p>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b-2 border-green-500 pb-2 inline-block">
                Vị trí xe
              </h2>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <p className="font-medium">{vehicle.fullAddress}</p>
                  
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing and Booking */}
          <div className="space-y-6">
            {/* Pricing */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Giá thuê</h3>
              <div className="space-y-3">
                {pricingOptions.map((option) => (
                  <div
                    key={option.duration}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedDuration === option.duration
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedDuration(option.duration)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {option.duration === "24" ? "1 ngày" : `${option.duration} giờ`}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600">
                            {option.price.toLocaleString()}đ
                          </span>
                          <span className="text-sm text-muted-foreground line-through">
                            {option.originalPrice.toLocaleString()}đ
                          </span>
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            -{option.discount}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
             
            </div>

            {/* Rental Time */}
            <div className="border-2 border-grenn-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="w-4 h-4 text-red-500" />
                <span className="font-medium">Thời gian thuê</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <Label className="text-xs">Ngày bắt đầu</Label>
                  <Input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Ngày kết thúc</Label>
                  <Input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Xe đang bận trong các khung thời gian này. Vui lòng chọn thời gian khác.</span>
              </div>
            </div>

            {/* Bảo hiểm thuê xe */}
            <div className="my-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold mb-2 text-black">Bảo hiểm thuê xe</h4>
              <p className="text-sm text-gray-700">
                Chuyến đi có mua bảo hiểm. Khách thuê bồi thường tối đa <span className="font-semibold text-red-600">2.000.000 VNĐ</span> trong trường hợp có sự cố ngoài ý muốn.
              </p>
              <div
                className="mt-2 text-xs text-blue-600 cursor-pointer hover:underline"
                onClick={() => setShowInsuranceModal(true)}
              >
                Xem thêm &gt;
              </div>
            </div>

            {/* Modal chi tiết bảo hiểm */}
            {showInsuranceModal && (
              <Dialog open={showInsuranceModal} onOpenChange={setShowInsuranceModal}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Bảo hiểm thuê xe điện</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 text-sm text-gray-800">
                    <p>
                      Với nhiều năm kinh nghiệm trong lĩnh vực cho thuê xe, chúng tôi hiểu rằng các rủi ro đâm đụng, cháy nổ, thủy kích gây tổn thất lớn (vượt quá khả năng chi trả) luôn tiềm ẩn trong thời gian thuê xe.
                    </p>
                    <p>
                      Trong khi đó, hầu hết các rủi ro phát sinh trong quá trình thuê xe tự lái sẽ không thuộc phạm vi của Bảo hiểm thân vỏ xe theo năm (hay còn gọi là Bảo hiểm 2 chiều).
                    </p>
                    <p>
                      Xuất phát từ nhu cầu thiết yếu của khách hàng, chúng tôi kết hợp với các đối tác bảo hiểm hàng đầu Việt Nam cùng mang đến sản phẩm Bảo hiểm thuê xe điện với mức phí thực sự tiết kiệm và số tiền bảo hiểm lớn (đến 100% giá trị xe) sẽ giúp bạn không còn lo lắng khi thuê xe & an tâm tận hưởng hành trình của mình.
                    </p>
                    <h4 className="font-semibold mt-4">I. Nội dung sản phẩm Bảo hiểm thuê xe</h4>
                    <p>
                      Trong thời gian thuê xe, nếu xảy ra các sự cố va chạm ngoài ý muốn dẫn đến tổn thất về xe, khách thuê sẽ chỉ bồi thường số tiền tối đa <span className="font-semibold text-red-600">2.000.000 VNĐ</span> để sửa chữa xe (mức khấu trừ), nhà bảo hiểm sẽ hỗ trợ cho các chi phí phát sinh vượt mức khấu trừ.
                    </p>
                    {/* Bảng minh họa bảo hiểm */}
                    <div className="my-4">
                      <table className="w-full text-sm border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                        <thead>
                          <tr>
                            <th className="py-2 px-3 text-left">Thiệt hại xe</th>
                            <th className="py-2 px-3 text-left">Khách thanh toán</th>
                            <th className="py-2 px-3 text-left">BH thanh toán</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t">
                            <td className="py-2 px-3">&lt;= 2 triệu</td>
                            <td className="py-2 px-3">&lt;= 2 triệu</td>
                            <td className="py-2 px-3">0 triệu</td>
                          </tr>
                          <tr className="border-t">
                            <td className="py-2 px-3">&gt; 2 triệu</td>
                            <td className="py-2 px-3">2 triệu</td>
                            <td className="py-2 px-3">298 triệu</td>
                          </tr>
                        </tbody>
                      </table>
                      <div className="mt-2 text-xs text-gray-700">
                        Ví dụ minh họa: Xe có sự cố tổn thất <span className="font-semibold">300.000.000đ</span>.
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Bảng phụ phí */}
            <div className="my-6">
              <h4 className="font-semibold mb-2 text-black">Phụ phí có thể phát sinh</h4>
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-3 text-left">Loại phí</th>
                    <th className="py-2 px-3 text-left">Mức phí</th>
                    <th className="py-2 px-3 text-left">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="py-2 px-3">Phí vượt giới hạn</td>
                    <td className="py-2 px-3">4.000₫/km</td>
                    <td className="py-2 px-3">Vượt quá 400km khi thuê xe 1 ngày</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2 px-3">Phí sạc Pin</td>
                    <td className="py-2 px-3">2.400₫/1% mã pin</td>
                    <td className="py-2 px-3">Thanh toán theo thực tế sử dụng</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2 px-3">Phí quá giờ</td>
                    <td className="py-2 px-3">100.000₫/giờ</td>
                    <td className="py-2 px-3">Trễ quá 5 giờ, phụ phí thêm 1 ngày thuê</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2 px-3">Phụ phí khác</td>
                    <td className="py-2 px-3">Theo thực tế</td>
                    <td className="py-2 px-3">Trả xe không đảm bảo vệ sinh hoặc bị ám mùi</td>
                  </tr>
                </tbody>
              </table>
              
            </div>

            {/* Total and Book Button */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-green-700">
                  {selectedPricing.duration === "24" ? "1 ngày" : `${selectedPricing.duration} giờ`} × {selectedPricing.price.toLocaleString()}₫
                </span>
                <span className="text-xl font-bold text-green-800">
                  {selectedPricing.price.toLocaleString()}₫
                </span>
              </div>
              <Button
                className="w-full bg-green-500 hover:bg-green-600"
                onClick={handleBooking}
                disabled={!startDate || !endDate || !paymentMethod}
              >
                Đặt xe ngay
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsPage;
