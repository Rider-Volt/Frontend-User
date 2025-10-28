import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Star, Home, Car, IdCard, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/heroUi/Navbar";
import Footer from "../components/heroUi/Footer";
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
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar isLoggedIn={false} username="" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Đang tải hồ sơ…</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar isLoggedIn={false} username="" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Bạn chưa đăng nhập</p>
            <Link to="/login">
              <Button className="bg-green-600 hover:bg-green-700">
                Đăng nhập ngay
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ✅ Navbar */}
      <Navbar isLoggedIn={!!profile} username={profile.full_name || profile.username} />

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">Hồ sơ cá nhân</h1>
              <p className="text-gray-600">
                Quản lý thông tin cá nhân và tài khoản của bạn
              </p>
            </div>
            <Link to="/">
              <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200">
                <Home className="w-4 h-4" />
                Về trang chủ
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-green-100">
                      <AvatarImage src={avatarPreview || profile.avatar || ""} />
                      <AvatarFallback className="text-2xl bg-green-100 text-green-700 font-semibold">
                        {getInitials(profile.full_name || profile.username)}
                      </AvatarFallback>
                    </Avatar>
                    {profile.rating && (
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 fill-white text-white" />
                      </div>
                    )}
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {profile.full_name || profile.username}
                </h2>
                
                {profile.joinDate && (
                  <p className="text-gray-500 text-sm mb-4">Thành viên từ {joinDateText}</p>
                )}
                
                {profile.rating && (
                  <div className="flex items-center justify-center gap-1 mb-6">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">{profile.rating}</span>
                    <span className="text-gray-500 text-sm">đánh giá</span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-2xl font-bold text-green-700">
                      {profile.totalBookings ?? 0}
                    </p>
                    <p className="text-sm text-green-600 font-medium">Đặt xe</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-lg font-bold text-blue-700">
                      {(profile.totalSpent ?? 0) > 0 ? `${(profile.totalSpent ?? 0).toLocaleString('vi-VN')}đ` : '—'}
                    </p>
                    <p className="text-sm text-blue-600 font-medium">Đã chi</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">ID người dùng</p>
                      <p className="text-sm font-semibold text-gray-900">{profile.id || profile.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Địa chỉ</p>
                      <p className="text-sm font-semibold text-gray-900">{profile.address || "Chưa cập nhật"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  <span className="border-b-2 border-green-500 pb-2">Thông tin cá nhân</span>
                </h3>
                {!isEditing && (
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={() => setIsEditing(true)}
                    disabled={saving}
                  >
                    Chỉnh sửa
                  </Button>
                )}
              </div>
              
              <div className="space-y-6">
                {/* Avatar Upload */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Ảnh đại diện</Label>
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
                      className="border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Chọn ảnh đại diện
                    </Button>
                    {avatarFile && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={clearAvatarSelection}
                        disabled={saving}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Bỏ chọn
                      </Button>
                    )}
                  </div>
                  {avatarFile && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ Ảnh mới sẽ hiển thị sau khi bạn lưu thay đổi.
                    </p>
                  )}
                </div>

                {/* Personal Information Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Họ và tên</Label>
                    <Input
                      id="name"
                      value={editData.full_name}
                      onChange={(e) =>
                        setEditData({ ...editData, full_name: e.target.value })
                      }
                      disabled={!isEditing || saving}
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                      disabled={!isEditing || saving}
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Số điện thoại</Label>
                    <Input
                      id="phone"
                      value={editData.phone}
                      onChange={(e) =>
                        setEditData({ ...editData, phone: e.target.value })
                      }
                      disabled={!isEditing || saving}
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700">Địa chỉ</Label>
                    <Input
                      id="address"
                      value={editData.address}
                      onChange={(e) =>
                        setEditData({ ...editData, address: e.target.value })
                      }
                      disabled={!isEditing || saving}
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Document Uploads */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900">
                    <span className="border-b-2 border-green-500 pb-2">Ảnh giấy tờ</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CCCD Upload */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">Ảnh CCCD</Label>
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
                          className="border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                        >
                          <IdCard className="w-4 h-4 mr-2" />
                          Chọn ảnh
                        </Button>
                        {nationalIdImageFile && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={clearNationalIdSelection}
                            disabled={saving}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Bỏ chọn
                          </Button>
                        )}
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 flex items-center justify-center min-h-[160px] hover:border-green-400 transition-colors">
                        {(nationalIdImagePreview || (profile.nationalIdImageUrl && !nationalIdImageError)) ? (
                          <img
                            src={nationalIdImagePreview || profile.nationalIdImageUrl!}
                            alt="Ảnh CCCD"
                            className="max-h-48 object-contain rounded shadow-sm"
                            onError={() => setNationalIdImageError(true)}
                          />
                        ) : (
                          <div className="text-center text-gray-500">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">Chưa có ảnh CCCD</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Driver License Upload */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">Ảnh GPLX</Label>
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
                          className="border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                        >
                          <Car className="w-4 h-4 mr-2" />
                          Chọn ảnh
                        </Button>
                        {driverLicenseImageFile && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={clearDriverLicenseSelection}
                            disabled={saving}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Bỏ chọn
                          </Button>
                        )}
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 flex items-center justify-center min-h-[160px] hover:border-green-400 transition-colors">
                        {(driverLicenseImagePreview || (profile.driverLicenseImageUrl && !driverLicenseImageError)) ? (
                          <img
                            src={driverLicenseImagePreview || profile.driverLicenseImageUrl!}
                            alt="Ảnh GPLX"
                            className="max-h-48 object-contain rounded shadow-sm"
                            onError={() => setDriverLicenseImageError(true)}
                          />
                        ) : (
                          <div className="text-center text-gray-500">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">Chưa có ảnh GPLX</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <Button 
                      onClick={handleSave} 
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {saving ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Đang lưu...
                        </div>
                      ) : (
                        "Lưu thay đổi"
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancel} 
                      disabled={saving}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2"
                    >
                      Hủy
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
