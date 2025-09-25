// src/services/carService.ts
export interface Car {
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

export function searchCars(
  cars: Car[],
  location: string,
  vehicleType: string
): Car[] {
  return cars.filter((car) => {
    const matchLocation = location
      ? car.location.toLowerCase().includes(location.toLowerCase())
      : true;
    const matchType = vehicleType
      ? car.type.toLowerCase() === vehicleType.toLowerCase()
      : true;
    return matchLocation && matchType;
  });
}

export function groupCarsByType(cars: Car[]): Record<string, Car[]> {
  return cars.reduce((groups, car) => {
    const type = car.type || "Khác";
    if (!groups[type]) groups[type] = [];
    groups[type].push(car);
    return groups;
  }, {} as Record<string, Car[]>);
}
