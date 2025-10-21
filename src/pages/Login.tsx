import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Loader2, Car } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/services/authService";
import RecaptchaV2 from "@/components/RecaptchaV2";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
      const canSkipCaptcha = (import.meta as any).env?.DEV && !siteKey;
      if (!recaptchaToken && !canSkipCaptcha) {
        toast({
          title: "Vui lòng xác minh reCAPTCHA",
          description: "Hãy tích vào ô Tôi không phải người máy",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      await login(email, password, recaptchaToken || undefined);

      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn đến với EV Rental!",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Đăng nhập thất bại",
        description: error?.message || "Sai email hoặc mật khẩu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo + heading */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-electric-gradient p-3 rounded-xl">
              <Car className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold bg-electric-gradient bg-clip-text text-transparent">
              EV Rental
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Chào mừng trở lại</h1>
          <p className="text-muted-foreground">
            Đăng nhập để tiếp tục sử dụng dịch vụ
          </p>
        </div>

        {/* Card */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* reCAPTCHA v2 Checkbox */}
              <div className="flex justify-center">
                <RecaptchaV2 onVerify={setRecaptchaToken} />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={(() => {
                  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
                  const canSkipCaptcha = (import.meta as any).env?.DEV && !siteKey;
                  return isLoading || (!recaptchaToken && !canSkipCaptcha);
                })()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>

            <div className="flex justify-between items-center mt-4 text-sm">
              <Link
                to="/forgot-password"
                className="text-primary hover:underline"
              >
                Quên mật khẩu?
              </Link>
              <Link to="/register" className="text-primary hover:underline">
                Đăng ký ngay
              </Link>
            </div>

            {/* Separator */}
            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Hoặc
                </span>
              </div>
            </div>

            {/* Social login */}
            <div className="mt-6 flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <FcGoogle className="w-5 h-5" />
                Đăng nhập với Google
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-blue-600"
              >
                <FaFacebook className="w-5 h-5" />
                Đăng nhập với Facebook
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
