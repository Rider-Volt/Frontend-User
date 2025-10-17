import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, CarFront, MapPin, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ================== Types ==================
export type VehicleType = "" | "E-Scooter" | "E-Bike" | "E-Car";

interface SearchBarProps {
  onSubmit: (params: {
    location: string;
    startDate: string;
    endDate: string;
    vehicleType: VehicleType;
  }) => void;
  defaultValues?: {
    location?: string;
    startDate?: string; // dd/MM/yyyy (vi-VN) or yyyy-MM-dd
    endDate?: string;   // dd/MM/yyyy (vi-VN) or yyyy-MM-dd
    vehicleType?: VehicleType;
  };
}

const DATE_FORMAT = "dd/MM/yyyy";

// ================== Helpers ==================
const formatDateForDisplay = (date: Date | undefined) =>
  date ? format(date, DATE_FORMAT) : undefined;

const formatDateForSubmit = (date: Date | undefined) =>
  date
    ? new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date)
    : "";

// ================== Component ==================
export default function SearchBar({ onSubmit, defaultValues }: SearchBarProps) {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [vehicleType, setVehicleType] = useState<VehicleType>("");

  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const endDateDisabled = useMemo(
    () => (date: Date) => (startDate ? date < startDate : false),
    [startDate],
  );

  // Parse date from dd/MM/yyyy or yyyy-MM-dd to Date
  const parseDateInput = (s?: string): Date | undefined => {
    if (!s) return undefined;
    // yyyy-MM-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, m, d] = s.split("-").map(Number);
      const dt = new Date(y, (m || 1) - 1, d || 1);
      return Number.isFinite(dt.getTime()) ? dt : undefined;
    }
    // dd/MM/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
      const [d, m, y] = s.split("/").map(Number);
      const dt = new Date(y || 0, (m || 1) - 1, d || 1);
      return Number.isFinite(dt.getTime()) ? dt : undefined;
    }
    const dt = new Date(s);
    return Number.isFinite(dt.getTime()) ? dt : undefined;
  };

  // Prefill from defaultValues when provided
  useMemo(() => {
    if (!defaultValues) return;
    if (defaultValues.location !== undefined) setLocation(defaultValues.location);
    if (defaultValues.vehicleType !== undefined) setVehicleType(defaultValues.vehicleType);
    const s = parseDateInput(defaultValues.startDate);
    const e = parseDateInput(defaultValues.endDate);
    if (s) setStartDate(s);
    if (e) setEndDate(e);
  }, [defaultValues?.location, defaultValues?.vehicleType, defaultValues?.startDate, defaultValues?.endDate]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (startDate && endDate && endDate < startDate) {
      alert("Ngày trả xe không được nhỏ hơn ngày nhận xe!");
      return;
    }

    onSubmit({
      location,
      startDate: formatDateForSubmit(startDate),
      endDate: formatDateForSubmit(endDate),
      vehicleType,
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/30">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end"
        >
          {/* Địa điểm */}
          <div className="space-y-2">
            <label
              htmlFor="search-location"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <MapPin className="h-4 w-4 text-primary" />
              Địa điểm
            </label>
            <Input
              id="search-location"
              placeholder="Ví dụ: Quận 1, Quận 2"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>

          {/* Ngày nhận xe */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              Ngày nhận xe
            </span>
            <Popover open={startOpen} onOpenChange={setStartOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground",
                  )}
                >
                  {startDate ? (
                    formatDateForDisplay(startDate)
                  ) : (
                    <span>Chọn ngày</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(value) => {
                    setStartDate(value || undefined);
                    if (value && endDate && endDate < value) {
                      setEndDate(value);
                    }
                    setStartOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Ngày trả xe */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              Ngày trả xe
            </span>
            <Popover open={endOpen} onOpenChange={setEndOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground",
                  )}
                >
                  {endDate ? (
                    formatDateForDisplay(endDate)
                  ) : (
                    <span>Chọn ngày</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(value) => {
                    if (value && startDate && value < startDate) {
                      return;
                    }
                    setEndDate(value || undefined);
                    if (value) {
                      setEndOpen(false);
                    }
                  }}
                  disabled={endDateDisabled}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Loại xe */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CarFront className="h-4 w-4 text-primary" />
              Loại xe
            </span>
            <Select
              value={vehicleType || "all"}
              onValueChange={(value) =>
                setVehicleType(value === "all" ? "" : (value as VehicleType))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn loại xe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="E-Scooter">E-Scooter</SelectItem>
                <SelectItem value="E-Bike">E-Bike</SelectItem>
                <SelectItem value="E-Car">E-Car</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nút tìm */}
          <div className="flex items-end">
            <Button
              type="submit"
              className="w-full h-12 font-medium gap-2 bg-primary hover:bg-accent text-primary-foreground"
            >
              <Search className="w-5 h-5" />
              Tìm
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
