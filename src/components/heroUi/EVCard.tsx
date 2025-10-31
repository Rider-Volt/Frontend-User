import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Battery, Zap, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { VehicleData } from "@/types/vehicle";

const EVCard = (vehicle: VehicleData) => {
  const {
    id,
    name,
    model,
    type,
    batteryLevel = 0,
    range = 0,
    pricePerDay = 0,
    location = "Chưa xác định",
    image,
    available = false,
    description,
    fullAddress,
    features,
  } = vehicle;
  const imageSrc = (image ?? vehicle.imageUrl ?? "").trim();
  const navigate = useNavigate();

  const handleBookClick = () => {
    navigate(`/vehicle/${id}`, {
      state: {
        vehicle: {
          ...vehicle,
          model: model || name,
        },
      },
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-all overflow-hidden">
      {/* Hình ảnh */}
      <div className="relative">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={name}
            loading="lazy"
            decoding="async"
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center text-muted-foreground">
            Không có ảnh
          </div>
        )}
      </div>

      {/* Nội dung */}
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold mb-2">{name}</CardTitle>
        <p className="text-muted-foreground text-sm mb-3">{type}</p>
        <div className="text-primary font-bold text-xl">
          {pricePerDay > 0 ? `${pricePerDay.toLocaleString()}đ/ngày` : "Liên hệ"}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Battery className="w-4 h-4 text-primary" />
            <span className="text-sm">{batteryLevel}% pin</span>
          </div>
          {range > 0 && (
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent-foreground" />
              <span className="text-sm">{range}km</span>
            </div>
          )}
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
