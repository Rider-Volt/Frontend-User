export interface VehicleData {
  id: number;
  name: string;
  model?: string;
  type?: string;
  batteryLevel?: number;
  range?: number;
  pricePerHour?: number;
  pricePerDay?: number;
  location?: string;
  image?: string;
  imageUrl?: string;
  available?: boolean;
  status?: string;
  stationId?: number | null;
  description?: string;
  fullAddress?: string;
  features?: {
    seats?: number | string;
    transmission?: string;
    fuel?: string;
    consumption?: string;
  };
}


