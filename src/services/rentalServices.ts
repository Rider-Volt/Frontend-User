// src/services/rentalService.ts
export interface RentalPoint {
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
  coordinates: { lat: number; lng: number };
  amenities: string[];
  status: "active" | "maintenance" | "closed";
}

// Mock data (sau này thay bằng API fetch)
export const getRentalPoints = async (): Promise<RentalPoint[]> => {
  return [
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
};
