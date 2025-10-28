import { useEffect, useMemo, useState } from "react";
import { MapPin, Search, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { listStationsBrief, type StationBrief } from "@/services/stationServices";

// ================== Types ==================
// Vehicle types are dynamic from DB, keep as string with empty meaning "all"
export type VehicleType = string;

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

// Keep helpers for compatibility (submit empty values)
const formatDateForSubmit = () => "";

// ================== Component ==================
export default function SearchBar({ onSubmit, defaultValues }: SearchBarProps) {
  const [location, setLocation] = useState("");
  const [vehicleType] = useState<VehicleType>("");
  const [stations, setStations] = useState<StationBrief[]>([]);
  const [openList, setOpenList] = useState(false);
  const [address, setAddress] = useState("");

  // Load stations once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listStationsBrief();
        if (!cancelled) setStations(list);
      } catch {
        if (!cancelled) setStations([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredStations = useMemo(() => stations, [stations]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onSubmit({
      location,
      startDate: formatDateForSubmit(),
      endDate: formatDateForSubmit(),
      vehicleType,
    });
  };

  return (
    <div className="w-full md:w-[50%] max-w-6xl mx-auto">
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/30">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
        >
          {/* Địa điểm */}
          <div className="space-y-2 relative md:col-span-5">
            <label htmlFor="search-location" className="sr-only">Địa điểm</label>
            {/* input styled like the orange version (rounded, icon inside, dropdown caret) */}
            <Input
              id="search-location"
              placeholder="Chọn địa điểm thuê xe"
              value={location}
              readOnly
              onClick={() => setOpenList((v) => !v)}
              onFocus={() => setOpenList(true)}
              onBlur={() => {
                // Delay closing to allow onMouseDown selection
                setTimeout(() => setOpenList(false), 120);
              }}
              role="button"
              className={cn(
                // compact for horizontal layout
                "h-12 text-base rounded-full pl-5 pr-11 shadow-sm bg-white",
                // blue border like screenshot (but keep current palette elsewhere)
                "border-2 border-[#173E7C] focus:border-[#173E7C]",
                // subtle focus ring without changing color scheme
                "focus:outline-none focus:ring-2 focus:ring-[#9BB4E3]",
                // text colors
                "text-slate-900 placeholder:text-slate-500"
              )}
            />
            {/* Icon removed as requested */}
            <ChevronDown
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-transform",
                openList ? "rotate-180" : "rotate-0"
              )}
            />
            {openList && (
              <div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                {filteredStations.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Không có trạm phù hợp</div>
                ) : (
                  filteredStations.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-accent/30"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setLocation(s.name);
                        setAddress(s.address || "");
                        setOpenList(false);
                      }}
                      title={s.name}
                    >
                      <div className="font-medium text-sm">{s.name}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Địa điểm trạm (địa chỉ) bên cạnh */}
          <div className="space-y-2 relative md:col-span-5">
            <label htmlFor="station-address" className="sr-only">Địa chỉ</label>
            <Input
              id="station-address"
              placeholder="Địa chỉ của trạm "
              value={address}
              readOnly
              className={cn(
                // same compact height
                "h-12 text-base rounded-full pl-5 pr-5 shadow-sm bg-white",
                "border-2 border-[#173E7C] focus:border-[#173E7C]",
                "focus:outline-none focus:ring-2 focus:ring-[#9BB4E3]",
                "text-slate-900 placeholder:text-slate-500"
              )}
            />
          </div>
          
          {/* Nút tìm nhỏ ở bên phải */}
          <div className="flex items-end md:col-span-2">
            <Button
              type="submit"
              className="w-full h-12 rounded-full text-base font-semibold gap-2 bg-primary hover:bg-accent text-primary-foreground"
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
