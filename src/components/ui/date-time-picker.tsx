import { useEffect, useMemo, useState } from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { format, isBefore, setHours, setMinutes, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type TimeGranularity = 5 | 10 | 15 | 30 | 60;

interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  timeStep?: TimeGranularity;
  disabled?: boolean;
  className?: string;
  showTime?: boolean; // when false, hide time selectors and use date-only
}

const defaultPlaceholder = "Chọn ngày & giờ";

const buildMinutes = (step: TimeGranularity) => {
  const minutes: string[] = [];
  for (let m = 0; m < 60; m += step) {
    minutes.push(m.toString().padStart(2, "0"));
  }
  return minutes;
};

export function DateTimePicker({
  value,
  onChange,
  placeholder = defaultPlaceholder,
  minDate,
  timeStep = 5,
  disabled = false,
  className,
  showTime = true,
}: DateTimePickerProps) {
  const [internalDate, setInternalDate] = useState<Date | null>(value);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setInternalDate(value);
  }, [value]);

  const selectedDate = internalDate ?? value ?? null;

  const hours = useMemo(() => Array.from({ length: 24 }, (_, index) => index.toString().padStart(2, "0")), []);
  const minutes = useMemo(() => buildMinutes(timeStep), [timeStep]);

  const currentHour = selectedDate?.getHours() ?? 0;
  const currentMinute = selectedDate?.getMinutes() ?? 0;
  const normalizedMinute = currentMinute.toString().padStart(2, "0");
  const minuteValue = minutes.includes(normalizedMinute) ? normalizedMinute : minutes[0];
  const hourValue = currentHour.toString().padStart(2, "0");

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setInternalDate(null);
      onChange(null);
      return;
    }

    const carrySource = selectedDate ?? new Date();
    const next = setMinutes(setHours(date, carrySource.getHours()), carrySource.getMinutes());
    setInternalDate(next);
    onChange(next);
  };

  const handleTimeChange = (type: "hour" | "minute", valueStr: string) => {
    const base = selectedDate ?? new Date();
    const next = new Date(base);

    if (type === "hour") {
      next.setHours(Number(valueStr));
    } else {
      next.setMinutes(Number(valueStr));
    }
    next.setSeconds(0);
    next.setMilliseconds(0);

    setInternalDate(next);
    onChange(next);
  };

  const disableDate = (date: Date) => {
    if (!minDate) return false;
    const target = startOfDay(date);
    const min = startOfDay(minDate);
    return isBefore(target, min);
  };

  const formattedValue = selectedDate
    ? format(selectedDate, showTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy", { locale: vi })
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          {formattedValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col sm:flex-row">
          <Calendar
            mode="single"
            selected={selectedDate ?? undefined}
            onSelect={handleDateSelect}
            initialFocus
            disabled={disableDate}
            locale={vi}
          />
          {showTime && (
          <div className="border-t sm:border-l sm:border-t-0 border-border/60 p-4 min-w-[200px]">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Chọn giờ</span>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Giờ</p>
                <Select value={hourValue} onValueChange={(val) => handleTimeChange("hour", val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour}>
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Phút</p>
                <Select value={minuteValue} onValueChange={(val) => handleTimeChange("minute", val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {minutes.map((minute) => (
                      <SelectItem key={minute} value={minute}>
                        {minute}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInternalDate(null);
                  onChange(null);
                }}
              >
                Xóa
              </Button>
              <Button size="sm" onClick={() => setOpen(false)}>
                Xong
              </Button>
            </div>
          </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
