import React, { useState, useEffect } from "react";
import { Shield, Ticket, HeartHandshake } from "lucide-react";
import Navbar from "../components/heroUi/Navbar";
// Search bar removed from homepage
import EVCard from "../components/heroUi/EVCard";
import { useNavigate } from "react-router-dom";
import { groupCarsByType } from "@/services/carServices";
import { VehicleData } from "@/types/vehicle";
import { fetchVehiclesLimited } from "@/services/vehicleService";

const Index: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);

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

  // Search submit handler removed with SearchBar

  useEffect(() => {
    let cancelled = false;
    const loadVehicles = async () => {
      setLoadingVehicles(true);
      setVehiclesError(null);
      try {
        const data = await fetchVehiclesLimited(24);
        if (!cancelled) {
          setVehicles(data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setVehiclesError(err?.message || "Không tải được danh sách xe");
        }
      } finally {
        if (!cancelled) {
          setLoadingVehicles(false);
        }
      }
    };
    loadVehicles();
    return () => {
      cancelled = true;
    };
  }, []);

  const carGroups = groupCarsByType(vehicles.filter((car) => car.available !== false));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary/20 to-accent/20">
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

          {/* Search bar removed as requested */}

          <div className="relative z-10 container mx-auto px-4 text-center">
            <h1 className="text-6xl md:text-8xl font-extrabold leading-tight mb-6 text-white">
              Thuê xe điện{" "}
              <span className="block bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Tương lai xanh
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-white/90 mb-12 max-w-4xl mx-auto">
              Trải nghiệm công nghệ xe điện tiên tiến. Thuê xe theo ngày, thuận
              tiện và thân thiện với môi trường.
            </p>
          </div>
        </section>

        {/* Popular Cars */}
        <section className="py-16 px-4 bg-secondary/10">
          <div className="container mx-auto max-w-7xl space-y-16">
            {loadingVehicles ? (
              <p>Đang tải xe nổi bật…</p>
            ) : vehiclesError ? (
              <p className="text-center text-red-500">{vehiclesError}</p>
            ) : Object.keys(carGroups).length > 0 ? (
              Object.entries(carGroups).map(([groupName, cars]) => (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cars.slice(0, 4).map((car) => (
                      <EVCard
                        key={car.id}
                        {...car}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">
                Chưa có xe để hiển thị.
              </p>
            )}
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
              </div>
              <div>
                <Ticket className="h-12 w-12 mx-auto text-primary mb-4" />
                <h4 className="font-semibold">Thuê theo ngày</h4>
              </div>
              <div>
                <HeartHandshake className="h-12 w-12 mx-auto text-primary mb-4" />
                <h4 className="font-semibold">Hỗ trợ 24/7</h4>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 mt-auto">
        <div className="container mx-auto max-w-7xl">EV Rental © 2025</div>
      </footer>
    </div>
  );
};

export default Index;
