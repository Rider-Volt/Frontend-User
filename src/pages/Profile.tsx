import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, Home, Car, IdCard, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/heroUi/Navbar";
import Footer from "../components/heroUi/Footer";
import { getCurrentUser, refreshCurrentUser, updateUser, LoginResponse, uploadIdentitySet, getAuthToken } from "@/services/authService";
import { listIdentitySets, IdentitySet } from "@/services/renterBillingService";

const Profile = () => {
  const [profile, setProfile] = useState<LoginResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Ảnh giấy tờ - GPLX
  const [gplxFrontFile, setGplxFrontFile] = useState<File | null>(null);
  const [gplxFrontPreview, setGplxFrontPreview] = useState<string | null>(null);
  const gplxFrontInputRef = useRef<HTMLInputElement | null>(null);
  const [gplxFrontError, setGplxFrontError] = useState(false);

  const [gplxBackFile, setGplxBackFile] = useState<File | null>(null);
  const [gplxBackPreview, setGplxBackPreview] = useState<string | null>(null);
  const gplxBackInputRef = useRef<HTMLInputElement | null>(null);
  const [gplxBackError, setGplxBackError] = useState(false);

  // Ảnh giấy tờ - CCCD
  const [cccdFrontFile, setCccdFrontFile] = useState<File | null>(null);
  const [cccdFrontPreview, setCccdFrontPreview] = useState<string | null>(null);
  const cccdFrontInputRef = useRef<HTMLInputElement | null>(null);
  const [cccdFrontError, setCccdFrontError] = useState(false);

  const [cccdBackFile, setCccdBackFile] = useState<File | null>(null);
  const [cccdBackPreview, setCccdBackPreview] = useState<string | null>(null);
  const cccdBackInputRef = useRef<HTMLInputElement | null>(null);
  const [cccdBackError, setCccdBackError] = useState(false);

  // Identity sets từ API
  const [identitySets, setIdentitySets] = useState<IdentitySet[]>([]);
  const [loadingIdentitySets, setLoadingIdentitySets] = useState(false);
  
  const [note, setNote] = useState("");

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

  // Clear functions cho GPLX
  const clearGplxFrontSelection = () => {
    if (gplxFrontPreview) URL.revokeObjectURL(gplxFrontPreview);
    setGplxFrontFile(null);
    setGplxFrontPreview(null);
    if (gplxFrontInputRef.current) gplxFrontInputRef.current.value = "";
    setGplxFrontError(false);
  };

  const clearGplxBackSelection = () => {
    if (gplxBackPreview) URL.revokeObjectURL(gplxBackPreview);
    setGplxBackFile(null);
    setGplxBackPreview(null);
    if (gplxBackInputRef.current) gplxBackInputRef.current.value = "";
    setGplxBackError(false);
  };

  // Clear functions cho CCCD
  const clearCccdFrontSelection = () => {
    if (cccdFrontPreview) URL.revokeObjectURL(cccdFrontPreview);
    setCccdFrontFile(null);
    setCccdFrontPreview(null);
    if (cccdFrontInputRef.current) cccdFrontInputRef.current.value = "";
    setCccdFrontError(false);
  };

  const clearCccdBackSelection = () => {
    if (cccdBackPreview) URL.revokeObjectURL(cccdBackPreview);
    setCccdBackFile(null);
    setCccdBackPreview(null);
    if (cccdBackInputRef.current) cccdBackInputRef.current.value = "";
    setCccdBackError(false);
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

  // Handlers cho GPLX
  const handleGplxFrontChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return clearGplxFrontSelection();
    setGplxFrontFile(file);
    setGplxFrontError(false);
    setGplxFrontPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleGplxBackChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return clearGplxBackSelection();
    setGplxBackFile(file);
    setGplxBackError(false);
    setGplxBackPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  // Handlers cho CCCD
  const handleCccdFrontChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return clearCccdFrontSelection();
    setCccdFrontFile(file);
    setCccdFrontError(false);
    setCccdFrontPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleCccdBackChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return clearCccdBackSelection();
    setCccdBackFile(file);
    setCccdBackError(false);
    setCccdBackPreview((prev) => {
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

  // Load identity sets
  useEffect(() => {
    if (!profile) return;
    let active = true;
    (async () => {
      try {
        setLoadingIdentitySets(true);
        const sets = await listIdentitySets();
        if (!active) return;
        setIdentitySets(sets);
        // Tự động load ảnh từ identity set mới nhất nếu có
        if (sets.length > 0) {
          const latestSet = sets[0];
          if (latestSet.assets && latestSet.assets.length > 0) {
            const cccdFront = latestSet.assets.find(a => a.type === "CCCD_FRONT");
            const cccdBack = latestSet.assets.find(a => a.type === "CCCD_BACK");
            const gplxFront = latestSet.assets.find(a => a.type === "GPLX_FRONT");
            const gplxBack = latestSet.assets.find(a => a.type === "GPLX_BACK");
            
            // Cập nhật profile với URL từ identity set
            if (cccdFront && !profile.nationalIdImageUrl) {
              setProfile({ ...profile, nationalIdImageUrl: cccdFront.url });
            }
            if (gplxFront && !profile.driverLicenseImageUrl) {
              setProfile({ ...profile, driverLicenseImageUrl: gplxFront.url });
            }
          }
        }
      } catch (err) {
        console.warn("Không thể tải danh sách giấy tờ", err);
      } finally {
        if (active) {
          setLoadingIdentitySets(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [profile]);

  useEffect(
    () => () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      if (gplxFrontPreview) URL.revokeObjectURL(gplxFrontPreview);
      if (gplxBackPreview) URL.revokeObjectURL(gplxBackPreview);
      if (cccdFrontPreview) URL.revokeObjectURL(cccdFrontPreview);
      if (cccdBackPreview) URL.revokeObjectURL(cccdBackPreview);
    },
    [avatarPreview, gplxFrontPreview, gplxBackPreview, cccdFrontPreview, cccdBackPreview]
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
      const token = getAuthToken();
      if (!token) {
        throw new Error("Bạn cần đăng nhập để cập nhật");
      }

      // Upload identity set nếu có file giấy tờ
      // Upload GPLX mặt trước
      if (gplxFrontFile) {
        try {
          await uploadIdentitySet(
            {
              gplxFile: gplxFrontFile,
              gplxSide: "front",
            },
            token
          );
        } catch (err: any) {
          console.warn("Lỗi upload GPLX mặt trước:", err);
        }
      }

      // Upload GPLX mặt sau
      if (gplxBackFile) {
        try {
          await uploadIdentitySet(
            {
              gplxFile: gplxBackFile,
              gplxSide: "back",
            },
            token
          );
        } catch (err: any) {
          console.warn("Lỗi upload GPLX mặt sau:", err);
        }
      }

      // Upload CCCD mặt trước
      if (cccdFrontFile) {
        try {
          await uploadIdentitySet(
            {
              cccdFile: cccdFrontFile,
              cccdSide: "front",
            },
            token
          );
        } catch (err: any) {
          console.warn("Lỗi upload CCCD mặt trước:", err);
        }
      }

      // Upload CCCD mặt sau
      if (cccdBackFile) {
        try {
          await uploadIdentitySet(
            {
              cccdFile: cccdBackFile,
              cccdSide: "back",
            },
            token
          );
        } catch (err: any) {
          console.warn("Lỗi upload CCCD mặt sau:", err);
        }
      }

      // Upload note nếu có
      if (note && (gplxFrontFile || gplxBackFile || cccdFrontFile || cccdBackFile)) {
        try {
          // Note có thể được gửi kèm với lần upload cuối cùng
          await uploadIdentitySet(
            {
              note: note,
            },
            token
          );
        } catch (err: any) {
          console.warn("Lỗi upload ghi chú:", err);
        }
      }

      // Reload identity sets sau khi upload thành công
      if (gplxFrontFile || gplxBackFile || cccdFrontFile || cccdBackFile) {
        try {
          const sets = await listIdentitySets();
          setIdentitySets(sets);
        } catch (err: any) {
          console.warn("Lỗi reload identity sets:", err);
        }
      }

      // Cập nhật thông tin profile
      const updated = await updateUser({
        full_name: editData.full_name,
        email: editData.email,
        phone: editData.phone,
        address: editData.address,
        avatarFile,
        // Không truyền giấy tờ vào updateUser nữa vì đã upload riêng
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
      clearGplxFrontSelection();
      clearGplxBackSelection();
      clearCccdFrontSelection();
      clearCccdBackSelection();
      setNote("");
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
    clearGplxFrontSelection();
    clearGplxBackSelection();
    clearCccdFrontSelection();
    clearCccdBackSelection();
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

            {/* Ảnh GPLX - Mặt trước và Mặt sau */}
            <div className="space-y-6">
              <div>
                <Label className="text-lg font-semibold text-gray-900 mb-4 block">Ảnh GPLX</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* GPLX Mặt trước */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Mặt trước GPLX</Label>
                    <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl flex flex-col items-center justify-center min-h-[200px] p-6 text-gray-500 text-sm">
                      {gplxFrontPreview ? (
                        <img
                          src={gplxFrontPreview}
                          alt="GPLX Mặt trước"
                          className="max-h-48 object-contain rounded shadow-sm"
                        />
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                            <ImageIcon className="w-6 h-6 text-green-500" />
                          </div>
                          <p>Chưa có ảnh mặt trước</p>
                        </>
                      )}
                    </div>
                    {isEditing && (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          ref={gplxFrontInputRef}
                          type="file"
                          accept="image/png,image/jpeg"
                          className="hidden"
                          onChange={handleGplxFrontChange}
                          disabled={!isEditing || saving}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => gplxFrontInputRef.current?.click()}
                          disabled={!isEditing || saving}
                          className="border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                        >
                          <Car className="w-4 h-4 mr-2" />
                          Chọn ảnh mặt trước
                        </Button>
                        {gplxFrontFile && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={clearGplxFrontSelection}
                            disabled={saving}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Bỏ chọn
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* GPLX Mặt sau */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Mặt sau GPLX</Label>
                    <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl flex flex-col items-center justify-center min-h-[200px] p-6 text-gray-500 text-sm">
                      {gplxBackPreview ? (
                        <img
                          src={gplxBackPreview}
                          alt="GPLX Mặt sau"
                          className="max-h-48 object-contain rounded shadow-sm"
                        />
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                            <ImageIcon className="w-6 h-6 text-green-500" />
                          </div>
                          <p>Chưa có ảnh mặt sau</p>
                        </>
                      )}
                    </div>
                    {isEditing && (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          ref={gplxBackInputRef}
                          type="file"
                          accept="image/png,image/jpeg"
                          className="hidden"
                          onChange={handleGplxBackChange}
                          disabled={!isEditing || saving}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => gplxBackInputRef.current?.click()}
                          disabled={!isEditing || saving}
                          className="border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                        >
                          <Car className="w-4 h-4 mr-2" />
                          Chọn ảnh mặt sau
                        </Button>
                        {gplxBackFile && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={clearGplxBackSelection}
                            disabled={saving}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Bỏ chọn
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Ảnh CCCD - Mặt trước và Mặt sau */}
              <div>
                <Label className="text-lg font-semibold text-gray-900 mb-4 block">Ảnh CCCD</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CCCD Mặt trước */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Mặt trước CCCD</Label>
                    <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl flex flex-col items-center justify-center min-h-[200px] p-6 text-gray-500 text-sm">
                      {cccdFrontPreview ? (
                        <img
                          src={cccdFrontPreview}
                          alt="CCCD Mặt trước"
                          className="max-h-48 object-contain rounded shadow-sm"
                        />
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                            <ImageIcon className="w-6 h-6 text-green-500" />
                          </div>
                          <p>Chưa có ảnh mặt trước</p>
                        </>
                      )}
                    </div>
                    {isEditing && (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          ref={cccdFrontInputRef}
                          type="file"
                          accept="image/png,image/jpeg"
                          className="hidden"
                          onChange={handleCccdFrontChange}
                          disabled={!isEditing || saving}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => cccdFrontInputRef.current?.click()}
                          disabled={!isEditing || saving}
                          className="border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                        >
                          <IdCard className="w-4 h-4 mr-2" />
                          Chọn ảnh mặt trước
                        </Button>
                        {cccdFrontFile && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={clearCccdFrontSelection}
                            disabled={saving}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Bỏ chọn
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CCCD Mặt sau */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Mặt sau CCCD</Label>
                    <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl flex flex-col items-center justify-center min-h-[200px] p-6 text-gray-500 text-sm">
                      {cccdBackPreview ? (
                        <img
                          src={cccdBackPreview}
                          alt="CCCD Mặt sau"
                          className="max-h-48 object-contain rounded shadow-sm"
                        />
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                            <ImageIcon className="w-6 h-6 text-green-500" />
                          </div>
                          <p>Chưa có ảnh mặt sau</p>
                        </>
                      )}
                    </div>
                    {isEditing && (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          ref={cccdBackInputRef}
                          type="file"
                          accept="image/png,image/jpeg"
                          className="hidden"
                          onChange={handleCccdBackChange}
                          disabled={!isEditing || saving}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => cccdBackInputRef.current?.click()}
                          disabled={!isEditing || saving}
                          className="border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                        >
                          <IdCard className="w-4 h-4 mr-2" />
                          Chọn ảnh mặt sau
                        </Button>
                        {cccdBackFile && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={clearCccdBackSelection}
                            disabled={saving}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Bỏ chọn
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

                {isEditing && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Ghi chú (tùy chọn)</Label>
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Nhập ghi chú nếu có..."
                      disabled={saving}
                      className="min-h-[80px] border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                )}

                {/* Hiển thị danh sách identity sets */}
                {identitySets.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <Label className="text-sm font-medium text-gray-700">Lịch sử giấy tờ đã nộp</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {identitySets.map((set) => (
                        <div key={set.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              Bộ giấy tờ #{set.id}
                            </span>
                            {set.status && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  set.status === "APPROVED"
                                    ? "bg-green-100 text-green-700"
                                    : set.status === "REJECTED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {set.status === "APPROVED"
                                  ? "Đã duyệt"
                                  : set.status === "REJECTED"
                                  ? "Từ chối"
                                  : "Chờ duyệt"}
                              </span>
                            )}
                          </div>
                          {set.note && (
                            <p className="text-xs text-gray-600 mt-1">{set.note}</p>
                          )}
                          {set.reviewNote && (
                            <p className="text-xs text-red-600 mt-1">Ghi chú: {set.reviewNote}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
