import { useState } from "react";
import { Car, Calendar, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const CarSearchPage = () => {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const cars = [
    {
      name: "VinFast VF e34",
      price: "600.000₫/ngày",
      type: "SUV",
      image:
        "https://vinfastauto.com/sites/default/files/2022-12/VFe34_1.jpg",
    },
    {
      name: "VinFast VF 6",
      price: "1.200.000₫/ngày",
      type: "Sedan",
      image:
        "https://tesla-cdn.thron.com/delivery/public/image/tesla/2e45df6b-33b8-4574-93af-4286371bb896/bvlatuR/std/1920x1080/global-specs-hero",
    },
    {
      name: "VinFast VF 9",
      price: "900.000₫/ngày",
      type: "Hatchback",
      image: "https://cdn.motor1.com/images/mgl/9xq6z/s3/hyundai-ioniq-5.jpg",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-xl">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">EV Rental</span>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <section className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">
          Tìm kiếm xe điện phù hợp
        </h1>
        <div className="bg-white shadow rounded-xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center border rounded-lg px-3">
            <MapPin className="w-5 h-5 text-primary mr-2" />
            <Input
              placeholder="Nhập địa điểm..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border-0 focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center border rounded-lg px-3">
            <Calendar className="w-5 h-5 text-primary mr-2" />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border-0 focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center border rounded-lg px-3">
            <Calendar className="w-5 h-5 text-primary mr-2" />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border-0 focus-visible:ring-0"
            />
          </div>
          <Button className="bg-primary hover:bg-primary/80 text-white flex items-center justify-center">
            <Search className="w-5 h-5 mr-2" /> Tìm xe
          </Button>
        </div>
      </section>

      {/* Car List */}
      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold mb-6">Danh sách xe có sẵn</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cars.map((car, index) => (
            <Card
              key={index}
              className="overflow-hidden group hover:shadow-lg transition-all"
            >
              <div className="relative h-40">
                <img
                  src={car.image}
                  alt={car.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform rounded-t-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-2 text-white font-semibold">
                  {car.name}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold text-primary">
                    {car.price}
                  </span>
                  <span className="text-gray-500 text-sm">{car.type}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-primary border-secondary"
                >
                  Thuê ngay
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-6 text-center mt-auto">
        © 2025 EV Rental. All rights reserved.
      </footer>
    </div>
  );
};

export default CarSearchPage;
