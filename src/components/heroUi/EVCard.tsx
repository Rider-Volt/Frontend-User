import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, MapPin, Users, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { VehicleData } from "@/types/vehicle";
import { getHardcodedSpecs } from "@/data/vehicleSpecs";

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

  // Lấy thông tin đặc điểm từ features hoặc từ hardcoded specs
  const hardcodedSpecs = getHardcodedSpecs(model || name);
  const specs = features || hardcodedSpecs || {};
  const seats = specs.seats;
  const fuel = specs.fuel || "Điện";
  const transmission = specs.transmission || "1 cấp (EV)";
  const consumption = specs.consumption;

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
        <CardTitle className="text-lg font-semibold mb-1">{name}</CardTitle>
        {type && (
          <p className="text-emerald-500/80 text-xs uppercase font-medium mb-2">{type}</p>
        )}
        <div className="text-emerald-600 font-bold text-xl">
          {pricePerDay > 0 ? `${pricePerDay.toLocaleString()}đ/ngày` : "Liên hệ"}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Đặc điểm */}
        {(seats || consumption) && (
          <div className="flex flex-wrap gap-2">
            {seats && (
              <div className="flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/60">
                <Users className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-gray-900">
                  {typeof seats === 'number' ? `${seats} chỗ` : seats}
                </span>
              </div>
            )}

            {consumption && (
              <div className="flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/60">
                <Leaf className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-gray-900">{consumption}</span>
              </div>
            )}
          </div>
        )}

        {available ? (
          <Button 
            variant="default" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
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
