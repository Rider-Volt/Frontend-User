import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation, useSearchParams, Link } from "react-router-dom";
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
  Phone,
  ChevronLeft,
  ChevronRight,
  IdCard,
} from "lucide-react";
import { differenceInCalendarDays, format, addDays } from "date-fns";
import { vi } from "date-fns/locale";
import Navbar from "@/components/heroUi/Navbar";
import Footer from "@/components/heroUi/Footer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { appendBookingHistory, StoredBooking } from "@/services/bookingService";
import { createBilling, listIdentitySets, type IdentitySet } from "@/services/renterBillingService";
import {
  createDemoPaymentInfo,
  createPayOSPaymentLink,
  extractCheckoutUrl,
  extractQrCode,
  type DemoPaymentInfo,
  type PayOSPaymentLinkResponse,
  mockMarkPaymentAsPaid,
  processPayOSPaymentReturn,
} from "@/services/paymentService";
import { getCurrentUser, fetchProfileFromAPI } from "@/services/authService";
// Local minimal type to avoid external import resolution issues
interface VehicleData {
  id: number;
  name: string;
  type?: string;
  pricePerDay?: number;
  status?: string;
  available?: boolean;
  location?: string;
  image?: string;
  imageUrl?: string;
  stationId?: number;
  description?: string;
  features?: {
    seats?: number | string;
    transmission?: string;
    fuel?: string;
    consumption?: string;
  };
}
import { getHardcodedSpecs } from "../data/vehicleSpecs";
import { fetchVehicleById } from "@/services/vehicleService";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { listStationsBrief, type StationBrief } from "@/services/stationServices";

const VehicleDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const { toast } = useToast();
  const [loadingVehicle, setLoadingVehicle] = useState(true);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  const [stations, setStations] = useState<StationBrief[]>([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Booking form state
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [actualRentalAmount, setActualRentalAmount] = useState<number | null>(null);
  
  // Identity set state
  const [identitySets, setIdentitySets] = useState<IdentitySet[]>([]);
  const [selectedIdentitySetId, setSelectedIdentitySetId] = useState<number | null>(null);
  const [loadingIdentitySets, setLoadingIdentitySets] = useState(false);

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

  // Handle PayOS payment return
  useEffect(() => {
    const checkPaymentReturn = async () => {
      // Check if there are query params that might indicate a PayOS return
      // PayOS typically redirects with query params like code, status, etc.
      const hasPayOSParams = 
        searchParams.has("code") || 
        searchParams.has("status") || 
        searchParams.has("orderCode") ||
        searchParams.has("paymentLinkId");

      if (hasPayOSParams) {
        try {
          // Pass the query params to the API
          await processPayOSPaymentReturn(searchParams);
          toast({
            title: "Thanh toán thành công",
            description: "Thanh toán đã được xử lý. Vui lòng kiểm tra trạng thái đơn hàng.",
          });
          // Clean up URL by removing query params
          navigate(location.pathname, { replace: true });
        } catch (error) {
          console.error("Error processing payment return:", error);
          toast({
            title: "Lỗi xử lý thanh toán",
            description: error instanceof Error ? error.message : "Không thể xử lý kết quả thanh toán.",
            variant: "destructive",
          });
        }
      }
    };

    checkPaymentReturn();
  }, [searchParams, navigate, location.pathname, toast]);

  // Fetch all stations
  useEffect(() => {
    let cancelled = false;
    const loadStations = async () => {
      setLoadingStations(true);
      try {
        const data = await listStationsBrief();
        if (!cancelled) {
          setStations(data);
          // Default selection: vehicle's station if available, otherwise first station
          const defaultId = (vehicle as any)?.stationId || data[0]?.id || null;
          setSelectedStationId(typeof defaultId === "number" ? defaultId : null);
        }
      } catch (err) {
        console.error("Error loading stations:", err);
        if (!cancelled) {
          setStations([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingStations(false);
        }
      }
    };
    loadStations();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch identity sets when user is logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    
    let cancelled = false;
    const loadIdentitySets = async () => {
      setLoadingIdentitySets(true);
      try {
        const data = await listIdentitySets();
        if (!cancelled) {
          setIdentitySets(data);
          // Auto-select first identity set if available and none is selected
          if (data.length > 0 && selectedIdentitySetId === null) {
            setSelectedIdentitySetId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading identity sets:", err);
        if (!cancelled) {
          setIdentitySets([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingIdentitySets(false);
        }
      }
    };
    loadIdentitySets();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // Reset actual rental amount when dates change
  useEffect(() => {
    setActualRentalAmount(null);
  }, [startDate, endDate]);

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
        title: "Thanh toán thành công",
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
        <Footer />
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
        <Footer />
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

    // Many BE validators expect date-only strings (yyyy-MM-dd) for booking windows
    const toDateOnly = (date: Date) => format(date, "yyyy-MM-dd");
    if (!selectedIdentitySetId) {
      toast({
        title: "Vui lòng chọn giấy tờ",
        description: "Bạn cần chọn CCCD/GPLX để đặt xe.",
        variant: "destructive",
      });
      setIsBooking(false);
      return;
    }

    const payload = {
      modelId: vehicle.id,
      stationId: selectedStationId ?? (vehicle.stationId || 1),
      plannedStartDate: toDateOnly(startDate),
      plannedEndDate: toDateOnly(endDate),
      identitySetId: selectedIdentitySetId,
    };

    setIsBooking(true);
    try {
      const billing = await createBilling(payload);
      // Sử dụng giá từ backend nếu có, nếu không thì dùng giá tính toán từ frontend
      const effectiveRentalAmount = billing.totalCost ?? rentalAmount;
      const totalCharge = effectiveRentalAmount;
      
      // Lưu giá tiền thực tế để hiển thị trong UI
      setActualRentalAmount(effectiveRentalAmount);

      const storedEntry: StoredBooking = {
        ...billing,
        bookingId: billing.id,
        totalCost: billing.totalCost ?? effectiveRentalAmount,
        totalCharge,
        localVehicleName: vehicle.name,
        localVehicleImage: vehicle.image || vehicle.imageUrl || "",
      };

      appendBookingHistory(userId, storedEntry);

      // Ưu tiên sử dụng paymentInfo từ billing response (PayOS)
      if (billing.paymentInfo) {
        // Convert expiredAt from ISO string to epoch seconds if needed
        let expiredAt: number | undefined;
        if (billing.paymentInfo.expiredAt) {
          const date = new Date(billing.paymentInfo.expiredAt);
          expiredAt = isNaN(date.getTime()) ? undefined : Math.floor(date.getTime() / 1000);
        }
        
        const payOsData = {
          billingId: billing.id,
          payload: {
            paymentLinkId: billing.paymentInfo.paymentLinkId || undefined,
            orderCode: billing.paymentInfo.orderCode || undefined,
            amount: billing.paymentInfo.amount || totalCharge,
            description: billing.paymentInfo.description || undefined,
            status: billing.paymentInfo.status || undefined,
            checkoutUrl: billing.paymentInfo.checkoutUrl || undefined,
            qrCode: billing.paymentInfo.qrCode || undefined,
            currency: billing.paymentInfo.currency || undefined,
            expiredAt: expiredAt,
          } as PayOSPaymentLinkResponse,
          checkoutUrl: billing.paymentInfo.checkoutUrl || undefined,
          qrUrl: billing.paymentInfo.qrCode || undefined,
        };
        setPayOsPayment(payOsData);
      } else {
        // Fallback: Sử dụng VietQR với thông tin ngân hàng nếu không có PayOS
        try {
          const info = await createDemoPaymentInfo({
            billingId: billing.id,
            amount: totalCharge,
          });
          setPaymentInfo(info);
        } catch (demoErr) {
          console.error("Error creating demo payment info:", demoErr);
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
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Không tìm thấy xe</h1>
            <Button onClick={() => navigate("/")}>Quay về trang chủ</Button>
          </div>
        </div>
        <Footer />
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

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Vehicle Details */}
          <div className="lg:col-span-2 space-y-8">
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
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">
                <span className="border-b-2 border-green-500 pb-2">Đặc điểm</span>
              </h2>
              {(() => {
                const specs = getHardcodedSpecs(vehicle.name);
                const seats = specs?.seats ?? vehicle.features?.seats;
                const transmission = specs?.transmission ?? vehicle.features?.transmission;
                const fuel = specs?.fuel ?? vehicle.features?.fuel ?? "Điện";
                const consumption = specs?.consumption ?? vehicle.features?.consumption;
                return (
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 font-medium">
                      Số ghế
                    </span>
                    <p className="font-semibold text-gray-900">{seats} chỗ</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 font-medium">
                      Truyền động
                    </span>
                    <p className="font-semibold text-gray-900">{transmission}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Battery className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 font-medium">
                      Nhiên liệu
                    </span>
                    <p className="font-semibold text-gray-900">{fuel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 font-medium">
                      Tiêu hao
                    </span>
                    <p className="font-semibold text-gray-900">{consumption}</p>
                  </div>
                </div>
              </div>
                );
              })()}
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">
                <span className="border-b-2 border-green-500 pb-2">Mô tả</span>
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {(() => {
                  const specs = getHardcodedSpecs(vehicle.name);
                  const desc = specs?.description || vehicle.description;
                  return desc || "Thông tin mô tả chi tiết về xe sẽ được cập nhật sớm nhất.";
                })()}
              </p>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">
                <span className="border-b-2 border-green-500 pb-2">Vị trí xe</span>
              </h2>

              {loadingStations ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500">Đang tải danh sách trạm...</p>
                  </div>
                </div>
              ) : stations.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-gray-600">
                      Có <span className="font-semibold text-green-600">{stations.length}</span> trạm cho thuê
                    </p>
                  </div>
                  
                  <div className="relative">
                    <div
                      ref={scrollContainerRef}
                      className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-4"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {stations.map((station) => (
                        <div
                          key={station.id}
                          className="flex-shrink-0 w-[320px] p-5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900 mb-1">{station.name}</p>
                              <p className="text-sm text-gray-600 leading-relaxed">{station.address}</p>
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-9 text-sm border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
                            onClick={() => {
                              const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(station.address)}`;
                              window.open(mapUrl, '_blank');
                            }}
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            Xem bản đồ
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Scroll buttons */}
                    {stations.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg hover:bg-gray-50 z-10 h-10 w-10 border-gray-300"
                          onClick={() => {
                            if (scrollContainerRef.current) {
                              scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
                            }
                          }}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg hover:bg-gray-50 z-10 h-10 w-10 border-gray-300"
                          onClick={() => {
                            if (scrollContainerRef.current) {
                              scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
                            }
                          }}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-500">Chưa có thông tin trạm</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Pricing and Booking */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6 text-gray-900">
                <span className="border-b-2 border-green-500 pb-2">Giá thuê</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50">
                  <span className="text-sm text-gray-600">
                    Đơn giá thuê 1 ngày (24 giờ)
                  </span>
                  <span className="font-semibold text-green-700 text-lg">
                    {formatCurrency(pricePerDay)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50">
                  <span className="text-sm text-gray-600">
                    Số ngày tính phí
                  </span>
                  <span className="font-semibold text-green-700">
                    {chargeableDays > 0
                      ? `${chargeableDays} ngày`
                      : "Chưa xác định"}
                  </span>
                </div>
                <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Phí thuê được tính theo thời gian thực tế: đơn giá ngày × số
                    ngày (làm tròn lên đến 1 ngày nếu thời gian ≥ 8 giờ).
                  </p>
                </div>
              </div>
            </div>

            {/* Pickup option and Payment method removed per request */}

            {/* Rental Time */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <CalendarIcon className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  <span className="border-b-2 border-green-500 pb-2">Thời gian thuê</span>
                </h3>
                {rentalDurationDays > 0 && (
                  <Badge variant="outline" className="text-xs font-normal bg-green-50 text-green-700 border-green-200">
                    Ước tính: {rentalDurationDays} ngày
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-gray-600 font-medium">
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
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-gray-600 font-medium">
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

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 font-medium text-gray-600">
                        Ngày bắt đầu
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {startDate
                          ? format(startDate, "dd/MM/yyyy", { locale: vi })
                          : "Chưa chọn"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 font-medium text-gray-600">
                        Ngày kết thúc
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {endDate
                          ? format(endDate, "dd/MM/yyyy", { locale: vi })
                          : "Chưa chọn"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 font-medium text-gray-600">
                        Số ngày thuê
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {rentalDurationDays > 0
                          ? `${rentalDurationDays} ngày`
                          : "Chưa xác định"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-600">
                        Yêu cầu tối thiểu
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">≥ {minDurationDays} ngày</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs text-gray-600">
                  Bạn có thể đặt trước tối đa {maxAdvanceDays} ngày kể từ thời
                  điểm hiện tại.
                </p>
                {advanceLimitExceeded && (
                  <p className="text-xs text-red-600 mt-2">
                    Ngày bắt đầu vượt quá giới hạn đặt trước. Vui lòng chọn ngày
                    sớm hơn.
                  </p>
                )}
              </div>

              {/* Station selection */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <h4 className="text-base font-semibold text-gray-900">Chọn trạm nhận xe</h4>
                  {loadingStations && (
                    <span className="text-xs text-gray-500">Đang tải trạm…</span>
                  )}
                </div>

                <div className="grid gap-3">
                  <Select
                    value={selectedStationId != null ? String(selectedStationId) : undefined}
                    onValueChange={(v) => setSelectedStationId(Number(v))}
                    disabled={loadingStations || stations.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn trạm" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name} — {[s.district, s.city].filter(Boolean).join(", ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedStationId != null && (
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      {(() => {
                        const s = stations.find((x) => x.id === selectedStationId);
                        if (!s) return null;
                        return (
                          <div className="space-y-1 text-sm">
                            <div className="font-semibold text-gray-900">{s.name}</div>
                            <div className="text-gray-700">{s.address}</div>
                            <div className="text-gray-500">{[s.district, s.city].filter(Boolean).join(", ")}</div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {!loadingStations && stations.length === 0 && (
                    <div className="text-sm text-gray-500">Không có dữ liệu trạm.</div>
                  )}
                </div>
              </div>

              {/* Identity Set selection */}
              {isLoggedIn && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <IdCard className="w-5 h-5 text-green-600" />
                    <h4 className="text-base font-semibold text-gray-900">Chọn giấy tờ (CCCD/GPLX)</h4>
                    {loadingIdentitySets && (
                      <span className="text-xs text-gray-500">Đang tải…</span>
                    )}
                  </div>

                  <div className="grid gap-3">
                    <Select
                      value={selectedIdentitySetId != null ? String(selectedIdentitySetId) : undefined}
                      onValueChange={(v) => setSelectedIdentitySetId(Number(v))}
                      disabled={loadingIdentitySets || identitySets.length === 0}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn CCCD/GPLX" />
                      </SelectTrigger>
                      <SelectContent>
                        {identitySets.map((identitySet) => {
                          const statusText = identitySet.status === "PENDING" ? "Chờ duyệt" :
                                            identitySet.status === "APPROVED" ? "Đã duyệt" :
                                            identitySet.status === "REJECTED" ? "Từ chối" :
                                            identitySet.status || "";
                          const displayText = [
                            identitySet.cccdNumber && `CCCD: ${identitySet.cccdNumber}`,
                            identitySet.gplxNumber && `GPLX: ${identitySet.gplxNumber}`,
                            statusText && `(${statusText})`,
                          ]
                            .filter(Boolean)
                            .join(" - ") || `ID: ${identitySet.id}`;
                          
                          return (
                            <SelectItem key={identitySet.id} value={String(identitySet.id)}>
                              {displayText}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    {selectedIdentitySetId != null && (
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        {(() => {
                          const identitySet = identitySets.find((x) => x.id === selectedIdentitySetId);
                          if (!identitySet) return null;
                          return (
                            <div className="space-y-2 text-sm">
                              {identitySet.cccdNumber && (
                                <div>
                                  <span className="font-medium text-gray-600">CCCD: </span>
                                  <span className="text-gray-900">{identitySet.cccdNumber}</span>
                                </div>
                              )}
                              {identitySet.gplxNumber && (
                                <div>
                                  <span className="font-medium text-gray-600">GPLX: </span>
                                  <span className="text-gray-900">{identitySet.gplxNumber}</span>
                                </div>
                              )}
                              {identitySet.status && (
                                <div>
                                  <span className="font-medium text-gray-600">Trạng thái: </span>
                                  <Badge variant={identitySet.status === "APPROVED" ? "default" : "secondary"}>
                                    {identitySet.status === "PENDING" ? "Chờ duyệt" :
                                     identitySet.status === "APPROVED" ? "Đã duyệt" :
                                     identitySet.status === "REJECTED" ? "Từ chối" :
                                     identitySet.status}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {!loadingIdentitySets && identitySets.length === 0 && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm text-amber-800">
                          Bạn chưa có giấy tờ nào. Vui lòng{" "}
                          <Link to="/profile" className="underline font-medium">
                            cập nhật CCCD/GPLX trong hồ sơ
                          </Link>{" "}
                          trước khi đặt xe.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {startDate &&
                endDate &&
                (!isEndAfterStart || !isDurationValid) && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
                      <div className="space-y-1 text-sm text-amber-800">
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
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h4 className="font-semibold mb-4 text-gray-900">
                <span className="border-b-2 border-green-500 pb-2">Bảo hiểm thuê xe</span>
              </h4>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Chuyến đi có mua bảo hiểm. Khách thuê bồi thường tối đa{" "}
                  <span className="font-semibold text-red-600">
                    2.000.000 VNĐ
                  </span>{" "}
                  trong trường hợp có sự cố ngoài ý muốn.
                </p>
                <button
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                  onClick={() => setShowInsuranceModal(true)}
                >
                  Xem thêm chi tiết →
                </button>
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
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-semibold mb-6 text-gray-900">
                <span className="border-b-2 border-green-500 pb-2">Tổng thanh toán</span>
              </h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 px-4 rounded-lg bg-white border border-green-200">
                  <span className="text-gray-600 font-medium">Tiền thuê dự kiến</span>
                  <span className="font-bold text-green-800 text-lg">
                    {actualRentalAmount !== null
                      ? formatCurrency(actualRentalAmount)
                      : rentalAmount > 0
                      ? formatCurrency(rentalAmount)
                      : "Chọn thời gian"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-4 px-4 rounded-lg bg-green-200 border-2 border-green-300">
                  <span className="text-lg font-semibold text-gray-900">Tổng thanh toán ban đầu</span>
                  <span className="text-xl font-bold text-green-900">
                    {actualRentalAmount !== null
                      ? formatCurrency(actualRentalAmount)
                      : formatCurrency(totalPayable)}
                  </span>
                </div>
              </div>

              {advanceLimitExceeded && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">
                    Ngày bắt đầu thuê không được vượt quá {maxAdvanceDays} ngày so
                    với hiện tại.
                  </p>
                </div>
              )}

              {!isVehicleAvailable && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">
                    Xe hiện không khả dụng để đặt. Vui lòng chọn xe khác hoặc quay
                    lại sau.
                  </p>
                </div>
              )}

              <Button
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
                {isBooking ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xử lý...
                  </div>
                ) : (
                  "Thanh toán ngay"
                )}
              </Button>
              
              <p className="text-xs text-gray-600 mt-3 text-center">
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
            <DialogTitle>Thanh toán VietQR</DialogTitle>
            <DialogDescription>
              Mã hóa đơn #{paymentInfo?.billingId ?? ""}. Chuyển khoản vào tài khoản bên dưới hoặc scan QR code để hoàn tất thanh toán.
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
                  Scan QR code bằng ứng dụng ngân hàng để chuyển khoản tự động điền thông tin.
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
                    variant="ghost"
                    className="flex-1"
                    onClick={() => {
                      setPaymentInfo(null);
                      navigate("/bookings?tab=waiting");
                    }}
                  >
                    Đóng
                  </Button>
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => {
                      setPaymentInfo(null);
                      navigate("/bookings?tab=payed");
                    }}
                  >
                    Tôi đã thanh toán
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

      <Footer />
    </div>
  );
};

export default VehicleDetailsPage;
