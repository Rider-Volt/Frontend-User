// src/components/Stations.tsx
import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RentalPoint } from "@/services/stationServices";

interface RentalPointCardProps {
  point: RentalPoint;
  onFocus?: (id: number) => void;
}

const Stations: React.FC<RentalPointCardProps> = ({ point, onFocus }) => {
  return (
    <Card key={point.id} className="group hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold mb-2">{point.name}</CardTitle>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <MapPin className="w-4 h-4" />
          <span>{point.address}, {point.district}, {point.city}</span>
        </div>
      </CardHeader>
      <CardContent>
        <button
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
          onClick={() => onFocus?.(point.id)}
        >
          Xem vị trí trên bản đồ
        </button>
      </CardContent>
    </Card>
  );
};

export default Stations;


