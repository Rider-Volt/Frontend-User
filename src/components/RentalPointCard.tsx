// src/components/RentalPointCard.tsx
import { Car, MapPin, Phone, Clock, Zap, Star, Navigation, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  amenities: string[];
  status: "active" | "maintenance" | "closed";
}

interface RentalPointCardProps {
  point: RentalPoint;
}

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

const RentalPointCard: React.FC<RentalPointCardProps> = ({ point }) => {
  return (
    <Card key={point.id} className="group hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-2">{point.name}</CardTitle>
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
              <Navigation className="w-4 h-4 mr-1" /> Chỉ đường
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tình trạng xe */}
        <div className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">Tình trạng xe</span>
            <span className="text-sm text-muted-foreground">{point.availableVehicles}/{point.totalVehicles} xe có sẵn</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(point.availableVehicles / point.totalVehicles) * 100}%` }}
            />
          </div>
        </div>

        {/* Dịch vụ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /><span className="text-sm">Giờ hoạt động</span></div>
            <span className="text-sm font-medium">{point.operatingHours}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span className="text-sm">Hotline</span></div>
            <span className="text-sm font-medium">{point.phone}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-muted-foreground" /><span className="text-sm">Trạm sạc</span></div>
            <span className="text-sm font-medium">{point.chargingStations} trạm</span>
          </div>
        </div>

        {/* Tiện ích */}
        <div>
          <span className="text-sm font-medium text-muted-foreground mb-2 block">Tiện ích</span>
          <div className="flex flex-wrap gap-2">
            {point.amenities.map((amenity, index) => (
              <Badge key={index} variant="secondary" className="text-xs">{amenity}</Badge>
            ))}
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" disabled={point.status !== "active" || point.availableVehicles === 0}>
            <Car className="w-4 h-4 mr-2" /> Xem xe có sẵn
          </Button>
          <Button variant="default" className="flex-1 bg-primary hover:bg-accent" disabled={point.status !== "active"}>
            Đặt xe ngay <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RentalPointCard;
