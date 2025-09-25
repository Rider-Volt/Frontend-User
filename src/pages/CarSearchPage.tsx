import { useState, useEffect } from "react";
import { Car, MapPin, Battery, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "../components/heroUi/Navbar";
import SearchBar, { VehicleType } from "../components/heroUi/Searchbar"; // ✅ dùng SearchBar

const CarSearchPage = () => {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

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

  // ✅ SearchBar submit → cập nhật state filter
  const handleSearchSubmit = (params: {
    location: string;
    startDate: string;
    endDate: string;
    vehicleType: VehicleType;
  }) => {
    setLocation(params.location);
    setStartDate(params.startDate);
    setEndDate(params.endDate);
    setVehicleType(params.vehicleType);
  };

  const popularCars = [
    {
      id: 1,
      name: "VinFast VF e34",
      type: "SUV",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/images/imagecar/e34.jpg",
      available: true,
    },
    {
      id: 2,
      name: "VINFAST VF 3",
      type: "SUV",
      batteryLevel: 92,
      range: 450,
      pricePerDay: 1200000,
      location: "Quận 2, TP.HCM",
      image: "/images/imagecar/vf3.jpg",
      available: true,
    },
    {
      id: 3,
      name: "VINFAST VF 5",
      type: "SUV",
      batteryLevel: 78,
      range: 380,
      pricePerDay: 960000,
      location: "Quận 7, TP.HCM",
      image: "/images/imagecar/vf5.jpg",
      available: false,
    },
    {
      id: 4,
      name: "VINFAST VF 6",
      type: "SUV",
      batteryLevel: 88,
      range: 420,
      pricePerDay: 1080000,
      location: "Quận 3, TP.HCM",
      image: "/images/imagecar/vf6.jpg",
      available: true,
    },
    {
      id: 55,
      name: "VINFAST VF 7",
      type: "SUV",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/images/imagecar/vf7.jpg",
      available: true,
    },
    {
      id: 6,
      name: "VINFAST VF 7 plus",
      type: "SUV",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/images/imagecar/vf7.jpg",
      available: true,
    },
    {
      id: 7,
      name: "VINFAST VF 8",
      type: "SUV",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/images/imagecar/vf8.jpg",
      available: true,
    },
    {
      id: 8,
      name: "VinFast VF 8 plus",
      type: "SUV",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/images/imagecar/vf8.jpg",
      available: true,
    },
    {
      id: 9,
      name: "VinFast VF 9",
      type: "SUV",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/images/imagecar/vf9.jpg",
      available: true,
    },
    {
      id: 10,
      name: "VinFast VF 9 plus",
      type: "SUV",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/images/imagecar/vf9.jpg",
      available: true,
    },
    {
      id: 11,
      name: "xe máy điện VinFast feliz",
      type: "SUV",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/images/imagecar/feliz.jpg",
      available: true,
    },
    {
      id: 12,
      name: "xe máy điện VinFast klara Neo ",
      type: "SUV",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/images/imagecar/klaraneo.jpg",
      available: true,
    },
    {
      id: 13,
      name: "xe máy điện VinFast evoneo",
      type: "SUV",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/images/imagecar/evoneo.jpg",
      available: true,
    },
    {
      id: 14,
      name: "xe máy điện VinFast evogrand",
      type: "SUV",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/images/imagecar/evogrand.jpg",
      available: true,
    },
    {
      id: 15,
      name: "xe máy điện VinFast ventoneo",
      type: "SUV",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/images/imagecar/ventoneo.jpg",
      available: true,
    },
  ];
   

  const filteredCars = vehicleType
  ? popularCars.filter((car) => car.type.toLowerCase() === vehicleType)
  : popularCars;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary/20 to-accent/20">
      {/* Header */}
      <Navbar
        isLoggedIn={isLoggedIn}
        username={username}
        onLogout={handleLogout}
      />

      {/* ✅ SearchBar thay cho form inline */}
      <section className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">
          Tìm kiếm xe điện phù hợp
        </h1>
        <SearchBar onSubmit={handleSearchSubmit} />
      </section>

      {/* Car List */}
      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold mb-6">Danh sách xe có sẵn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCars.map((car) => (
            <Card
              key={car.id}
              className="group hover:shadow-lg transition-all overflow-hidden"
            >
              <div className="relative">
                <img
                  src={car.image}
                  alt={car.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-4 right-4">
                  {car.available ? (
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
                <CardTitle className="text-lg font-semibold mb-2">
                  {car.name}
                </CardTitle>
                <p className="text-muted-foreground text-sm mb-3">{car.type}</p>
                <div className="text-primary font-bold text-xl">
                  {car.pricePerDay.toLocaleString()}đ/ngày
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-primary" />
                    <span className="text-sm">{car.batteryLevel}% pin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent-foreground" />
                    <span className="text-sm">{car.range}km</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{car.location}</span>
                </div>

                {car.available ? (
                  <Button
                    variant="default"
                    className="w-full bg-primary hover:bg-accent"
                  >
                    Đặt xe ngay
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Không có sẵn
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 mt-auto">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Car className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-white">EV Rental</span>
              </div>
              <p className="text-gray-400">
                Đồng hành cùng bạn trên mọi hành trình xanh.
              </p>
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
        </div>
      </footer>
    </div>
  );
};

export default CarSearchPage;
