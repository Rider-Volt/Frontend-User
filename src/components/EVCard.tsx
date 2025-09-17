import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Battery, MapPin, Clock, Zap } from "lucide-react";
import { BookingModal } from "./BookingModal";

interface EVCardProps {
  id: number;
  name: string;
  type: string;
  batteryLevel: number;
  range: number;
  pricePerHour: number;
  location: string;
  image: string;
  available: boolean;
  onBookingSubmit?: (bookingData: any) => void;
}

export const EVCard = ({
  id,
  name,
  type,
  batteryLevel,
  range,
  pricePerHour,
  location,
  image,
  available,
  onBookingSubmit
}: EVCardProps) => {
  return (
    <Card className="group hover:shadow-card transition-smooth overflow-hidden">
      <div className="relative">
        <img 
          src={image} 
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-smooth"
        />
        <div className="absolute top-4 right-4">
          <Badge variant={available ? "default" : "secondary"} className="bg-glass/90 backdrop-blur-sm">
            {available ? "Có sẵn" : "Đã thuê"}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">{name}</span>
          <span className="text-primary font-bold">{pricePerHour.toLocaleString()}đ/h</span>
        </CardTitle>
        <p className="text-muted-foreground text-sm">{type}</p>
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
          <BookingModal 
            vehicle={{
              id,
              name,
              type,
              pricePerHour,
              location,
              image,
              batteryLevel,
              range
            }}
            onBookingSubmit={onBookingSubmit || (() => {})}
          />
        ) : (
          <Button variant="outline" className="w-full" disabled>
            Không có sẵn
          </Button>
        )}
      </CardContent>
    </Card>
  );
};