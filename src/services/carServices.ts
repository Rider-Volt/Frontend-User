// src/services/carService.ts
import type { VehicleData } from "@/data/vehicles";

// Normalize any incoming vehicle type labels to E-* categories used in UI
function normalizeType(input?: string): "E-Scooter" | "E-Bike" | "E-Car" | "Khác" {
  const s = (input || "").trim().toLowerCase();
  if (!s) return "Khác";
  // Vietnamese to E-* mapping
  if (/(xe\s*máy\s*điện|xe may dien|scooter)/i.test(s)) return "E-Scooter";
  if (/(xe\s*đạp\s*điện|xe dap dien|e-bike|ebike|bike)/i.test(s)) return "E-Bike";
  if (/(ô\s*tô\s*điện|o to dien|oto dien|car|vf|vinfast|ô tô điện)/i.test(s)) return "E-Car";
  // Generic fallbacks
  if (/scooter/i.test(s)) return "E-Scooter";
  if (/bike/i.test(s)) return "E-Bike";
  if (/car|sedan|suv|hatchback/i.test(s)) return "E-Car";
  return "Khác";
}

export function searchCars(
  cars: VehicleData[],
  location: string,
  vehicleType: string
): VehicleData[] {
  return cars.filter((car) => {
    const matchLocation = location
      ? (car.location || "").toLowerCase().includes(location.toLowerCase())
      : true;
    const matchType = vehicleType
      ? normalizeType(car.type) === normalizeType(vehicleType)
      : true;
    return matchLocation && matchType;
  });
}

export function groupCarsByType(cars: VehicleData[]): Record<string, VehicleData[]> {
  return cars.reduce((groups, car) => {
    const normalized = normalizeType(car.type);
    const key = normalized === "Khác" ? (car.type || "Khác") : normalized;
    if (!groups[key]) groups[key] = [];
    groups[key].push(car);
    return groups;
  }, {} as Record<string, VehicleData[]>);
}
