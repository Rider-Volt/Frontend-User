import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Loader2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { staffLogin } from "@/services/authService";

const StaffLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const staff = await staffLogin(email, password);
      toast({ title: "Đăng nhập nhân viên thành công", description: `Xin chào ${staff.staffName}` });
      // Điều hướng vào trang staff: ưu tiên vehicles
      navigate("/StationStaff/vehicles", { replace: true });
    } catch (error: any) {
      toast({ title: "Đăng nhập thất bại", description: error?.message || "Sai email hoặc mật khẩu", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-electric-gradient p-3 rounded-xl">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold bg-electric-gradient bg-clip-text text-transparent">
              EV Rental • Staff
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Đăng nhập nhân viên</h1>
          <p className="text-muted-foreground">Dành cho nhân viên trạm</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input id="email" type="email" placeholder="Nhập email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div>
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input id="password" type="password" placeholder="Nhập mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang đăng nhập...</>) : ("Đăng nhập")}
              </Button>
            </form>
            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Liên hệ quản trị nếu chưa có tài khoản</span>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              <Link to="/login" className="text-primary hover:underline">Đăng nhập khách thuê</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffLogin;
