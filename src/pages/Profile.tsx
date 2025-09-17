import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Calendar, Car, Star, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  licenseNumber: string;
  joinDate: Date;
  totalBookings: number;
  totalSpent: number;
  rating: number;
  address: string;
}

const mockProfile: UserProfile = {
  id: "USER001",
  name: "Nguyễn Văn A",
  email: "nguyenvana@email.com",
  phone: "0901234567",
  licenseNumber: "A123456789",
  joinDate: new Date("2023-06-15"),
  totalBookings: 12,
  totalSpent: 15000000,
  rating: 4.8,
  address: "123 Đường ABC, Quận 1, TP.HCM"
};

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: mockProfile.name,
    email: mockProfile.email,
    phone: mockProfile.phone,
    address: mockProfile.address,
    licenseNumber: mockProfile.licenseNumber
  });

  const handleSave = () => {
    setProfile(prev => ({
      ...prev,
      ...editData
    }));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      licenseNumber: profile.licenseNumber
    });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
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
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">{profile.name}</CardTitle>
                <p className="text-muted-foreground">Thành viên từ {profile.joinDate.toLocaleDateString('vi-VN')}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{profile.rating}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{profile.totalBookings}</p>
                    <p className="text-sm text-muted-foreground">Đặt xe</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {(profile.totalSpent / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-sm text-muted-foreground">Đã chi</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">ID: {profile.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Bằng lái: {profile.licenseNumber}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Thông tin cá nhân</CardTitle>
                  <Button 
                    variant={isEditing ? "outline" : "electric"}
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  >
                    {isEditing ? "Lưu" : "Chỉnh sửa"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      value={editData.phone}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="license">Số bằng lái xe</Label>
                    <Input
                      id="license"
                      value={editData.licenseNumber}
                      onChange={(e) => setEditData({...editData, licenseNumber: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input
                    id="address"
                    value={editData.address}
                    onChange={(e) => setEditData({...editData, address: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>Lưu thay đổi</Button>
                    <Button variant="outline" onClick={handleCancel}>Hủy</Button>
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