import React from "react";
import { Input, Select, SelectItem, Button, DatePicker } from "@heroui/react";
import { Icon } from "@iconify/react";
import { DateValue } from "@internationalized/date";

// ================== Types ==================
export type VehicleType = "" | "xe máy điện" | "ô tô điện";

interface SearchBarProps {
  onSubmit: (params: {
    location: string;
    startDate: string;
    endDate: string;
    vehicleType: VehicleType;
  }) => void;
}

// ================== Helper ==================
function formatDate(date: DateValue | null): string {
  if (!date) return "";
  const jsDate = date.toDate("UTC");
  return new Intl.DateTimeFormat("vi-VN").format(jsDate);
}

// ================== Component ==================
export default function SearchBar({ onSubmit }: SearchBarProps) {
  const [location, setLocation] = React.useState("");
  const [startDate, setStartDate] = React.useState<DateValue | null>(null);
  const [endDate, setEndDate] = React.useState<DateValue | null>(null);
  const [vehicleType, setVehicleType] = React.useState<VehicleType>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (startDate && endDate && endDate.compare(startDate) < 0) {
      alert("Ngày trả xe không được nhỏ hơn ngày nhận xe!");
      return;
    }

    onSubmit({
      location,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
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
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Địa điểm
            </label>
            <Input
              placeholder="Ví dụ: Quận 1, Quận 2"
              value={location}
              onValueChange={setLocation}
              variant="bordered"
              size="lg"
            />
          </div>

          {/* Ngày nhận xe */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Ngày nhận xe
            </label>
            <DatePicker
              aria-label="Ngày nhận xe"
              value={startDate}
              onChange={setStartDate}
              variant="bordered"
              size="lg"
              granularity="day"
              popoverProps={{
                portalContainer: document.body,
                classNames: { content: "z-[9999]" },
              }}
            />
          </div>

          {/* Ngày trả xe */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Ngày trả xe
            </label>
            <DatePicker
              aria-label="Ngày trả xe"
              value={endDate}
              onChange={setEndDate}
              variant="bordered"
              size="lg"
              granularity="day"
              minValue={startDate || undefined}
              popoverProps={{
                portalContainer: document.body,
                classNames: { content: "z-[9999]" },
              }}
            />
          </div>

          {/* Loại xe */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Loại xe
            </label>
            <Select
              placeholder="Chọn loại xe"
              selectionMode="single"
              selectedKeys={[vehicleType === "" ? "all" : vehicleType]}
              onSelectionChange={(keys) => {
                const raw = Array.from(keys)[0]?.toString();
                setVehicleType(raw === "all" ? "" : (raw as VehicleType));
              }}
              variant="bordered"
              size="lg"
            >
              <SelectItem key="all">tất cả</SelectItem>
              <SelectItem key="xe máy điện">Xe máy điện</SelectItem>
              <SelectItem key="ô tô điện">Ô tô điện</SelectItem>
            </Select>
          </div>

          {/* Nút tìm */}
          <div>
            <Button
              type="submit"
              color="primary"
              className="w-full h-12 font-medium gap-2"
            >
              <Icon icon="lucide:search" className="w-5 h-5" />
              Tìm
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
