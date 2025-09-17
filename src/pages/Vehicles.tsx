import { Header } from "@/components/Header";
import { VehicleGrid } from "@/components/VehicleGrid";

const Vehicles = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <VehicleGrid />
      </div>
    </div>
  );
};

export default Vehicles;
