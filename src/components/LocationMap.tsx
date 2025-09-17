import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Car, Clock, Phone, Search } from "lucide-react";

interface Location {
  id: string;
  name: string;
  address: string;
  district: string;
  phone: string;
  hours: string;
  availableVehicles: number;
  totalVehicles: number;
}

const locations: Location[] = [
  {
    id: "Q1",
    name: "Trung tâm Quận 1",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    district: "Quận 1, TP.HCM",
    phone: "028 1234 5678",
    hours: "24/7",
    availableVehicles: 8,
    totalVehicles: 10
  },
  {
    id: "Q3",
    name: "Trung tâm Quận 3",
    address: "456 Võ Văn Tần, Quận 3, TP.HCM",
    district: "Quận 3, TP.HCM",
    phone: "028 2345 6789",
    hours: "6:00 - 22:00",
    availableVehicles: 6,
    totalVehicles: 8
  },
  {
    id: "Q7",
    name: "Trung tâm Quận 7",
    address: "789 Nguyễn Thị Thập, Quận 7, TP.HCM",
    district: "Quận 7, TP.HCM",
    phone: "028 3456 7890",
    hours: "6:00 - 22:00",
    availableVehicles: 5,
    totalVehicles: 7
  },
  {
    id: "Q2",
    name: "Trung tâm Quận 2",
    address: "321 Thủ Thiêm, Quận 2, TP.HCM",
    district: "Quận 2, TP.HCM",
    phone: "028 4567 8901",
    hours: "6:00 - 22:00",
    availableVehicles: 4,
    totalVehicles: 6
  },
  {
    id: "BT",
    name: "Trung tâm Bình Thạnh",
    address: "654 Xô Viết Nghệ Tĩnh, Quận Bình Thạnh, TP.HCM",
    district: "Quận Bình Thạnh, TP.HCM",
    phone: "028 5678 9012",
    hours: "6:00 - 22:00",
    availableVehicles: 3,
    totalVehicles: 5
  },
  {
    id: "Q10",
    name: "Trung tâm Quận 10",
    address: "987 Lý Thái Tổ, Quận 10, TP.HCM",
    district: "Quận 10, TP.HCM",
    phone: "028 6789 0123",
    hours: "6:00 - 22:00",
    availableVehicles: 7,
    totalVehicles: 9
  }
];

export const LocationMap = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const filteredLocations = useMemo(() => {
    return locations.filter(location => {
      if (searchTerm && !location.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !location.address.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      if (selectedDistrict && !location.district.includes(selectedDistrict)) {
        return false;
      }

      return true;
    });
  }, [searchTerm, selectedDistrict]);

  const districts = Array.from(new Set(locations.map(loc => loc.district))).sort();

  return (
    <section id="locations" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Mạng lưới điểm thuê xe
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Hệ thống điểm thuê xe VinFast rộng khắp 19 quận/huyện TP.HCM, 
            phục vụ 24/7 với đội ngũ hỗ trợ chuyên nghiệp.
          </p>
          
          {/* System Overview */}
          <div className="bg-electric-gradient/10 border border-electric rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6">Tổng quan hệ thống</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-3xl font-bold text-primary">19</p>
                <p className="text-muted-foreground">Điểm thuê xe</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">120+</p>
                <p className="text-muted-foreground">Xe VinFast</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">24/7</p>
                <p className="text-muted-foreground">Hỗ trợ khách hàng</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">100%</p>
                <p className="text-muted-foreground">Xe điện VinFast</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm điểm thuê xe..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Chọn quận/huyện" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tất cả quận/huyện</SelectItem>
                      {districts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Results Summary */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị {filteredLocations.length} trong {locations.length} điểm thuê xe
                  </p>
                  {(searchTerm || selectedDistrict) && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedDistrict("");
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      Xóa bộ lọc
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">Không tìm thấy điểm thuê xe phù hợp.</p>
              <p className="text-muted-foreground">Hãy thử điều chỉnh bộ lọc để xem thêm kết quả.</p>
            </div>
          ) : (
            filteredLocations.map((location) => (
              <Card key={location.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{location.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{location.district}</p>
                    </div>
                    <Badge 
                      variant={location.availableVehicles > 0 ? "default" : "secondary"}
                      className="ml-2"
                    >
                      {location.availableVehicles > 0 ? "Có sẵn" : "Hết xe"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Địa chỉ</p>
                      <p className="text-sm text-muted-foreground">{location.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Hotline</p>
                      <p className="text-sm text-muted-foreground">{location.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Giờ hoạt động</p>
                      <p className="text-sm text-muted-foreground">{location.hours}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Xe có sẵn</p>
                      <p className="text-sm text-muted-foreground">
                        {location.availableVehicles}/{location.totalVehicles} xe
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Tỷ lệ sẵn sàng</span>
                      <span className="text-sm font-bold text-primary">
                        {Math.round((location.availableVehicles / location.totalVehicles) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(location.availableVehicles / location.totalVehicles) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
};