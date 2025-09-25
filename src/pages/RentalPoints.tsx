import React, { useEffect, useState } from "react";
import { Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "../components/heroUi/Navbar";
import { getCurrentUser } from "@/services/authService";
import { getRentalPoints, RentalPoint } from "@/services/rentalServices";
import RentalPointCard from "@/components/RentalPointCard";

const RentalPoints: React.FC = () => {
  const [points, setPoints] = useState<RentalPoint[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [district, setDistrict] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("distance");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setIsLoggedIn(true);
      setUsername(user.full_name || user.username);
    }
    getRentalPoints().then(setPoints);
  }, []);

  const filteredPoints = points.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDistrict = !district || district === "Tất cả" || p.district === district;
    const matchStatus =
      !status ||
      status === "Tất cả" ||
      (status === "Hoạt động" && p.status === "active") ||
      (status === "Bảo trì" && p.status === "maintenance") ||
      (status === "Đóng cửa" && p.status === "closed");
    return matchSearch && matchDistrict && matchStatus;
  });

  const sortedPoints = [...filteredPoints].sort((a, b) => {
    switch (sortBy) {
      case "distance": return a.distance - b.distance;
      case "rating": return b.rating - a.rating;
      case "available": return b.availableVehicles - a.availableVehicles;
      case "name": return a.name.localeCompare(b.name);
      default: return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 to-accent/20">
      <Navbar isLoggedIn={isLoggedIn} username={username} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Tìm thấy <span className="font-semibold">{sortedPoints.length}</span> điểm thuê
          </p>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Bộ lọc</span>
          </div>
        </div>

        {/* Lưới hiển thị */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedPoints.map((point) => <RentalPointCard key={point.id} point={point} />)}
        </div>
      </main>
    </div>
  );
};

export default RentalPoints;
