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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type VehicleType = "" | "suv" | "sedan" | "hatchback";

const Index: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      const name = localStorage.getItem("username");
      if (name) setUsername(name);
    }
  }, [isLoggedIn]);

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
    {name: "VinFast VF e34",price: "600.000₫/ngày",type: "SUV",image: "https://vinfastauto.com/sites/default/files/2022-12/VFe34_1.jpg",},
    {name: "VinFast VF 7",price: "1.200.000₫/ngày",type: "SUV",image:"https://tesla-cdn.thron.com/delivery/public/image/tesla/2e45df6b-33b8-4574-93af-4286371bb896/bvlatuR/std/1920x1080/global-specs-hero",},
    {name: "VinFast VF 6",price: "950.000₫/ngày",type: "SUV",image:"https://www.kia.com/content/dam/kwcms/gt/en/images/vehicles/ev6/ev6-my22/ev6-my22-main-KV.jpg",},
    {name: "VinFast VF 9",price: "900.000₫/ngày",type: "SUV",image: "https://cdn.motor1.com/images/mgl/9xq6z/s3/hyundai-ioniq-5.jpg",},
  ];

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
            <Link to="/cars" className="text-foreground hover:text-primary font-medium">
              Danh sách xe
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
      <main className="flex-1 pt-6">
        <section className="relative py-16 px-4 text-center bg-gradient-to-b from-white to-secondary/20">
        
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Thuê xe điện <span className="text-primary">Tương lai xanh</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Trải nghiệm xe điện hiện đại — đặt xe nhanh, an toàn, thân thiện môi trường.
          </p>

          {/* SearchForm */}
          <div className="max-w-5xl mx-auto -mt-8 relative z-10">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white p-6 rounded-2xl shadow-lg border grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
            >
              <div>
                <label className="text-xs text-muted-foreground">Địa điểm</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ví dụ: Hà Nội, HCM..."
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Ngày nhận</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Ngày trả</label>
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
                    <option value="suv">SUV</option>
                    <option value="sedan">Sedan</option>
                    <option value="hatchback">Hatchback</option>
                  </select>
                  <Button type="submit" className="bg-primary hover:bg-accent text-primary-foreground">
                    <Search className="h-4 w-4 mr-2" /> Tìm
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Small features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <Battery className="w-10 h-10 text-primary" />
              <h3 className="mt-4 font-semibold">100% Xe điện</h3>
              <p className="text-muted-foreground text-sm">Không khí sạch, di chuyển xanh</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Shield className="w-10 h-10 text-primary" />
              <h3 className="mt-4 font-semibold">An toàn tối đa</h3>
              <p className="text-muted-foreground text-sm">Bảo hiểm & hỗ trợ 24/7</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Car className="w-10 h-10 text-primary" />
              <h3 className="mt-4 font-semibold">Đa dạng lựa chọn</h3>
              <p className="text-muted-foreground text-sm">Nhiều mẫu xe phù hợp nhu cầu</p>
            </div>
          </div>
        </section>

        {/* Popular Cars */}
        <section className="py-16 px-4 bg-secondary/10">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-foreground text-center mb-8">Xe phổ biến</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularCars.map((car, idx) => (
                <Card key={idx} className="overflow-hidden group hover:shadow-lg transition-all">
                  <div className="relative h-44">
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 text-white font-semibold">{car.name}</div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <div className="text-lg font-bold text-primary">{car.price}</div>
                        <div className="text-sm text-muted-foreground">{car.type}</div>
                      </div>
                      <Button variant="outline" size="sm" className="text-primary border-secondary">
                        Thuê
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">Xe điện hiện đại, tiết kiệm năng lượng.</p>
                  </CardContent>
                </Card>
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
                <h4 className="font-semibold">Dễ đặt</h4>
                <p className="text-muted-foreground">Giao diện đơn giản, xác nhận tức thì</p>
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
