import { useState, useMemo } from "react";
import { EVCard } from "./EVCard";
import { VehicleFilters } from "./VehicleFilters";
import { useToast } from "@/hooks/use-toast";

const mockVehicles = [
  {
    id: 1,
    name: "VinFast VF 8",
    type: "SUV Điện Cao Cấp",
    batteryLevel: 95,
    range: 420,
    pricePerHour: 150000,
    location: "Quận 1, TP.HCM",
    image: "https://vinfast.vn/wp-content/uploads/2023/03/VF8-1.jpg",
    available: true
  },
  {
    id: 2,
    name: "VinFast VF 9",
    type: "SUV Điện 7 Chỗ",
    batteryLevel: 87,
    range: 500,
    pricePerHour: 200000,
    location: "Quận 3, TP.HCM",
    image: "https://vinfast.vn/wp-content/uploads/2023/03/VF9-1.jpg",
    available: true
  },
  {
    id: 3,
    name: "VinFast VF 6",
    type: "Crossover Điện Compact",
    batteryLevel: 78,
    range: 380,
    pricePerHour: 120000,
    location: "Quận 7, TP.HCM",
    image: "https://vinfast.vn/wp-content/uploads/2023/03/VF6-1.jpg",
    available: false
  },
  {
    id: 4,
    name: "VinFast VF 5",
    type: "Hatchback Điện Thông Minh",
    batteryLevel: 92,
    range: 350,
    pricePerHour: 100000,
    location: "Quận 2, TP.HCM",
    image: "https://vinfast.vn/wp-content/uploads/2023/03/VF5-1.jpg",
    available: true
  },
  {
    id: 5,
    name: "VinFast VF 7",
    type: "SUV Điện Sang Trọng",
    batteryLevel: 65,
    range: 460,
    pricePerHour: 250000,
    location: "Quận Bình Thạnh, TP.HCM",
    image: "https://vinfast.vn/wp-content/uploads/2023/03/VF7-1.jpg",
    available: true
  },
  {
    id: 6,
    name: "VinFast VF 3",
    type: "Hatchback Điện Tiết Kiệm",
    batteryLevel: 88,
    range: 300,
    pricePerHour: 80000,
    location: "Quận 10, TP.HCM",
    image: "https://vinfast.vn/wp-content/uploads/2023/03/VF3-1.jpg",
    available: true
  },
  {
    id: 7,
    name: "VinFast VF e34",
    type: "Sedan Điện Premium",
    batteryLevel: 85,
    range: 400,
    pricePerHour: 180000,
    location: "Quận 4, TP.HCM",
    image: "https://vinfast.vn/wp-content/uploads/2023/03/VFe34-1.jpg",
    available: true
  },
  {
    id: 8,
    name: "VinFast VF 8 Plus",
    type: "SUV Điện Cao Cấp Plus",
    batteryLevel: 90,
    range: 450,
    pricePerHour: 220000,
    location: "Quận 5, TP.HCM",
    image: "https://vinfast.vn/wp-content/uploads/2023/03/VF8-Plus-1.jpg",
    available: true
  },
  {
    id: 9,
    name: "VinFast VF 8",
    type: "SUV Điện Cao Cấp",
    batteryLevel: 82,
    range: 420,
    pricePerHour: 150000,
    location: "Quận 6, TP.HCM",
    image: "https://vinfast.vn/wp-content/uploads/2023/03/VF8-1.jpg",
    available: true
  },
  {
    id: 10,
    name: "VinFast VF 5",
    type: "Hatchback Điện Thông Minh",
    batteryLevel: 76,
    range: 350,
    pricePerHour: 100000,
    location: "Quận 8, TP.HCM",
    image: "https://vinfast.vn/wp-content/uploads/2023/03/VF5-1.jpg",
    available: true
  },
  {
    id: 11,
    name: "VinFast VF e34",
    type: "Sedan Điện Premium",
    batteryLevel: 91,
    range: 400,
    pricePerHour: 180000,
    location: "Quận 9, TP.HCM",
    image: "https://vinfast.vn/wp-content/uploads/2023/03/VFe34-1.jpg",
    available: true
  },
  {
    id: 12,
    name: "VinFast VF 3",
    type: "Hatchback Điện Tiết Kiệm",
    batteryLevel: 94,
    range: 300,
    pricePerHour: 80000,
    location: "Quận 11, TP.HCM",
    image: "https://vinfast.vn/wp-content/uploads/2023/03/VF3-1.jpg",
    available: true
  },
  {
    id: 13,
    name: "VinFast VF 6",
    type: "Crossover Điện Compact",
    batteryLevel: 69,
    range: 380,
    pricePerHour: 120000,
    location: "Quận 12, TP.HCM",
    image: "https://vinfast.vn/wp-content/uploads/2023/03/VF6-1.jpg",
    available: true
  },
  {
    id: 14,
    name: "VinFast VF 7",
    type: "SUV Điện Sang Trọng",
    batteryLevel: 73,
    range: 460,
    pricePerHour: 250000,
    location: "Quận Gò Vấp, TP.HCM",
    image: "https://vinfast.vn/wp-content/uploads/2023/03/VF7-1.jpg",
    available: true
  },
  {
    id: 15,
    name: "VinFast VF 9",
    type: "SUV Điện 7 Chỗ",
    batteryLevel: 86,
    range: 500,
    pricePerHour: 200000,
    location: "Quận Tân Bình, TP.HCM",
    image: "https://vinfast.vn/wp-content/uploads/2023/03/VF9-1.jpg",
    available: true
  },
  {
    id: 16,
    name: "VinFast VF 8 Plus",
    type: "SUV Điện Cao Cấp Plus",
    batteryLevel: 79,
    range: 450,
    pricePerHour: 220000,
    location: "Quận Tân Phú, TP.HCM",
    image: "https://vinfast.vn/wp-content/uploads/2023/03/VF8-Plus-1.jpg",
    available: true
  },
  {
    id: 17,
    name: "VinFast VF 5",
    type: "Hatchback Điện Thông Minh",
    batteryLevel: 88,
    range: 350,
    pricePerHour: 100000,
    location: "Quận Phú Nhuận, TP.HCM",
    image: "https://vinfast.vn/wp-content/uploads/2023/03/VF5-1.jpg",
    available: true
  },
  {
    id: 18,
    name: "VinFast VF 3",
    type: "Hatchback Điện Tiết Kiệm",
    batteryLevel: 95,
    range: 300,
    pricePerHour: 80000,
    location: "Quận Thủ Đức, TP.HCM",
    image: "https://vinfast.vn/wp-content/uploads/2023/03/VF3-1.jpg",
    available: true
  }
];

