import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Loader2, Car, Eye, EyeOff, CheckCircle, Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { resetPassword } from "@/services/authService";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validation
      if (!email.trim()) {
        setError("Vui lòng nhập email");
        setIsLoading(false);
        return;
      }
      
      if (!newPassword.trim()) {
        setError("Vui lòng nhập mật khẩu mới");
        setIsLoading(false);
        return;
      }
      
      if (!confirmPassword.trim()) {
        setError("Vui lòng xác nhận mật khẩu");
        setIsLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự");
        setIsLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("Mật khẩu xác nhận không khớp");
        setIsLoading(false);
        return;
      }

      await resetPassword({
        email: email.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
        passwordMatching: newPassword === confirmPassword,
      });

      toast({
        title: "Đặt lại mật khẩu thành công",
        description: "Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại.",
      });

      // Redirect to login after 1 second
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error: any) {
      setError(error?.message || "Không thể đặt lại mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Bên trái - Form đặt lại mật khẩu */}
      <div className="flex-1 bg-slate-900 relative overflow-hidden">
        {/* Các hình tròn trang trí tạo hiệu ứng background */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-emerald-400/30 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-emerald-600/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-emerald-500/25 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex items-center justify-center h-full p-8">
          <div className="w-full max-w-xl">
            {/* Logo và tên hệ thống */}
            <div className="flex items-center gap-4 mb-12">
              <div className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Car className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">EV Station</h1>
                <p className="text-emerald-400 text-lg">Management System</p>
              </div>
            </div>

            {/* Form đặt lại mật khẩu */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 w-[600px]">
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-white mb-3">Đặt lại mật khẩu</h2>
                <p className="text-slate-400 text-base">Nhập email và mật khẩu mới của bạn</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                    <AlertDescription className="text-red-300">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập email của bạn"
                        disabled={isLoading}
                        className="pl-12 h-14 bg-slate-700/50 border-slate-600 text-white text-lg placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword" className="text-slate-300 text-sm font-medium">
                      Mật khẩu mới
                    </Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nhập mật khẩu mới"
                        disabled={isLoading}
                        className="pl-12 pr-12 h-14 bg-slate-700/50 border-slate-600 text-white text-lg placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        disabled={isLoading}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-slate-300 text-sm font-medium">
                      Xác nhận mật khẩu
                    </Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        disabled={isLoading}
                        className="pl-12 pr-12 h-14 bg-slate-700/50 border-slate-600 text-white text-lg placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Đặt lại mật khẩu'
                  )}
                </Button>
              </form>

              <div className="flex justify-between items-center mt-6 text-sm">
                <Link
                  to="/login"
                  className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại đăng nhập
                </Link>
                <Link to="/register" className="text-emerald-400 hover:text-emerald-300 hover:underline">
                  Đăng ký ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bên phải - Nội dung giới thiệu hệ thống */}
      <div className="flex-1 bg-slate-50 relative overflow-hidden">
        {/* Các hình tròn trang trí cho phần bên phải */}
        <div className="absolute top-16 right-16 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl"></div>
        <div className="absolute top-32 left-20 w-32 h-32 bg-emerald-400/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-24 right-32 w-36 h-36 bg-emerald-600/25 rounded-full blur-2xl"></div>
        <div className="absolute bottom-16 left-16 w-28 h-28 bg-emerald-500/30 rounded-full blur-lg"></div>
        
        <div className="relative z-10 flex flex-col justify-center h-full p-12">
          <div className="max-w-lg">
            {/* Tiêu đề chính */}
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-slate-900 mb-4">EV STATION</h1>
              <p className="text-2xl text-emerald-600 font-semibold">Reset Password</p>
            </div>

            {/* Mô tả về hệ thống */}
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Đặt lại mật khẩu của bạn để tiếp tục sử dụng dịch vụ. 
              Vui lòng nhập email và mật khẩu mới để hoàn tất quá trình.
            </p>

            {/* Danh sách các lưu ý */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                 <span className="text-slate-700 font-medium">Mật khẩu phải có ít nhất 6 ký tự</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-slate-700 font-medium">Mật khẩu xác nhận phải khớp với mật khẩu mới</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-slate-700 font-medium">OTP đang tắt trong môi trường phát triển</span>
              </div>
            </div>
          </div>

          {/* Logo ở góc dưới bên phải */}
          <div className="absolute bottom-8 right-8">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

