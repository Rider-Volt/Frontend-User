import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, Home, Car, IdCard, Image as ImageIcon } from "lucide-react";
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

      <div className="container mx-auto max-w-6xl px-4 py-8 flex-1">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Quản lý thông tin cá nhân và tài khoản của bạn
              </p>
            </div>
            <Link to="/">
              <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200">
                <Home className="w-4 h-4" />
                Về trang chủ
              </Button>
            </Link>
          </div>

          {/* Account overview */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex flex-col items-center lg:items-center gap-4 w-full lg:w-56">
                <div className="relative">
                  <Avatar className="w-28 h-28 border-4 border-green-100">
                    <AvatarImage src={avatarPreview || profile.avatar || ""} />
                    <AvatarFallback className="text-3xl bg-green-100 text-green-700 font-semibold">
                      {getInitials(profile.full_name || profile.username)}
                    </AvatarFallback>
                  </Avatar>
                  {profile.rating && (
                    <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center shadow">
                      <Star className="w-4 h-4 fill-white text-white" />
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {profile.full_name || profile.username}
                  </h2>
                  {profile.joinDate && (
                    <p className="text-sm text-gray-500 mt-1">
                      Tham gia: {joinDateText}
                    </p>
                  )}
                </div>

                {profile.totalBookings != null && (
                  <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full text-sm font-medium">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{profile.totalBookings} chuyến</span>
                  </div>
                )}

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={!isEditing || saving}
                />

                {isEditing && (
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={saving}
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
                    {avatarFile && (
                      <p className="basis-full text-xs text-green-600 text-center lg:text-left">
                        ✓ Ảnh mới sẽ hiển thị sau khi bạn lưu thay đổi.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Thông tin tài khoản</h3>
                    <p className="text-sm text-gray-500">
                      Cập nhật nhanh thông tin liên hệ và xác thực
                    </p>
                  </div>

                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
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
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Hủy
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                      onClick={() => setIsEditing(true)}
                      disabled={saving}
                    >
                      Chỉnh sửa
                    </Button>
                  )}
                </div>

                <div className="grid gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 sm:gap-4 items-center">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Họ và tên</span>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editData.full_name}
                        onChange={(e) =>
                          setEditData({ ...editData, full_name: e.target.value })
                        }
                        disabled={saving}
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    ) : (
                      <span className="text-base font-semibold text-gray-900">
                        {profile.full_name || profile.username}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 sm:gap-4 items-center">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Số điện thoại</span>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editData.phone}
                        onChange={(e) =>
                          setEditData({ ...editData, phone: e.target.value })
                        }
                        disabled={saving}
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    ) : (
                      <span className="text-base font-semibold text-gray-900">
                        {profile.phone || "Chưa cập nhật"}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 sm:gap-4 items-center">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email</span>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editData.email}
                        onChange={(e) =>
                          setEditData({ ...editData, email: e.target.value })
                        }
                        disabled={saving}
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    ) : (
                      <span className="text-base font-semibold text-gray-900 break-words">
                        {profile.email || "Chưa cập nhật"}
                      </span>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* License section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Giấy phép lái xe và Căn Cước Công Dân </h3>
                <p className="text-sm text-gray-500">
              Để tránh phát sinh vấn đề khi thuê xe, hãy xác thực GPLX và CCCD trùng khớp thông tin cá nhân của bạn.
                </p>
              </div>
              {/* Removed 'Chưa xác thực' status chip */}
            </div>

            {/* Removed general warning note per request */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1 block">Ảnh GPLX</Label>
                  <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl flex flex-col items-center justify-center min-h-[200px] p-6 text-gray-500 text-sm">
                    {(driverLicenseImagePreview || (profile.driverLicenseImageUrl && !driverLicenseImageError)) ? (
                      <img
                        src={driverLicenseImagePreview || profile.driverLicenseImageUrl!}
                        alt="Ảnh GPLX"
                        className="max-h-48 object-contain rounded shadow-sm"
                        onError={() => setDriverLicenseImageError(true)}
                      />
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                          <ImageIcon className="w-6 h-6 text-green-500" />
                        </div>
                        <p>Tải ảnh GPLX của bạn</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <input
                      ref={driverLicenseInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={handleDriverLicenseChange}
                      disabled={!isEditing || saving}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => driverLicenseInputRef.current?.click()}
                      disabled={!isEditing || saving}
                      className="border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                    >
                      <Car className="w-4 h-4 mr-2" />
                      Chọn ảnh GPLX
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
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1 block">Ảnh CCCD</Label>
                  <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl flex flex-col items-center justify-center min-h-[200px] p-6 text-gray-500 text-sm">
                    {(nationalIdImagePreview || (profile.nationalIdImageUrl && !nationalIdImageError)) ? (
                      <img
                        src={nationalIdImagePreview || profile.nationalIdImageUrl!}
                        alt="Ảnh CCCD"
                        className="max-h-48 object-contain rounded shadow-sm"
                        onError={() => setNationalIdImageError(true)}
                      />
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                          <ImageIcon className="w-6 h-6 text-green-500" />
                        </div>
                        <p>Chưa có ảnh CCCD</p>
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <input
                      ref={nationalIdInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={handleNationalIdChange}
                      disabled={!isEditing || saving}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => nationalIdInputRef.current?.click()}
                      disabled={!isEditing || saving}
                      className="border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                    >
                      <IdCard className="w-4 h-4 mr-2" />
                      Chọn ảnh CCCD
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
                </div>

                <Separator />

               
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
