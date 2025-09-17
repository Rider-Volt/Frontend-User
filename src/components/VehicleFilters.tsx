import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, MapPin, Zap, DollarSign } from "lucide-react";

interface VehicleFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
}

interface FilterState {
  search: string;
  type: string;
  priceRange: string;
  batteryLevel: string;
  location: string;
  sortBy: string;
}

export const VehicleFilters = ({ onFiltersChange }: VehicleFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "",
    priceRange: "",
    batteryLevel: "",
    location: "",
    sortBy: "price-asc"
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      type: "",
      priceRange: "",
      batteryLevel: "",
      location: "",
      sortBy: "price-asc"
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== "" && value !== "price-asc").length;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Tìm kiếm xe điện..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Bộ lọc
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-2 block">Loại xe</label>
                <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả loại xe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả loại xe</SelectItem>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="hatchback">Hatchback</SelectItem>
                    <SelectItem value="crossover">Crossover</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Khoảng giá</label>
                <Select value={filters.priceRange} onValueChange={(value) => handleFilterChange("priceRange", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả mức giá" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả mức giá</SelectItem>
                    <SelectItem value="0-100000">Dưới 100k/h</SelectItem>
                    <SelectItem value="100000-150000">100k - 150k/h</SelectItem>
                    <SelectItem value="150000-200000">150k - 200k/h</SelectItem>
                    <SelectItem value="200000+">Trên 200k/h</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Mức pin</label>
                <Select value={filters.batteryLevel} onValueChange={(value) => handleFilterChange("batteryLevel", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả mức pin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả mức pin</SelectItem>
                    <SelectItem value="80-100">80% - 100%</SelectItem>
                    <SelectItem value="60-80">60% - 80%</SelectItem>
                    <SelectItem value="40-60">40% - 60%</SelectItem>
                    <SelectItem value="0-40">Dưới 40%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Địa điểm</label>
                <Select value={filters.location} onValueChange={(value) => handleFilterChange("location", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả địa điểm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả địa điểm</SelectItem>
                    <SelectItem value="Quận 1, TP.HCM">Quận 1, TP.HCM</SelectItem>
                    <SelectItem value="Quận 2, TP.HCM">Quận 2, TP.HCM</SelectItem>
                    <SelectItem value="Quận 3, TP.HCM">Quận 3, TP.HCM</SelectItem>
                    <SelectItem value="Quận 4, TP.HCM">Quận 4, TP.HCM</SelectItem>
                    <SelectItem value="Quận 5, TP.HCM">Quận 5, TP.HCM</SelectItem>
                    <SelectItem value="Quận 6, TP.HCM">Quận 6, TP.HCM</SelectItem>
                    <SelectItem value="Quận 7, TP.HCM">Quận 7, TP.HCM</SelectItem>
                    <SelectItem value="Quận 8, TP.HCM">Quận 8, TP.HCM</SelectItem>
                    <SelectItem value="Quận 9, TP.HCM">Quận 9, TP.HCM</SelectItem>
                    <SelectItem value="Quận 10, TP.HCM">Quận 10, TP.HCM</SelectItem>
                    <SelectItem value="Quận 11, TP.HCM">Quận 11, TP.HCM</SelectItem>
                    <SelectItem value="Quận 12, TP.HCM">Quận 12, TP.HCM</SelectItem>
                    <SelectItem value="Quận Bình Thạnh, TP.HCM">Quận Bình Thạnh, TP.HCM</SelectItem>
                    <SelectItem value="Quận Gò Vấp, TP.HCM">Quận Gò Vấp, TP.HCM</SelectItem>
                    <SelectItem value="Quận Phú Nhuận, TP.HCM">Quận Phú Nhuận, TP.HCM</SelectItem>
                    <SelectItem value="Quận Tân Bình, TP.HCM">Quận Tân Bình, TP.HCM</SelectItem>
                    <SelectItem value="Quận Tân Phú, TP.HCM">Quận Tân Phú, TP.HCM</SelectItem>
                    <SelectItem value="Quận Thủ Đức, TP.HCM">Quận Thủ Đức, TP.HCM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Sort and Clear */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Sắp xếp theo:</label>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-asc">Giá thấp → cao</SelectItem>
                    <SelectItem value="price-desc">Giá cao → thấp</SelectItem>
                    <SelectItem value="battery-desc">Pin cao → thấp</SelectItem>
                    <SelectItem value="range-desc">Tầm xa → gần</SelectItem>
                    <SelectItem value="name-asc">Tên A → Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="w-4 h-4 mr-1" />
                Xóa bộ lọc
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Search className="w-3 h-3" />
                  "{filters.search}"
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleFilterChange("search", "")}
                  />
                </Badge>
              )}
              {filters.type && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {filters.type}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleFilterChange("type", "")}
                  />
                </Badge>
              )}
              {filters.priceRange && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {filters.priceRange}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleFilterChange("priceRange", "")}
                  />
                </Badge>
              )}
              {filters.batteryLevel && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Pin {filters.batteryLevel}%
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleFilterChange("batteryLevel", "")}
                  />
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {filters.location}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleFilterChange("location", "")}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
