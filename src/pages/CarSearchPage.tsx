import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/heroUi/Navbar";
import SearchBar, { VehicleType } from "../components/heroUi/Searchbar";
import EVCard from "../components/heroUi/EVCard"; // 👈 dùng lại EVCard

const CarSearchPage = () => {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  const urlLocation = useLocation();

  useEffect(() => {
    // ✅ đọc query params khi load trang
    const params = new URLSearchParams(urlLocation.search);
    setLocation(params.get("location") || "");
    setStartDate(params.get("start") || "");
    setEndDate(params.get("end") || "");
    setVehicleType((params.get("type") as VehicleType) || "");
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
      id: 55,
      name: "VINFAST VF 7",
      type: "Ô tô điện",
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
      type: "Ô tô điện",
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
      type: "Ô tô điện",
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
      type: "Ô tô điện",
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
      type: "Ô tô điện",
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
      type: "Ô tô điện",
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
      type: "Xe máy điện",
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
      type: "Xe máy điện",
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
      type: "Xe máy điện",
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
      type: "Xe máy điện",
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
      type: "Xe máy điện",
      batteryLevel: 85,
      range: 300,
      pricePerDay: 600000,
      location: "Quận 1, TP.HCM",
      image: "/images/imagecar/ventoneo.jpg",
      available: true,
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

  const handleBookingSubmit = (bookingData: any) => {
    console.log("Booking submitted:", bookingData);
    alert(
      `Đặt xe thành công! Tổng tiền: ${bookingData.totalPrice.toLocaleString()}đ`
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary/20 to-accent/20">
      <Navbar isLoggedIn={isLoggedIn} username={username} />

      <section className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-center mb-8">
          Tìm kiếm xe điện phù hợp
        </h1>
        <div className="max-w-5xl mx-auto">
          <SearchBar onSubmit={handleSearchSubmit} />
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold mb-6">Danh sách xe có sẵn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCars.length > 0 ? (
            filteredCars.map((car) => (
              <EVCard
                key={car.id}
                {...car}
                onBookingSubmit={handleBookingSubmit}
              />
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
