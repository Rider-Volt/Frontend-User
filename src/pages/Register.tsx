import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Mail, Lock, Eye, EyeOff, User, Phone, Loader2 } from "lucide-react";
import RecaptchaV2 from "@/components/RecaptchaV2";
import { register as registerApi } from "@/services/authService";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const navigate = useNavigate();
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
  const canSkipCaptcha =
    (import.meta as any).env?.DEV && (!siteKey || siteKey.length === 0);
  const isSubmitDisabled = loading || (!recaptchaToken && !canSkipCaptcha);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return "Vui lòng nhập họ và tên";
    if (!/\S+@\S+\.\S+/.test(formData.email)) return "Email không hợp lệ";
    if (!/^[0-9]{9,11}$/.test(formData.phone)) return "Số điện thoại không hợp lệ";
    if (formData.password.length < 8) return "Mật khẩu phải ít nhất 8 ký tự";
    if (formData.password !== formData.confirmPassword)
      return "Mật khẩu xác nhận không khớp";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) {
      alert(errorMsg);
      return;
    }

    setLoading(true);
    try {
      if (!recaptchaToken && !canSkipCaptcha) {
        alert("Vui lòng xác minh reCAPTCHA");
        return;
      }

      await registerApi({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        recaptchaToken:
          recaptchaToken || (canSkipCaptcha ? "dev-bypass" : ""),
      });

      alert("Đăng ký thành công!");
      navigate("/login");
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      const message =
        error instanceof Error ? error.message : "Không thể kết nối đến server!";
      alert(`Đăng ký thất bại: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Bên trái - Form đăng ký */}
      <div className="flex-1 bg-slate-900 relative overflow-hidden">
        {/* Các hình tròn trang trí tạo hiệu ứng background */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-emerald-400/30 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-emerald-600/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-emerald-500/25 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex items-center justify-center h-full p-8">
          <div className="w-full max-w-md">
            {/* Logo và tên hệ thống */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="bg-electric-gradient p-3 rounded-xl">
                  <Car className="w-8 h-8 text-white" />
                </div>
                <span className="text-2xl font-bold bg-electric-gradient bg-clip-text text-transparent">
                  EV Rental
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2 text-white">Tạo tài khoản mới</h1>
              <p className="text-slate-400">
                Đăng ký để trải nghiệm dịch vụ thuê xe điện tốt nhất
              </p>
            </div>

            {/* Card */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Họ và tên */}
                  <div>
                    <Label htmlFor="fullName" className="text-slate-300">Họ và tên</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Nhập họ và tên"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Nhập email của bạn"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone" className="text-slate-300">Số điện thoại</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Nhập số điện thoại"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <Label htmlFor="password" className="text-slate-300">Mật khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <Label htmlFor="confirmPassword" className="text-slate-300">Xác nhận mật khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Nhập lại mật khẩu"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <RecaptchaV2 onVerify={setRecaptchaToken} />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition-colors"
                    disabled={isSubmitDisabled}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Đăng ký"
                    )}
                  </Button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-400">
                    Đã có tài khoản?{" "}
                    <Link
                      to="/login"
                      className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                    >
                      Đăng nhập ngay
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
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
              <p className="text-2xl text-emerald-600 font-semibold">Electric Portal</p>
            </div>

            {/* Mô tả về hệ thống */}
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
            Nền tảng phân phối và quản lý xe điện thông minh. 
            Hướng đến xây dựng hệ sinh thái giao thông xanh -hiện đại -bền vững.
            </p>

            {/* Danh sách các tính năng chính */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-slate-700 font-medium">Đăng ký tài khoản dễ dàng</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="text-slate-700 font-medium">Xác thực email an toàn</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <span className="text-slate-700 font-medium">Hỗ trợ khách hàng 24/7</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <span className="text-slate-700 font-medium">Bảo mật thông tin cá nhân</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
