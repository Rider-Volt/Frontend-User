import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Star, Home, Car, IdCard, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/heroUi/Navbar"; // ✅ thêm Navbar
import { getCurrentUser, refreshCurrentUser, updateUser, LoginResponse } from "@/services/authService";

const Profile = () => {
  const [profile, setProfile] = useState<LoginResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Ảnh giấy tờ
  const [nationalIdImageFile, setNationalIdImageFile] = useState<File | null>(null);
  const [nationalIdImagePreview, setNationalIdImagePreview] = useState<string | null>(null);
  const nationalIdInputRef = useRef<HTMLInputElement | null>(null);

  const [driverLicenseImageFile, setDriverLicenseImageFile] = useState<File | null>(null);
  const [driverLicenseImagePreview, setDriverLicenseImagePreview] = useState<string | null>(null);
  const driverLicenseInputRef = useRef<HTMLInputElement | null>(null);
  const [nationalIdImageError, setNationalIdImageError] = useState(false);
  const [driverLicenseImageError, setDriverLicenseImageError] = useState(false);

  const [editData, setEditData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
  });

  const clearAvatarSelection = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const clearNationalIdSelection = () => {
    if (nationalIdImagePreview) URL.revokeObjectURL(nationalIdImagePreview);
    setNationalIdImageFile(null);
    setNationalIdImagePreview(null);
    if (nationalIdInputRef.current) nationalIdInputRef.current.value = "";
    setNationalIdImageError(false);
  };

  const clearDriverLicenseSelection = () => {
    if (driverLicenseImagePreview) URL.revokeObjectURL(driverLicenseImagePreview);
    setDriverLicenseImageFile(null);
    setDriverLicenseImagePreview(null);
    if (driverLicenseInputRef.current) driverLicenseInputRef.current.value = "";
    setDriverLicenseImageError(false);
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      clearAvatarSelection();
      return;
    }
    setAvatarFile(file);
    setAvatarPreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return URL.createObjectURL(file);
    });
  };

  const handleNationalIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return clearNationalIdSelection();
    setNationalIdImageFile(file);
    setNationalIdImageError(false);
    setNationalIdImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleDriverLicenseChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return clearDriverLicenseSelection();
    setDriverLicenseImageFile(file);
    setDriverLicenseImageError(false);
    setDriverLicenseImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

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
      });
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const refreshed = await refreshCurrentUser();
        if (!active) return;
        setProfile(refreshed);
        setEditData({
          full_name: refreshed.full_name || refreshed.username,
          email: refreshed.email || "",
          phone: refreshed.phone || "",
          address: refreshed.address || "",
        });
      } catch (err) {
        console.warn("Không thể đồng bộ hồ sơ từ máy chủ", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(
    () => () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      if (nationalIdImagePreview) URL.revokeObjectURL(nationalIdImagePreview);
      if (driverLicenseImagePreview) URL.revokeObjectURL(driverLicenseImagePreview);
    },
    [avatarPreview, nationalIdImagePreview, driverLicenseImagePreview]
  );

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
        avatarFile,
        nationalIdImageFile,
        driverLicenseImageFile,
      });
      setProfile(updated);
      setEditData({
        full_name: updated.full_name || updated.username,
        email: updated.email || "",
        phone: updated.phone || "",
        address: updated.address || "",
      });
      setIsEditing(false);
      clearAvatarSelection();
      clearNationalIdSelection();
      clearDriverLicenseSelection();
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
    });
    clearAvatarSelection();
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
                    <AvatarImage src={avatarPreview || profile.avatar || ""} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(profile.full_name || profile.username)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">
                  {profile.full_name || profile.username}
                </CardTitle>
                {profile.joinDate && (
                  <p className="text-muted-foreground">Thành viên từ {joinDateText}</p>
                )}
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
                      {(profile.totalSpent ?? 0) > 0 ? `${(profile.totalSpent ?? 0).toLocaleString('vi-VN')}đ` : '—'}
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
                  {!isEditing && (
                    <Button
                      variant="electric"
                      onClick={() => setIsEditing(true)}
                      disabled={saving}
                    >
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={!isEditing || saving}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={!isEditing || saving}
                    >
                      Chọn ảnh đại diện
                    </Button>
                    {avatarFile && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={clearAvatarSelection}
                        disabled={saving}
                      >
                        Bỏ chọn
                      </Button>
                    )}
                  </div>
                  {avatarFile && (
                    <p className="text-xs text-muted-foreground">
                      Ảnh mới sẽ hiển thị sau khi bạn lưu thay đổi.
                    </p>
                  )}
                </div>

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
                  {/* Bỏ trường số GPLX theo yêu cầu */}
                </div>

                {/* Ảnh giấy tờ (CCCD & GPLX) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Ảnh CCCD</Label>
                    <input
                      ref={nationalIdInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={handleNationalIdChange}
                      disabled={!isEditing || saving}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => nationalIdInputRef.current?.click()}
                        disabled={!isEditing || saving}
                      >
                        <IdCard className="w-4 h-4 mr-1" /> Chọn ảnh
                      </Button>
                      {nationalIdImageFile && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={clearNationalIdSelection}
                          disabled={saving}
                        >
                          Bỏ chọn
                        </Button>
                      )}
                    </div>
                    <div className="border rounded p-2 bg-muted/30 flex items-center justify-center min-h-[140px]">
                      {(nationalIdImagePreview || (profile.nationalIdImageUrl && !nationalIdImageError)) ? (
                        <img
                          src={nationalIdImagePreview || profile.nationalIdImageUrl!}
                          alt="Ảnh CCCD"
                          className="max-h-52 object-contain rounded"
                          onError={() => setNationalIdImageError(true)}
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" /> Chưa có ảnh CCCD
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Ảnh GPLX</Label>
                    <input
                      ref={driverLicenseInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={handleDriverLicenseChange}
                      disabled={!isEditing || saving}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => driverLicenseInputRef.current?.click()}
                        disabled={!isEditing || saving}
                      >
                        <Car className="w-4 h-4 mr-1" /> Chọn ảnh
                      </Button>
                      {driverLicenseImageFile && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={clearDriverLicenseSelection}
                          disabled={saving}
                        >
                          Bỏ chọn
                        </Button>
                      )}
                    </div>
                    <div className="border rounded p-2 bg-muted/30 flex items-center justify-center min-h-[140px]">
                      {(driverLicenseImagePreview || (profile.driverLicenseImageUrl && !driverLicenseImageError)) ? (
                        <img
                          src={driverLicenseImagePreview || profile.driverLicenseImageUrl!}
                          alt="Ảnh GPLX"
                          className="max-h-52 object-contain rounded"
                          onError={() => setDriverLicenseImageError(true)}
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" /> Chưa có ảnh GPLX
                        </div>
                      )}
                    </div>
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
