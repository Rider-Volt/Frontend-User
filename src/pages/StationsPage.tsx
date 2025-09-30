import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "../components/heroUi/Navbar";
import { getCurrentUser } from "@/services/authService";
import { getRentalPoints, RentalPoint } from "@/services/stationServices";
import MapComponent from "@/components/Map";

const StationsPage: React.FC = () => {
  const [points, setPoints] = useState<RentalPoint[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [district, setDistrict] = useState("all");
  const [city, setCity] = useState("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedPointId, setSelectedPointId] = useState<number | undefined>(undefined);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setIsLoggedIn(true);
      setUsername(user.full_name || user.username);
    }
    getRentalPoints().then(setPoints);
  }, []);

  const cities = useMemo(() => Array.from(new Set(points.map(p => p.city))), [points]);
  const districts = useMemo(() => Array.from(new Set(points.filter(p => !city || city === "Tất cả" || p.city === city).map(p => p.district))), [points, city]);

  const filteredPoints = points.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDistrict = district === "all" || p.district === district;
    const matchCity = city === "all" || p.city === city;
    return matchSearch && matchDistrict && matchCity;
  });

  const handlePointPositionChange = (pointId: number, lat: number, lng: number) => {
    setPoints((prev) => prev.map((p) => (p.id === pointId ? { ...p, lat, lng } : p)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 to-accent/20">
      <Navbar isLoggedIn={isLoggedIn} username={username} />

      <main className="px-0 pt-0">
        <div className="flex gap-0">
          {/* Sidebar danh sách trạm */}
          <aside className="block w-[360px]">
            <Card className="overflow-hidden rounded-none h-[calc(100vh-80px)] flex flex-col">
              <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold">DANH SÁCH TRẠM</div>
              <div className="p-4 border-b space-y-3">
                <div className="text-sm text-muted-foreground">Thành phố</div>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {cities.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground">Quận/Huyện</div>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {districts.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Từ khóa</div>
                  <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tên quận, đường, trạm xe..." />
                </div>
                <div className="text-xs text-muted-foreground">Tìm thấy <span className="font-semibold">{filteredPoints.length}</span> trạm</div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-3 border-b font-medium">{city || "Khu vực"}</div>
                <ul className="divide-y">
                  {filteredPoints.map((p) => (
                    <li key={p.id} className="px-4 py-3 hover:bg-accent/20 cursor-pointer" onClick={() => setSelectedPointId(p.id)}>
                      <div className="font-medium line-clamp-1">{p.name}</div>
                      <div className="mt-1 text-sm text-muted-foreground line-clamp-1">{p.address}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{p.district}, {p.city}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </aside>

          {/* Khu vực bản đồ */}
          <section className="flex-1">
            <div className="p-4">
              <MapComponent
                points={filteredPoints}
                selectedPointId={selectedPointId}
                onPointPositionChange={handlePointPositionChange}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default StationsPage;


