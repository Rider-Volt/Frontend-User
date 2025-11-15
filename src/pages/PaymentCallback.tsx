import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { CheckCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/heroUi/Navbar";
import { processPaymentSuccess, processPaymentCancel } from "@/services/paymentService";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/services/authService";

const PaymentCallback = () => {
  const { orderId } = useParams<{ orderId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const doHandle = async () => {
      if (!orderId) {
        setError("Không tìm thấy orderId trong đường dẫn");
        setProcessing(false);
        return;
      }

      const id = Number(orderId.replace(/[^0-9]/g, ""));
      if (!Number.isFinite(id) || id <= 0) {
        setError("orderId không hợp lệ");
        setProcessing(false);
        return;
      }

      // Determine if route is cancel or success by pathname
      const isCancel = location.pathname.toLowerCase().includes("/cancel/");

      try {
        if (isCancel) {
          await processPaymentCancel(id);
          setError("Thanh toán bị hủy");
          toast({ title: "Thanh toán bị hủy", description: "Bạn đã hủy thanh toán." });
        } else {
          await processPaymentSuccess(id);
          setSuccess(true);
          toast({ title: "Thanh toán thành công!", description: "Đơn đặt xe của bạn đã được xác nhận." });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Không thể xử lý callback thanh toán";
        setError(message);
        toast({ title: "Lỗi xử lý thanh toán", description: message, variant: "destructive" });
      } finally {
        setProcessing(false);
      }
    };

    doHandle();
  }, [orderId, location.pathname, navigate, toast]);

  const user = getCurrentUser();
  const username = user?.full_name || user?.username || "Người dùng";

  if (processing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
        <Navbar isLoggedIn={!!user} username={username} />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Đang xử lý callback thanh toán...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
        <Navbar isLoggedIn={!!user} username={username} />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-red-600">✕</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Kết quả thanh toán</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => navigate("/bookings")} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại lịch sử đặt xe
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <Navbar isLoggedIn={!!user} username={username} />
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="max-w-md w-full shadow-lg">
          <CardContent className="py-12 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Chúc mừng!</h1>
            <h2 className="text-xl font-semibold text-emerald-600 mb-4">Bạn đã thuê xe thành công</h2>
            <p className="text-gray-600 mb-8">Thanh toán của bạn đã được xác nhận. Đơn đặt xe đang chờ nhân viên phê duyệt.</p>
            <div className="space-y-3">
              <Button onClick={() => navigate("/bookings")} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" size="lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Xem lịch sử đặt xe
              </Button>
              <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Về trang chủ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentCallback;
