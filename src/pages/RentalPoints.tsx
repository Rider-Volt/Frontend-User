import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Car,
  User,
  Menu,
  MapPin,
  Phone,
  Clock,
  Battery,
  Zap,
  Star,
  Navigation,
  Search,
  Filter,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RentalPoint {
  id: number;
  name: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  operatingHours: string;
  availableVehicles: number;
  totalVehicles: number;
  chargingStations: number;
  rating: number;
  distance: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  amenities: string[];
  status: "active" | "maintenance" | "closed";
}

const RentalPoints: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("distance");

  const rentalPoints: RentalPoint[] = [
    {
      id: 1,
      name: "Trạm thuê xe VinFast Quận 1",
      address: "123 Nguyễn Huệ, Quận 1",
      district: "Quận 1",
      city: "TP.HCM",
      phone: "1900 232 389",
      operatingHours: "24/7",
      availableVehicles: 8,
      totalVehicles: 12,
      chargingStations: 6,
      rating: 4.8,
      distance: 1.2,
      coordinates: { lat: 10.7769, lng: 106.7009 },
      amenities: ["Sạc nhanh", "Bảo hiểm", "Hỗ trợ 24/7", "Giữ xe"],
      status: "active"
    },
    {
      id: 2,
      name: "Trạm thuê xe VinFast Quận 2",
      address: "456 Thủ Thiêm, Quận 2",
      district: "Quận 2",
      city: "TP.HCM",
      phone: "1900 232 390",
      operatingHours: "6:00 - 22:00",
      availableVehicles: 5,
      totalVehicles: 8,
      chargingStations: 4,
      rating: 4.6,
      distance: 2.5,
      coordinates: { lat: 10.7870, lng: 106.7498 },
      amenities: ["Sạc nhanh", "Bảo hiểm", "Giữ xe"],
      status: "active"
    },
    {
      id: 3,
      name: "Trạm thuê xe VinFast Quận 7",
      address: "789 Nguyễn Thị Thập, Quận 7",
      district: "Quận 7",
      city: "TP.HCM",
      phone: "1900 232 391",
      operatingHours: "24/7",
      availableVehicles: 0,
      totalVehicles: 10,
      chargingStations: 5,
      rating: 4.7,
      distance: 3.8,
      coordinates: { lat: 10.7374, lng: 106.7226 },
      amenities: ["Sạc nhanh", "Bảo hiểm", "Hỗ trợ 24/7", "Giữ xe", "Rửa xe"],
      status: "maintenance"
    },
    {
      id: 4,
      name: "Trạm thuê xe VinFast Quận 3",
      address: "321 Võ Văn Tần, Quận 3",
      district: "Quận 3",
      city: "TP.HCM",
      phone: "1900 232 392",
      operatingHours: "6:00 - 23:00",
      availableVehicles: 6,
      totalVehicles: 8,
      chargingStations: 3,
      rating: 4.5,
      distance: 1.8,
      coordinates: { lat: 10.7829, lng: 106.6901 },
      amenities: ["Sạc nhanh", "Bảo hiểm", "Giữ xe"],
      status: "active"
    },
    {
      id: 5,
      name: "Trạm thuê xe VinFast Quận 10",
      address: "654 Lý Thái Tổ, Quận 10",
      district: "Quận 10",
      city: "TP.HCM",
      phone: "1900 232 393",
      operatingHours: "24/7",
      availableVehicles: 3,
      totalVehicles: 6,
      chargingStations: 4,
      rating: 4.9,
      distance: 2.1,
      coordinates: { lat: 10.7679, lng: 106.6668 },
      amenities: ["Sạc nhanh", "Bảo hiểm", "Hỗ trợ 24/7", "Giữ xe", "Rửa xe", "Cafe"],
      status: "active"
    },
    {
      id: 6,
      name: "Trạm thuê xe VinFast Quận Bình Thạnh",
      address: "987 Xô Viết Nghệ Tĩnh, Quận Bình Thạnh",
      district: "Quận Bình Thạnh",
      city: "TP.HCM",
      phone: "1900 232 394",
      operatingHours: "6:00 - 22:00",
      availableVehicles: 4,
      totalVehicles: 7,
      chargingStations: 3,
      rating: 4.4,
      distance: 4.2,
      coordinates: { lat: 10.8106, lng: 106.7091 },
      amenities: ["Sạc nhanh", "Bảo hiểm", "Giữ xe"],
      status: "active"
    }
  ];

  const districts = ["Tất cả", "Quận 1", "Quận 2", "Quận 3", "Quận 7", "Quận 10", "Quận Bình Thạnh"];
  const statusOptions = ["Tất cả", "Hoạt động", "Bảo trì", "Đóng cửa"];

  const filteredPoints = rentalPoints.filter(point => {
    const matchesSearch = point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         point.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = !selectedDistrict || selectedDistrict === "Tất cả" || point.district === selectedDistrict;
    const matchesStatus = !selectedStatus || selectedStatus === "Tất cả" || 
                         (selectedStatus === "Hoạt động" && point.status === "active") ||
                         (selectedStatus === "Bảo trì" && point.status === "maintenance") ||
                         (selectedStatus === "Đóng cửa" && point.status === "closed");
    
    return matchesSearch && matchesDistrict && matchesStatus;
  });

  const sortedPoints = [...filteredPoints].sort((a, b) => {
    switch (sortBy) {
      case "distance":
        return a.distance - b.distance;
      case "rating":
        return b.rating - a.rating;
      case "available":
        return b.availableVehicles - a.availableVehicles;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Hoạt động</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><AlertCircle className="w-3 h-3 mr-1" />Bảo trì</Badge>;
      case "closed":
        return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertCircle className="w-3 h-3 mr-1" />Đóng cửa</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 to-accent/20">
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
            <Link to="/rental-points" className="text-foreground hover:text-primary font-medium">
              Điểm thuê
            </Link>
            <Link to="/cars" className="text-foreground hover:text-primary font-medium">
            lịch sử đặt xe
            </Link>
          </nav>

          <div className="flex items-center gap-3">
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
            <button className="md:hidden p-2 rounded-lg border">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Điểm thuê xe điện
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tìm kiếm trạm thuê xe gần nhất với đầy đủ tiện ích và dịch vụ hỗ trợ
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Tên trạm, địa chỉ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Quận/Huyện
                </label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn quận/huyện" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Trạng thái
                </label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Sắp xếp
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Khoảng cách</SelectItem>
                    <SelectItem value="rating">Đánh giá</SelectItem>
                    <SelectItem value="available">Số xe có sẵn</SelectItem>
                    <SelectItem value="name">Tên A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Tìm thấy <span className="font-semibold text-foreground">{sortedPoints.length}</span> điểm thuê
          </p>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Bộ lọc</span>
          </div>
        </div>

        {/* Rental Points Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedPoints.map((point) => (
            <Card key={point.id} className="group hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold mb-2">
                      {point.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{point.address}, {point.district}, {point.city}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Navigation className="w-4 h-4" />
                        <span>{point.distance}km</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{point.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(point.status)}
                    <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                      <Navigation className="w-4 h-4 mr-1" />
                      Chỉ đường
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Vehicle Availability */}
                <div className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Tình trạng xe</span>
                    <span className="text-sm text-muted-foreground">
                      {point.availableVehicles}/{point.totalVehicles} xe có sẵn
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(point.availableVehicles / point.totalVehicles) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Services */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Giờ hoạt động</span>
                    </div>
                    <span className="text-sm font-medium">{point.operatingHours}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Hotline</span>
                    </div>
                    <span className="text-sm font-medium">{point.phone}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Trạm sạc</span>
                    </div>
                    <span className="text-sm font-medium">{point.chargingStations} trạm</span>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <span className="text-sm font-medium text-muted-foreground mb-2 block">Tiện ích</span>
                  <div className="flex flex-wrap gap-2">
                    {point.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    disabled={point.status !== "active" || point.availableVehicles === 0}
                  >
                    <Car className="w-4 h-4 mr-2" />
                    Xem xe có sẵn
                  </Button>
                  <Button 
                    variant="default" 
                    className="flex-1 bg-primary hover:bg-accent"
                    disabled={point.status !== "active"}
                  >
                    Đặt xe ngay
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {sortedPoints.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Không tìm thấy điểm thuê</h3>
              <p className="text-muted-foreground mb-4">
                Hãy thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDistrict("");
                  setSelectedStatus("");
                }}
                variant="outline"
              >
                Xóa bộ lọc
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default RentalPoints;