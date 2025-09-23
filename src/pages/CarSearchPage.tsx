import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // 👈 thêm cái này
import { Car, MapPin, Battery, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "../components/heroUi/Navbar";
import SearchBar, { VehicleType } from "../components/heroUi/Searchbar";

const CarSearchPage = () => {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  const urlLocation = useLocation(); // 👈 lấy URL hiện tại

  useEffect(() => {
    // ✅ đọc query params khi load trang
    const params = new URLSearchParams(urlLocation.search);
    const qLocation = params.get("location") || "";
    const qStart = params.get("start") || "";
    const qEnd = params.get("end") || "";
    const qType = (params.get("type") as VehicleType) || "";

    setLocation(qLocation);
    setStartDate(qStart);
    setEndDate(qEnd);
    setVehicleType(qType);
  }, [urlLocation.search]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      try {
        const parsed = JSON.parse(user);
        setIsLoggedIn(true);
        setUsername(parsed.username || parsed.full_name || parsed.email || "");
      } catch {
        setIsLoggedIn(false);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUsername("");
  };

  // ✅ SearchBar submit → cập nhật filter state
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

  // demo data
  const popularCars = [
    {
       id: 1,
       name: "VinFast VF e34",
       type: "Ô tô điện",
       batteryLevel: 85,
       range: 300,
       pricePerDay: 600000,
       location: "Quận 1, TP.HCM",
       image: "/images/imagecar/e34.jpg",
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
       image: "/images/imagecar/vf3.jpg",
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
       image: "/images/imagecar/vf5.jpg",
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
       image: "/images/imagecar/vf6.jpg",
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
      image: "/images/imagecar/vf7.jpg",
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
      image: "/images/imagecar/vf7.jpg",
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
      image: "/images/imagecar/vf8.jpg",
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
      image: "/images/imagecar/vf8.jpg",
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
      image: "/images/imagecar/vf9.jpg",
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
      image: "/images/imagecar/vf9.jpg",
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
      image: "/images/imagecar/feliz.jpg",
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
      image: "/images/imagecar/klaraneo.jpg",
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
      image: "/images/imagecar/evoneo.jpg",
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
      image: "/images/imagecar/evogrand.jpg",
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
      image: "/images/imagecar/ventoneo.jpg",
      available: true
    },
  ];

  // ✅ filter
  const filteredCars = popularCars.filter((car) => {
    const matchLocation = location
      ? car.location.toLowerCase().includes(location.toLowerCase())
      : true;
    const matchType = vehicleType
      ? car.type.toLowerCase() === vehicleType.toLowerCase()
      : true;
    return matchLocation && matchType;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary/20 to-accent/20">
      <Navbar isLoggedIn={isLoggedIn} username={username} />
      <section className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">
          Tìm kiếm xe điện phù hợp
        </h1>
        <SearchBar onSubmit={handleSearchSubmit} />
      </section>

      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold mb-6">Danh sách xe có sẵn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCars.length > 0 ? (
            filteredCars.map((car) => (
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
                  <p className="text-muted-foreground text-sm mb-3">
                    {car.type}
                  </p>
                  <div className="text-primary font-bold text-xl">
                    {car.pricePerDay.toLocaleString()}đ/ngày
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Battery className="w-4 h-4 text-primary" />
                      <span className="text-sm">{car.batteryLevel}% pin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-accent-foreground" />
                      <span className="text-sm">{car.range}km</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{car.location}</span>
                  </div>
                  {car.available ? (
                    <Button className="w-full bg-primary hover:bg-accent">
                      Đặt xe ngay
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      Không có sẵn
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p>Không tìm thấy xe nào phù hợp.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default CarSearchPage;