interface FilterState {
  search: string;
  type: string;
  priceRange: string;
  batteryLevel: string;
  location: string;
  sortBy: string;
}

export const VehicleGrid = () => {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "",
    priceRange: "",
    batteryLevel: "",
    location: "",
    sortBy: "price-asc"
  });

  const filteredAndSortedVehicles = useMemo(() => {
    let filtered = vehicles.filter(vehicle => {
      // Search filter
      if (filters.search && !vehicle.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Type filter
      if (filters.type && !vehicle.type.toLowerCase().includes(filters.type.toLowerCase())) {
        return false;
      }

      // Price range filter
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-').map(Number);
        if (max && (vehicle.pricePerHour < min || vehicle.pricePerHour > max)) {
          return false;
        }
        if (!max && vehicle.pricePerHour < min) {
          return false;
        }
      }

      // Battery level filter
      if (filters.batteryLevel) {
        const [min, max] = filters.batteryLevel.split('-').map(Number);
        if (max && (vehicle.batteryLevel < min || vehicle.batteryLevel > max)) {
          return false;
        }
        if (!max && vehicle.batteryLevel < min) {
          return false;
        }
      }

      // Location filter
      if (filters.location && !vehicle.location.includes(filters.location)) {
        return false;
      }

      return true;
    });

    // Sort vehicles
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "price-asc":
          return a.pricePerHour - b.pricePerHour;
        case "price-desc":
          return b.pricePerHour - a.pricePerHour;
        case "battery-desc":
          return b.batteryLevel - a.batteryLevel;
        case "range-desc":
          return b.range - a.range;
        case "name-asc":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [vehicles, filters]);

  const handleBookingSubmit = (bookingData: any) => {
    // Update vehicle availability
    setVehicles(prev => 
      prev.map(vehicle => 
        vehicle.id === bookingData.vehicleId 
          ? { ...vehicle, available: false }
          : vehicle
      )
    );

    // Show success toast
    toast({
      title: "Đặt xe thành công!",
      description: `Bạn đã đặt thành công ${bookingData.vehicleId} từ ${bookingData.startDate.toLocaleDateString('vi-VN')} đến ${bookingData.endDate.toLocaleDateString('vi-VN')}`,
    });

    // In a real app, you would send this data to your backend
    console.log("Booking data:", bookingData);
  };

  return (
    <section id="vehicles" className="py-16 bg-energy-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">
            Đội xe VinFast đa dạng
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trải nghiệm công nghệ xe điện tiên tiến từ VinFast với nhiều phân khúc giá khác nhau, 
            phù hợp mọi nhu cầu di chuyển của bạn.
          </p>
        </div>

        <VehicleFilters onFiltersChange={setFilters} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedVehicles.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">Không tìm thấy xe phù hợp với bộ lọc của bạn.</p>
              <p className="text-muted-foreground">Hãy thử điều chỉnh bộ lọc để xem thêm kết quả.</p>
            </div>
          ) : (
            filteredAndSortedVehicles.map((vehicle) => (
              <EVCard 
                key={vehicle.id} 
                {...vehicle} 
                onBookingSubmit={handleBookingSubmit}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};