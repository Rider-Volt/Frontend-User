import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Battery,
  Zap,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Settings,
  Fuel,
  Leaf,
  ArrowLeft,
  Share2,
  Crown,
  AlertCircle,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import { differenceInCalendarDays, format, addDays } from "date-fns";
import { vi } from "date-fns/locale";
import Navbar from "@/components/heroUi/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Nếu bạn dùng Radix hoặc custom dialog
import { useToast } from "@/hooks/use-toast";
import { appendBookingHistory, StoredBooking } from "@/services/bookingService";
import { createBilling } from "@/services/renterBillingService";
import {
  createDemoPaymentInfo,
  createPayOSPaymentLink,
  extractCheckoutUrl,
  extractQrCode,
  type DemoPaymentInfo,
  type PayOSPaymentLinkResponse,
  mockMarkPaymentAsPaid,
} from "@/services/paymentService";
import { getCurrentUser, fetchProfileFromAPI } from "@/services/authService";
import { VehicleData } from "@/data/vehicles";
import { fetchVehicleById } from "@/services/vehicleService";
import { DateTimePicker } from "@/components/ui/date-time-picker";

const VehicleDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const { toast } = useToast();
  const [loadingVehicle, setLoadingVehicle] = useState(true);
  const [vehicleError, setVehicleError] = useState<string | null>(null);

  // Booking form state
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [pickupOption, setPickupOption] = useState("self");
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [isBooking, setIsBooking] = useState(false);

  // Modal state
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<DemoPaymentInfo | null>(null);
  const [payOsPayment, setPayOsPayment] = useState<null | {
    billingId: number;
    payload: PayOSPaymentLinkResponse;
    checkoutUrl?: string;
    qrUrl?: string;
  }>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setIsLoggedIn(true);
      try {
        const user = JSON.parse(userData);
        setUsername(user.name || user.username || "User");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadVehicle = async () => {
      setLoadingVehicle(true);
      setVehicleError(null);

      const stateData = (
        location.state as { vehicle?: VehicleData } | undefined
      )?.vehicle;
      if (stateData) {
        setVehicle(stateData);
        setLoadingVehicle(false);
        return;
      }

      const vehicleId = parseInt(id || "", 10);
      if (Number.isNaN(vehicleId)) {
        setVehicle(null);
        setVehicleError("ID xe không hợp lệ");
        setLoadingVehicle(false);
        return;
      }

      try {
        const data = await fetchVehicleById(vehicleId);
        if (!cancelled) {
          setVehicle(data);
          if (!data) {
            setVehicleError("Không tìm thấy thông tin xe");
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setVehicle(null);
          setVehicleError(err?.message || "Không tải được thông tin xe");
        }
      } finally {
        if (!cancelled) {
          setLoadingVehicle(false);
        }
      }
    };

    loadVehicle();
    return () => {
      cancelled = true;
    };
  }, [id, location.state]);

  // Pricing derived from backend
  const pricePerDay =
    vehicle && vehicle.pricePerDay && vehicle.pricePerDay > 0
      ? vehicle.pricePerDay
      : 600000;
  const rentalDurationDays =
    startDate && endDate ? differenceInCalendarDays(endDate, startDate) : 0;
  const minDurationDays = 1;
  const isEndAfterStart = !startDate || !endDate || rentalDurationDays > 0;
  const isDurationValid =
    !startDate || !endDate || rentalDurationDays >= minDurationDays;

  const isVehicleAvailable =
    !!vehicle &&
    (vehicle.status ?? "AVAILABLE") === "AVAILABLE" &&
    vehicle.available !== false;

  const inferredType = vehicle?.type?.toLowerCase() || "";
  const isCar =
    inferredType.includes("ô tô") ||
    inferredType.includes("car") ||
    inferredType.includes("suv");
  // Đã xóa tiền cọc
  const depositAmount = 0;

  const chargeableDays = rentalDurationDays > 0 ? rentalDurationDays : 0;

  const rentalAmount =
    chargeableDays > 0 ? Math.round(pricePerDay * chargeableDays) : 0;
  const totalPayable = rentalAmount;

  const maxAdvanceDays = 7;
  const advanceLimitDate = addDays(new Date(), maxAdvanceDays);
  const advanceLimitExceeded = startDate ? startDate > advanceLimitDate : false;

  const formatCurrency = (value: number) =>
    value.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "₫";
  const formatEpochSeconds = (value?: number | null) => {
    if (!value) return "—";
    try {
      return format(new Date(value * 1000), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return `${value}`;
    }
  };

  const handleCopy = async (value: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: "Đã sao chép",
        description: label ? `${label}: ${value}` : value,
      });
    } catch {
      toast({
        title: "Không thể sao chép",
        description: value,
        variant: "destructive",
      });
    }
  };

