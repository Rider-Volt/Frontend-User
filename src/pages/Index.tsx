import React, { useState, useEffect } from "react";
import { Car, Shield, Ticket, HeartHandshake } from "lucide-react";
import Navbar from "../components/heroUi/Navbar";
import SearchBar, { VehicleType } from "../components/heroUi/Searchbar";
import { useNavigate } from "react-router-dom";
import EVCard from "../components/heroUi/EVCard";
import { groupCarsByType, Car as CarType } from "@/services/carServices";

const Index: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setIsLoggedIn(true);
      try {
        const parsed = JSON.parse(userData);
        setUsername(parsed.username || parsed.full_name || parsed.email || "");
      } catch {
        setUsername("");
      }
    } else {
      setIsLoggedIn(false);
      setUsername("");
    }
  }, []);

  const handleSearchSubmit = (params: {
    location: string;
    startDate: string;
    endDate: string;
    vehicleType: VehicleType;
  }) => {
    const searchParams = new URLSearchParams();
    if (params.location) searchParams.append("location", params.location);
    if (params.startDate) searchParams.append("start", params.startDate);
    if (params.endDate) searchParams.append("end", params.endDate);
    if (params.vehicleType) searchParams.append("type", params.vehicleType);

    navigate(`/search?${searchParams.toString()}`);
  };

  // 🚗 Dữ liệu demo ngay tại đây
  const popularCars: CarType[] = [
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
      available: true,
    },
    {
      id: 3,
      name: "VINFAST VF 5",
      type: "Ô tô điện",
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
      type: "Ô tô điện",
      batteryLevel: 88,
      range: 420,
      pricePerDay: 1080000,
      location: "Quận 3, TP.HCM",
      image: "/images/imagecar/vf6.jpg",
      available: true,
    },
    {
      id: 5,
      name: "Xe máy điện VinFast Klara Neo",
      type: "Xe máy điện",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/images/imagecar/klaraneo.jpg",
      available: true,
    },
    {
      id: 6,
      name: "Xe máy điện VinFast EvoGrand",
      type: "Xe máy điện",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/images/imagecar/evogrand.jpg",
      available: true,
    },
    {
      id: 7,
      name: "Xe máy điện VinFast Feliz",
      type: "Xe máy điện",
      batteryLevel: 85,
      range: 200,
      pricePerDay: 200000,
      location: "Quận 1, TP.HCM",
      image: "/images/imagecar/feliz.jpg",
      available: true,
    },
    {
      id: 8,
      name: "Xe máy điện VinFast EvoNeo",
      type: "Xe máy điện",
      batteryLevel: 75,
      range: 180,
      pricePerDay: 400000,
      location: "Quận Bình Thạnh, TP.HCM",
      image: "/images/imagecar/evoneo.jpg",
      available: true,
    },
  ];

  // ✅ Nhóm xe theo loại
  const carGroups = groupCarsByType(popularCars);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary/20 to-accent/20">
      {/* Navbar */}
      <Navbar isLoggedIn={isLoggedIn} username={username} />

      {/* Hero */}
      <main className="flex-1">
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="/images/imagecar/indexcar.jpg"
              alt="VinFast Electric Vehicle"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="relative z-10 container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.2] text-white">
              Thuê xe điện{" "}
              <span className="block bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent pb-5">
                Tương lai xanh
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
              Trải nghiệm công nghệ xe điện tiên tiến. Thuê xe theo ngày, thuận
              tiện và thân thiện với môi trường.
            </p>

            <div className="max-w-5xl mx-auto">
              <SearchBar onSubmit={handleSearchSubmit} />
            </div>
          </div>
        </section>

        {/* Popular Cars theo loại */}
        <section className="py-16 px-4 bg-secondary/10">
          <div className="container mx-auto max-w-7xl space-y-16">
            {Object.entries(carGroups).map(([groupName, cars]) => (
              <div key={groupName}>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold">{groupName}</h2>
                  <button
                    onClick={() => navigate(`/search?type=${groupName}`)}
                    className="text-primary hover:underline"
                  >
                    Xem tất cả
                  </button>
                </div>
                {cars.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cars.map((car) => (
                      <EVCard key={car.id} {...car} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    Hiện chưa có xe {groupName.toLowerCase()} nào.
                  </p>
                )}
              </div>
            ))}
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
                <p className="text-muted-foreground">
                  Đối tác & bảo hiểm cho mọi chuyến đi
                </p>
              </div>
              <div>
                <Ticket className="h-12 w-12 mx-auto text-primary mb-4" />
                <h4 className="font-semibold">Thuê theo ngày</h4>
                <p className="text-muted-foreground">
                  Linh hoạt từ 1 ngày đến 1 tháng
                </p>
              </div>
              <div>
                <HeartHandshake className="h-12 w-12 mx-auto text-primary mb-4" />
                <h4 className="font-semibold">Hỗ trợ 24/7</h4>
                <p className="text-muted-foreground">
                  Chăm sóc khách hàng tận tâm
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 mt-auto">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8">
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
      </footer>
    </div>
  );
};

export default Index;
