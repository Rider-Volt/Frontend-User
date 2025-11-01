import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/heroUi/Navbar";
import EVCard from "../components/heroUi/EVCard"; // 👈 dùng lại EVCard
import { VehicleData } from "@/types/vehicle";
import { fetchVehiclesFiltered } from "@/services/vehicleService";

// VehicleType is just a string (empty means "all")
type VehicleType = string;

const CarSearchPage = () => {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersReady, setFiltersReady] = useState(false);

  const urlLocation = useLocation();

  useEffect(() => {
    // ✅ đọc query params khi load trang
    const params = new URLSearchParams(urlLocation.search);
    setLocation(params.get("location") || "");
    setStartDate(params.get("start") || "");
    setEndDate(params.get("end") || "");
    setVehicleType((params.get("type") as VehicleType) || "");
    setFiltersReady(true);
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

  useEffect(() => {
    let cancelled = false;
    const loadVehicles = async () => {
      if (!filtersReady) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchVehiclesFiltered({
          location,
          type: vehicleType,
          limit: 60,
        });
        if (!cancelled) {
          setVehicles(data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Không tải được danh sách xe");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    loadVehicles();
    return () => {
      cancelled = true;
    };
  }, [location, vehicleType, filtersReady]);

  // ✅ If server already filtered, keep simple availability check
  const filteredCars = vehicles.filter((car) => (car.available ?? true));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary/20 to-accent/20">
      <Navbar isLoggedIn={isLoggedIn} username={username} />

      <section className="container mx-auto px-4 pb-20 pt-12">
        <h2 className="text-2xl font-bold mb-6">Danh sách xe có sẵn</h2>
        {loading ? (
          <p>Đang tải danh sách xe…</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCars.length > 0 ? (
              filteredCars.map((car) => (
                <EVCard
                  key={car.id}
                  {...car}
                />
              ))
            ) : (
              <p>Không tìm thấy xe nào phù hợp.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default CarSearchPage;
