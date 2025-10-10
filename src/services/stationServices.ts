// src/services/stationServices.ts
export interface RentalPoint {
  id: number;
  name: string;
  address: string;
  district: string;
  city: string;
  lat: number;
  lng: number;
}

// Mock data (sau này thay bằng API fetch)
export const getRentalPoints = async (): Promise<RentalPoint[]> => {
  return [
    {
      id: 1,
      name: "Trạm thuê xe Quận 1",
      address: "123 Nguyễn Huệ, Quận 1",
      district: "Quận 1",
      city: "TP.HCM",
      lat: 10.77208,
      lng: 106.70356
    },
    {
      id: 2,
      name: "Trạm thuê xe Quận 2",
      address: "456 Thủ Thiêm, Quận 2",
      district: "Quận 2",
      city: "TP.HCM",
      lat: 10.7805,
      lng: 106.7376
    },
    {
      id: 3,
      name: "Trạm thuê xe Quận 7",
      address: "789 Nguyễn Thị Thập, Quận 7",
      district: "Quận 7",
      city: "TP.HCM",
      lat: 10.7377,
      lng: 106.7219
    },
    {
      id: 4,
      name: "Trạm thuê xe Quận 3",
      address: "321 Võ Văn Tần, Quận 3",
      district: "Quận 3",
      city: "TP.HCM",
      lat: 10.7798,
      lng: 106.6839
    },
    {
      id: 5,
      name: "Trạm thuê xe Quận 10",
      address: "654 Lý Thái Tổ, Quận 10",
      district: "Quận 10",
      city: "TP.HCM",
      lat: 10.7747,
      lng: 106.6669
    },
    {
      id: 6,
      name: "Trạm thuê xe Quận Bình Thạnh",
      address: "987 Xô Viết Nghệ Tĩnh, Quận Bình Thạnh",
      district: "Quận Bình Thạnh",
      city: "TP.HCM",
      lat: 10.8061,
      lng: 106.7079
    },
    {
      id: 7,
      name: "Trạm thuê xe Quận Bình Thạnh",
      address: "987 ,trường sa Quận Bình Thạnh",
      district: "Quận Bình Thạnh",
      city: "TP.HCM",
      lat: 10.47432,
      lng: 106.41167
    }
  ];
};