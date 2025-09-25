import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Star, Home, Car } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/heroUi/Navbar"; // ✅ thêm Navbar
import {
  getCurrentUser,
  fetchProfileFromAPI,
  updateUser,
  LoginResponse,
} from "@/services/authService";

const Profile = () => {
  const [profile, setProfile] = useState<LoginResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [editData, setEditData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    licenseNumber: "",
  });

  // Load nhanh từ localStorage
  useEffect(() => {
    const local = getCurrentUser();
    if (local) {
      setProfile(local);
      setEditData({
        full_name: local.full_name || local.username,
        email: local.email || "",
        phone: local.phone || "",
        address: local.address || "",
        licenseNumber: local.licenseNumber || "",
      });
    }
  }, []);

  // Refresh từ API
  useEffect(() => {
    const run = async () => {
      try {
        const fresh = await fetchProfileFromAPI();
        setProfile(fresh);
        setEditData({
          full_name: fresh.full_name || fresh.username,
          email: fresh.email || "",
          phone: fresh.phone || "",
          address: fresh.address || "",
          licenseNumber: fresh.licenseNumber || "",
        });
      } catch (e) {
        console.warn("Không làm mới hồ sơ từ API:", e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const getInitials = (name: string) =>
    name.trim().split(/\s+/).map((n) => n[0]).join("").toUpperCase() || "U";

  const joinDateText = useMemo(() => {
    if (!profile?.joinDate) return "—";
    try {
      return new Date(profile.joinDate).toLocaleDateString("vi-VN");
    } catch {
      return String(profile.joinDate);
    }
  }, [profile?.joinDate]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await updateUser({
        full_name: editData.full_name,
        email: editData.email,
        phone: editData.phone,
        address: editData.address,
        licenseNumber: editData.licenseNumber,
      });
      setProfile(updated);
      setIsEditing(false);
      alert("✅ Cập nhật thành công");
    } catch (err: any) {
      alert(err?.message || "❌ Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!profile) return;
    setEditData({
      full_name: profile.full_name || profile.username,
      email: profile.email || "",
      phone: profile.phone || "",
      address: profile.address || "",
      licenseNumber: profile.licenseNumber || "",
    });
    setIsEditing(false);
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar isLoggedIn={false} username="" />
        <div className="flex-1 flex items-center justify-center">
          <p>Đang tải hồ sơ…</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar isLoggedIn={false} username="" />
        <div className="flex-1 flex items-center justify-center">
          <p>Bạn chưa đăng nhập</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ✅ Navbar */}
      <Navbar isLoggedIn={!!profile} username={profile.full_name || profile.username} />

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Hồ sơ cá nhân</h1>
              <p className="text-muted-foreground">
                Quản lý thông tin cá nhân và tài khoản của bạn
              </p>
            </div>
            <Link to="/">
              <Button variant="electric" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Về trang chủ
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.avatar || ""} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(profile.full_name || profile.username)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">
                  {profile.full_name || profile.username}
                </CardTitle>
                <p className="text-muted-foreground">
                  Thành viên từ {joinDateText}
                </p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{profile.rating ?? 5}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {profile.totalBookings ?? 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Đặt xe</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {((profile.totalSpent ?? 0) / 1_000_000).toFixed(1)}M
                    </p>
                    <p className="text-sm text-muted-foreground">Đã chi</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">ID: {profile.id || profile.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{profile.address || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      GPLX: {profile.licenseNumber || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Thông tin cá nhân</CardTitle>
                  <Button
                    variant={isEditing ? "outline" : "electric"}
                    onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                    disabled={saving}
                  >
                    {isEditing ? (saving ? "Đang lưu..." : "Lưu") : "Chỉnh sửa"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input
                      id="name"
                      value={editData.full_name}
                      onChange={(e) =>
                        setEditData({ ...editData, full_name: e.target.value })
                      }
                      disabled={!isEditing || saving}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                      disabled={!isEditing || saving}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      value={editData.phone}
                      onChange={(e) =>
                        setEditData({ ...editData, phone: e.target.value })
                      }
                      disabled={!isEditing || saving}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                      id="address"
                      value={editData.address}
                      onChange={(e) =>
                        setEditData({ ...editData, address: e.target.value })
                      }
                      disabled={!isEditing || saving}
                    />
                  </div>
                  <div>
                    <Label htmlFor="license">Số GPLX</Label>
                    <Input
                      id="license"
                      value={editData.licenseNumber}
                      onChange={(e) =>
                        setEditData({ ...editData, licenseNumber: e.target.value })
                      }
                      disabled={!isEditing || saving}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={saving}>
                      Hủy
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