const InfoRow = ({
  label,
  value,
  copy,
}: {
    label: string;
    value: string;
    copy?: boolean;
  }) => (
    <div className="flex items-center justify-between rounded-lg border px-3 py-2 bg-background">
      <div>
        <p className="text-xs uppercase text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground">{value}</p>
      </div>
      {copy && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleCopy(value, label)}
        >
          Sao chép
        </Button>
      )}
    </div>
  );

  const handleMockPayOsSuccess = async () => {
    if (!payOsPayment) return;
    try {
      await mockMarkPaymentAsPaid(payOsPayment.billingId);
      toast({
        title: "Đã ghi nhận thanh toán demo",
        description:
          "Hóa đơn sẽ chuyển sang trạng thái chờ nhân viên xác nhận.",
      });
      setPayOsPayment(null);
      navigate("/bookings");
    } catch (err) {
      toast({
        title: "Không thể đánh dấu thanh toán",
        description:
          err instanceof Error ? err.message : "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  if (loadingVehicle) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar isLoggedIn={isLoggedIn} username={username} />
        <div className="flex-1 flex items-center justify-center">
          <p>Đang tải thông tin xe…</p>
        </div>
      </div>
    );
  }

  const mainImage = (vehicle.image ?? vehicle.imageUrl ?? "").trim();

  if (!vehicle) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar isLoggedIn={isLoggedIn} username={username} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
          <p>{vehicleError || "Không tìm thấy thông tin xe."}</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const handleBooking = async () => {
    if (!vehicle) {
      toast({
        title: "Không tìm thấy thông tin xe",
        description: "Vui lòng thử lại sau.",
        variant: "destructive",
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Thiếu thời gian thuê",
        description: "Hãy chọn đầy đủ thời gian bắt đầu và kết thúc.",
        variant: "destructive",
      });
      return;
    }

    if (!isEndAfterStart) {
      toast({
        title: "Thời gian không hợp lệ",
        description: "Ngày kết thúc phải sau ngày bắt đầu.",
        variant: "destructive",
      });
      return;
    }

    if (!isDurationValid) {
      toast({
        title: "Thời gian thuê quá ngắn",
        description: `Vui lòng chọn thời gian thuê tối thiểu ${minDurationDays} ngày.`,
        variant: "destructive",
      });
      return;
    }

    if (!isVehicleAvailable) {
      toast({
        title: "Xe không khả dụng",
        description: "Xe đang tạm dừng cho thuê, vui lòng chọn xe khác.",
        variant: "destructive",
      });
      return;
    }

    if (advanceLimitExceeded) {
      toast({
        title: "Ngày thuê không hợp lệ",
        description: `Bạn chỉ có thể đặt trước tối đa ${maxAdvanceDays} ngày so với hiện tại.`,
        variant: "destructive",
      });
      return;
    }

    let currentUser = getCurrentUser();
    const token = localStorage.getItem("token") || "";

    if (!token) {
      toast({
        title: "Cần đăng nhập",
        description: "Bạn hãy đăng nhập để tiếp tục đặt xe.",
      });
      navigate("/login");
      return;
    }

    if (!currentUser) {
      try {
        currentUser = await fetchProfileFromAPI();
      } catch (error) {
        toast({
          title: "Không lấy được thông tin người dùng",
          description: "Vui lòng đăng nhập lại.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }
    }

    let userIdValue = currentUser?.id ?? currentUser?.userId;

    if (!userIdValue || Number.isNaN(Number(userIdValue))) {
      try {
        const refreshed = await fetchProfileFromAPI();
        currentUser = refreshed;
        userIdValue = refreshed.id ?? refreshed.userId;
      } catch (error) {
        toast({
          title: "Không lấy được thông tin người dùng",
          description: "Vui lòng đăng nhập lại.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }
    }

    const userId = Number(userIdValue);

    if (!userId || Number.isNaN(userId)) {
      toast({
        title: "Không xác định được tài khoản",
        description: "Thông tin người dùng không hợp lệ.",
        variant: "destructive",
      });
      return;
    }

    const pickupLocation =
      pickupOption === "self"
        ? vehicle.fullAddress || vehicle.location
        : "Giao tận nơi - sẽ liên hệ để xác nhận địa điểm";

    const toInstant = (date: Date) => date.toISOString();
    const payload = {
      modelId: vehicle.id,
      stationId: vehicle.stationId || 1,
      startDay: toInstant(startDate),
      endDay: toInstant(endDate),
    };

    setIsBooking(true);
    try {
      const billing = await createBilling(payload);
      const effectiveRentalAmount = rentalAmount;
  const totalCharge = effectiveRentalAmount;

      const storedEntry: StoredBooking = {
        ...billing,
        bookingId: billing.id,
        totalCost: billing.totalCost ?? effectiveRentalAmount,
  // Đã xóa tiền cọc
        totalCharge,
        localVehicleName: vehicle.name,
        localVehicleImage: vehicle.image || vehicle.imageUrl || "",
        pickupLocation,
        paymentMethod,
      };

      appendBookingHistory(userId, storedEntry);

      try {
        const payOSPayload = await createPayOSPaymentLink(billing.id);
        const checkoutUrl = extractCheckoutUrl(payOSPayload);
        const qrUrl = extractQrCode(payOSPayload);
        if (!checkoutUrl && !qrUrl) {
          throw new Error("Không tìm thấy liên kết PayOS trong phản hồi");
        }
        setPayOsPayment({
          billingId: billing.id,
          payload: payOSPayload,
          checkoutUrl,
          qrUrl,
        });
        toast({
          title: "Đặt xe thành công",
          description:
            "Liên kết PayOS đã sẵn sàng. Hoàn tất thanh toán trong cửa sổ popup.",
        });
        return;
      } catch (payErr) {
        console.warn("PayOS payment link fallback to demo:", payErr);
        try {
          const info = await createDemoPaymentInfo({
            billingId: billing.id,
            amount: totalCharge,
          });
          setPaymentInfo(info);
          toast({
            title: "Đặt xe thành công",
            description:
              "PayOS tạm thời không khả dụng. Vui lòng dùng hướng dẫn chuyển khoản demo bên dưới.",
          });
        } catch (demoErr) {
          toast({
            title: "Đặt xe thành công",
            description: `Mã hóa đơn #${billing.id}. Không thể tạo liên kết thanh toán ngay lúc này, vui lòng thanh toán trong mục lịch sử.`,
          });
          navigate("/bookings");
        }
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra. Vui lòng thử lại.";
      toast({
        title: "Không thể đặt xe",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy xe</h1>
          <Button onClick={() => navigate("/")}>Quay về trang chủ</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar isLoggedIn={isLoggedIn} username={username} />

      {/* Header */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg font-semibold">Chi tiết xe</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Vehicle Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Title and Badge */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{vehicle.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{vehicle.location}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    className={
                      isVehicleAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {isVehicleAvailable ? "Sẵn sàng" : "Tạm dừng khai thác"}
                  </Badge>
                  {vehicle.status && (
                    <Badge variant="outline" className="text-xs uppercase">
                      {vehicle.status}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Main Image */}
            <div>
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={vehicle.name}
                  className="w-full rounded-lg object-cover"
                />
              ) : (
                <div className="w-full h-64 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  Chưa có ảnh
                </div>
              )}
            </div>

            {/* Features */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b-2 border-green-500 pb-2 inline-block">
                Đặc điểm
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Số ghế
                    </span>
                    <p className="font-medium">{vehicle.features?.seats} chỗ</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-blue-500" />
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Truyền động
                    </span>
                    <p className="font-medium">
                      {vehicle.features?.transmission}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Battery className="w-5 h-5 text-blue-500" />
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Nhiên liệu
                    </span>
                    <p className="font-medium">{vehicle.features?.fuel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Leaf className="w-5 h-5 text-blue-500" />
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Tiêu hao
                    </span>
                    <p className="font-medium">
                      {vehicle.features?.consumption}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b-2 border-green-500 pb-2 inline-block">
                Mô tả
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {vehicle.description}
              </p>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b-2 border-green-500 pb-2 inline-block">
                Vị trí xe
              </h2>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <p className="font-medium">{vehicle.fullAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing and Booking */}
          <div className="space-y-6">
            {/* Pricing */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Giá & đặt cọc</h3>
              <div className="space-y-3 rounded-lg border border-muted-foreground/20 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Đơn giá thuê 1 ngày (24 giờ)
                  </span>
                  <span className="font-semibold text-green-700">
                    {formatCurrency(pricePerDay)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Số ngày tính phí
                  </span>
                  <span className="font-semibold text-green-700">
                    {chargeableDays > 0
                      ? `${chargeableDays} ngày`
                      : "Chưa xác định"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Đặt cọc bắt buộc
                  </span>
                  <span className="font-semibold text-blue-700">
                    {formatCurrency(depositAmount)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Phí thuê được tính theo thời gian thực tế: đơn giá ngày × số
                  ngày (làm tròn lên đến 1 ngày nếu thời gian &ge; 8 giờ).
                </p>
                <p className="text-xs text-muted-foreground">
                  Quy định đặt cọc: ô tô 5.000.000đ, xe máy 1.000.000đ. Mức hiển
                  thị ở trên áp dụng cho loại xe này.
                </p>
              </div>
            </div>

            {/* Pickup option */}
            <div className="border-2 border-green-100 rounded-lg p-4 bg-green-50">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-700">
                  Hình thức nhận xe
                </span>
              </div>
              <Select value={pickupOption} onValueChange={setPickupOption}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Chọn hình thức nhận xe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">Nhận xe tại trạm</SelectItem>
                  <SelectItem value="delivery">
                    Giao xe tận nơi (+ phí)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-muted-foreground">
                {pickupOption === "self"
                  ? "Bạn sẽ nhận xe trực tiếp tại điểm cho thuê."
                  : "Nhân viên sẽ liên hệ để xác nhận địa chỉ và chi phí giao xe."}
              </p>
            </div>

            {/* Payment method */}
            <div className="border-2 border-blue-100 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-700">
                  Phương thức thanh toán
                </span>
              </div>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Chọn phương thức thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit-card">
                    Thẻ tín dụng/Ghi nợ
                  </SelectItem>
                  <SelectItem value="momo">Ví MoMo</SelectItem>
                  <SelectItem value="zalopay">Ví ZaloPay</SelectItem>
                  <SelectItem value="cash">Thanh toán tiền mặt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rental Time */}
            <div className="rounded-lg border border-muted-foreground/20 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-700">
                    Thời gian thuê
                  </span>
                </div>
                {rentalDurationDays > 0 && (
                  <Badge variant="outline" className="text-xs font-normal">
                    Ước tính: {rentalDurationDays} ngày
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Ngày bắt đầu
                  </Label>
                  <DateTimePicker
                    value={startDate}
                    onChange={setStartDate}
                    minDate={new Date()}
                    placeholder="Chọn ngày bắt đầu"
                    showTime={false}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Ngày kết thúc
                  </Label>
                  <DateTimePicker
                    value={endDate}
                    onChange={setEndDate}
                    minDate={startDate ?? new Date()}
                    placeholder="Chọn ngày kết thúc"
                    showTime={false}
                  />
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-md border border-muted-foreground/10">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-muted-foreground/10 bg-muted/30">
                      <td className="px-3 py-2 font-medium text-muted-foreground">
                        Ngày bắt đầu
                      </td>
                      <td className="px-3 py-2">
                        {startDate
                          ? format(startDate, "dd/MM/yyyy", { locale: vi })
                          : "Chưa chọn"}
                      </td>
                    </tr>
                    <tr className="border-b border-muted-foreground/10">
                      <td className="px-3 py-2 font-medium text-muted-foreground">
                        Ngày kết thúc
                      </td>
                      <td className="px-3 py-2">
                        {endDate
                          ? format(endDate, "dd/MM/yyyy", { locale: vi })
                          : "Chưa chọn"}
                      </td>
                    </tr>
                    <tr className="border-b border-muted-foreground/10">
                      <td className="px-3 py-2 font-medium text-muted-foreground">
                        Số ngày thuê
                      </td>
                      <td className="px-3 py-2">
                        {rentalDurationDays > 0
                          ? `${rentalDurationDays} ngày`
                          : "Chưa xác định"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium text-muted-foreground">
                        Yêu cầu tối thiểu
                      </td>
                      <td className="px-3 py-2">≥ {minDurationDays} ngày</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Bạn có thể đặt trước tối đa {maxAdvanceDays} ngày kể từ thời
                điểm hiện tại.
              </p>
              {advanceLimitExceeded && (
                <p className="text-xs text-red-600 mt-1">
                  Ngày bắt đầu vượt quá giới hạn đặt trước. Vui lòng chọn ngày
                  sớm hơn.
                </p>
              )}

              {startDate &&
                endDate &&
                (!isEndAfterStart || !isDurationValid) && (
                  <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4" />
                      <div className="space-y-1">
                        {!isEndAfterStart && (
                          <p>Ngày kết thúc phải sau ngày bắt đầu.</p>
                        )}
                        {!isDurationValid && (
                          <p>
                            Thời gian thuê tối thiểu là {minDurationDays} ngày.
                            Vui lòng chọn khoảng thời gian dài hơn.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Bảo hiểm thuê xe */}
            <div className="my-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold mb-2 text-black">
                Bảo hiểm thuê xe
              </h4>
              <p className="text-sm text-gray-700">
                Chuyến đi có mua bảo hiểm. Khách thuê bồi thường tối đa{" "}
                <span className="font-semibold text-red-600">
                  2.000.000 VNĐ
                </span>{" "}
                trong trường hợp có sự cố ngoài ý muốn.
              </p>
              <div
                className="mt-2 text-xs text-blue-600 cursor-pointer hover:underline"
                onClick={() => setShowInsuranceModal(true)}
              >
                Xem thêm &gt;
              </div>
            </div>

            {/* Modal chi tiết bảo hiểm */}
            {showInsuranceModal && (
              <Dialog
                open={showInsuranceModal}
                onOpenChange={setShowInsuranceModal}
              >
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Bảo hiểm thuê xe điện</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 text-sm text-gray-800">
                    <p>
                      Với nhiều năm kinh nghiệm trong lĩnh vực cho thuê xe,
                      chúng tôi hiểu rằng các rủi ro đâm đụng, cháy nổ, thủy
                      kích gây tổn thất lớn (vượt quá khả năng chi trả) luôn
                      tiềm ẩn trong thời gian thuê xe.
                    </p>
                    <p>
                      Trong khi đó, hầu hết các rủi ro phát sinh trong quá trình
                      thuê xe tự lái sẽ không thuộc phạm vi của Bảo hiểm thân vỏ
                      xe theo năm (hay còn gọi là Bảo hiểm 2 chiều).
                    </p>
                    <p>
                      Xuất phát từ nhu cầu thiết yếu của khách hàng, chúng tôi
                      kết hợp với các đối tác bảo hiểm hàng đầu Việt Nam cùng
                      mang đến sản phẩm Bảo hiểm thuê xe điện với mức phí thực
                      sự tiết kiệm và số tiền bảo hiểm lớn (đến 100% giá trị xe)
                      sẽ giúp bạn không còn lo lắng khi thuê xe & an tâm tận
                      hưởng hành trình của mình.
                    </p>
                    <h4 className="font-semibold mt-4">
                      I. Nội dung sản phẩm Bảo hiểm thuê xe
                    </h4>
                    <p>
                      Trong thời gian thuê xe, nếu xảy ra các sự cố va chạm
                      ngoài ý muốn dẫn đến tổn thất về xe, khách thuê sẽ chỉ bồi
                      thường số tiền tối đa{" "}
                      <span className="font-semibold text-red-600">
                        2.000.000 VNĐ
                      </span>{" "}
                      để sửa chữa xe (mức khấu trừ), nhà bảo hiểm sẽ hỗ trợ cho
                      các chi phí phát sinh vượt mức khấu trừ.
                    </p>
                    {/* Bảng minh họa bảo hiểm */}
                    <div className="my-4">
                      <table className="w-full text-sm border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                        <thead>
                          <tr>
                            <th className="py-2 px-3 text-left">
                              Thiệt hại xe
                            </th>
                            <th className="py-2 px-3 text-left">
                              Khách thanh toán
                            </th>
                            <th className="py-2 px-3 text-left">
                              BH thanh toán
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t">
                            <td className="py-2 px-3">&lt;= 2 triệu</td>
                            <td className="py-2 px-3">&lt;= 2 triệu</td>
                            <td className="py-2 px-3">0 triệu</td>
                          </tr>
                          <tr className="border-t">
                            <td className="py-2 px-3">&gt; 2 triệu</td>
                            <td className="py-2 px-3">2 triệu</td>
                            <td className="py-2 px-3">298 triệu</td>
                          </tr>
                        </tbody>
                      </table>
                      <div className="mt-2 text-xs text-gray-700">
                        Ví dụ minh họa: Xe có sự cố tổn thất{" "}
                        <span className="font-semibold">300.000.000đ</span>.
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Total and Book Button */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tiền thuê dự kiến</span>
                <span className="font-semibold text-green-800">
                  {rentalAmount > 0
                    ? formatCurrency(rentalAmount)
                    : "Chọn thời gian"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Đặt cọc</span>
                <span className="font-semibold text-blue-700">
                  {formatCurrency(depositAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-green-200 text-base font-semibold">
                <span>Tổng thanh toán ban đầu</span>
                <span className="text-green-900">
                  {formatCurrency(totalPayable)}
                </span>
              </div>

              {advanceLimitExceeded && (
                <p className="text-xs text-red-600">
                  Ngày bắt đầu thuê không được vượt quá {maxAdvanceDays} ngày so
                  với hiện tại.
                </p>
              )}

              {!isVehicleAvailable && (
                <p className="text-xs text-red-600">
                  Xe hiện không khả dụng để đặt. Vui lòng chọn xe khác hoặc quay
                  lại sau.
                </p>
              )}

              <Button
                className="w-full bg-green-500 hover:bg-green-600"
                onClick={handleBooking}
                disabled={
                  !startDate ||
                  !endDate ||
                  isBooking ||
                  !isEndAfterStart ||
                  !isDurationValid ||
                  advanceLimitExceeded ||
                  !isVehicleAvailable
                }
              >
                {isBooking ? "Đang xử lý..." : "Thanh toán"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Vui lòng hoàn tất thanh toán theo hướng dẫn để xác nhận đặt xe.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={!!payOsPayment}
        onOpenChange={(open) => {
          if (!open) {
            setPayOsPayment(null);
            navigate("/bookings");
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Thanh toán PayOS</DialogTitle>
            <DialogDescription>
              Thực hiện thanh toán trực tuyến qua PayOS. Sau khi PayOS ghi nhận giao
              dịch, nhân viên sẽ phê duyệt hóa đơn để bạn tiếp tục quy trình thuê xe.
            </DialogDescription>
          </DialogHeader>
          {payOsPayment ? (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoRow
                  label="Mã hóa đơn"
                  value={`#${payOsPayment.billingId}`}
                />
                <InfoRow
                  label="Mã thanh toán"
                  value={payOsPayment.payload.paymentLinkId || "—"}
                />
                <InfoRow
                  label="Số tiền"
                  value={
                    typeof payOsPayment.payload.amount === "number"
                      ? formatCurrency(payOsPayment.payload.amount)
                      : "—"
                  }
                />
                <InfoRow
                  label="Hết hạn"
                  value={formatEpochSeconds(payOsPayment.payload.expiredAt)}
                />
                {payOsPayment.payload.accountName && (
                  <InfoRow
                    label="Chủ tài khoản"
                    value={payOsPayment.payload.accountName}
                    copy
                  />
                )}
                {payOsPayment.payload.accountNumber && (
                  <InfoRow
                    label="Số tài khoản"
                    value={payOsPayment.payload.accountNumber}
                    copy
                  />
                )}
                {payOsPayment.payload.bin && (
                  <InfoRow
                    label="Mã ngân hàng (BIN)"
                    value={String(payOsPayment.payload.bin)}
                  />
                )}
                {payOsPayment.payload.description && (
                  <InfoRow
                    label="Nội dung"
                    value={payOsPayment.payload.description}
                    copy
                  />
                )}
              </div>
              {(payOsPayment.checkoutUrl || payOsPayment.qrUrl) && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    className="flex-1"
                    onClick={() =>
                      payOsPayment.checkoutUrl &&
                      window.open(
                        payOsPayment.checkoutUrl,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                    disabled={!payOsPayment.checkoutUrl}
                  >
                    Mở trang thanh toán
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      payOsPayment.checkoutUrl &&
                      handleCopy(payOsPayment.checkoutUrl, "Liên kết PayOS")
                    }
                    disabled={!payOsPayment.checkoutUrl}
                  >
                    Sao chép liên kết
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() =>
                      payOsPayment.qrUrl &&
                      window.open(
                        payOsPayment.qrUrl,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                    disabled={!payOsPayment.qrUrl}
                  >
                    Mở mã QR
                  </Button>
                </div>
              )}
              {payOsPayment.qrUrl && (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={payOsPayment.qrUrl}
                    alt="QR PayOS"
                    className="h-60 w-60 rounded-xl border bg-white p-4 shadow-sm"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Quét mã QR hoặc mở trang PayOS để hoàn tất thanh toán.
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Sau khi thanh toán, hóa đơn sẽ chuyển sang trạng thái chờ xác nhận.
                Nhân viên sẽ duyệt thủ công trước khi bạn có thể nhận xe.
              </p>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              Đang tải thông tin thanh toán…
            </div>
          )}
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setPayOsPayment(null);
                navigate("/bookings");
              }}
            >
              Đóng
            </Button>
            <Button
              onClick={handleMockPayOsSuccess}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Thanh toán demo (đánh dấu thành công)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!paymentInfo}
        onOpenChange={(open) => {
          if (!open) {
            setPaymentInfo(null);
            navigate("/bookings");
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Hướng dẫn chuyển khoản tạm thời</DialogTitle>
            <DialogDescription>
              Mã hóa đơn #{paymentInfo?.billingId ?? ""}. PayOS đang tạm thời
              không khả dụng, vui lòng chuyển khoản thủ công theo hướng dẫn dưới
              đây.
            </DialogDescription>
          </DialogHeader>
          {paymentInfo ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,280px),1fr]">
              <div className="flex flex-col items-center gap-3">
                <img
                  src={paymentInfo.qrImageUrl}
                  alt="QR thanh toán"
                  className="h-64 w-64 rounded-lg border bg-white p-3 shadow-sm"
                />
                <p className="text-sm text-muted-foreground text-center">
                  Quét mã VietQR để thực hiện chuyển khoản tự động điền thông
                  tin.
                </p>
              </div>
              <div className="space-y-3">
                <InfoRow label="Ngân hàng" value={paymentInfo.bankName} />
                <InfoRow
                  label="Chủ tài khoản"
                  value={paymentInfo.accountName}
                  copy
                />
                <InfoRow
                  label="Số tài khoản"
                  value={paymentInfo.accountNumber}
                  copy
                />
                <InfoRow label="Số tiền" value={paymentInfo.amountLabel} copy />
                <InfoRow
                  label="Nội dung"
                  value={paymentInfo.description}
                  copy
                />
                {paymentInfo.note && (
                  <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">
                    {paymentInfo.note}
                  </p>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    className="flex-1"
                    onClick={() =>
                      window.open(
                        paymentInfo.qrImageUrl,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    Mở ảnh QR trong tab mới
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          paymentInfo.description
                        );
                        toast({
                          title: "Đã sao chép nội dung chuyển khoản",
                          description: paymentInfo.description,
                        });
                      } catch {
                        toast({
                          title: "Không thể sao chép",
                          description: paymentInfo.description,
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Sao chép nội dung
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => {
                      setPaymentInfo(null);
                      navigate("/bookings");
                    }}
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              Đang tải thông tin thanh toán…
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VehicleDetailsPage;
