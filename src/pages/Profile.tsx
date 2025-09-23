import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, ShieldCheck } from "lucide-react";
import Navbar from "../components/heroUi/Navbar";
import { getCurrentUser, LoginResponse } from "@/services/authService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Profile = () => {
  const [profile, setProfile] = useState<LoginResponse | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // State cho modal cập nhật
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setProfile(user);
      setIsLoggedIn(true);
      setEditName(user.full_name || user.username);
      setEditEmail(user.email || "");
      setEditPhone("Chưa cập nhật");
    }
  }, []);

  const handleUpdate = () => {
    if (!profile) return;
    const updatedUser = {
      ...profile,
      full_name: editName,
      email: editEmail,
      phone: editPhone,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setProfile(updatedUser);
    alert("✅ Cập nhật thành công (mock). Sau này sẽ gọi API update profile.");
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar isLoggedIn={isLoggedIn} username="" />
        <div className="flex-1 flex items-center justify-center">
          <p>Bạn chưa đăng nhập</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary/20 to-accent/20">
      {/* Navbar */}
      <Navbar isLoggedIn={isLoggedIn} username={profile.username} />

      {/* Nội dung */}
      <div className="container mx-auto px-4 py-12 flex-1">
        <h1 className="text-3xl font-bold mb-8 text-center">Hồ sơ cá nhân</h1>

        <Card className="max-w-lg mx-auto shadow-lg border rounded-xl">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src="" />
              <AvatarFallback>
                {getInitials(profile.full_name || profile.username)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl font-bold">
              {profile.full_name || profile.username}
            </CardTitle>
            <p className="text-muted-foreground">
              Trạng thái: {profile.status || "Không xác định"}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{profile.username || "Chưa có"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{profile.email || "Chưa cập nhật"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{editPhone}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>
                {profile.is_active ? "Đang hoạt động" : "Ngưng hoạt động"}
              </span>
            </div>

            {/* Nút cập nhật mở modal */}
            <div className="pt-6 flex justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="px-6">✏️ Cập nhật thông tin</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cập nhật thông tin</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Họ tên</Label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Số điện thoại</Label>
                      <Input
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditName(profile.full_name || profile.username);
                          setEditEmail(profile.email || "");
                          setEditPhone("Chưa cập nhật");
                        }}
                      >
                        Hủy
                      </Button>
                      <Button onClick={handleUpdate}>Lưu</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
