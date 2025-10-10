import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Battery, Zap, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export interface EVCardProps {
  id: number;
  name: string;
  type: string;
  batteryLevel: number;
  range: number;
  pricePerDay: number;
  location: string;
  image: string;
  available: boolean;
}

const EVCard = ({
  id,
  name,
  type,
  batteryLevel,
  range,
  pricePerDay,
  location,
  image,
  available,
}: EVCardProps) => {
  const navigate = useNavigate();

  const handleBookClick = () => {
    navigate(`/vehicle/${id}`);
  };

  return (
    <Card className="group hover:shadow-lg transition-all overflow-hidden">
      {/* Hình ảnh */}
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
        />
        <div className="absolute top-4 right-4">
          {available ? (
            <Badge className="bg-green-500 text-white font-semibold px-3 py-1 rounded-full shadow">
              Có sẵn
            </Badge>
          ) : (
            <Badge className="bg-white text-gray-400 font-semibold px-3 py-1 rounded-full shadow border border-gray-200">
              Đã thuê
            </Badge>
          )}
        </div>
      </div>

      {/* Nội dung */}
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold mb-2">{name}</CardTitle>
        <p className="text-muted-foreground text-sm mb-3">{type}</p>
        <div className="text-primary font-bold text-xl">
          {pricePerDay.toLocaleString()}đ/ngày
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Battery className="w-4 h-4 text-primary" />
            <span className="text-sm">{batteryLevel}% pin</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent-foreground" />
            <span className="text-sm">{range}km</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{location}</span>
        </div>

        {available ? (
          <Button 
            variant="default" 
            className="w-full bg-primary hover:bg-accent"
            onClick={handleBookClick}
          >
            Đặt xe ngay
          </Button>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            Không có sẵn
          </Button>
        )}
      </CardContent>
    </Card>
  );
};


export default EVCard;
