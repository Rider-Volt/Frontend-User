import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Plus, Pencil, Lock, Unlock, Trash, History, MapPin, Clock, User, CheckCircle, XCircle, Upload, Image as ImageIcon } from 'lucide-react';

type VehicleStatus = 'available' | 'maintenance' | 'disabled';
type VehicleType = 'car' | 'scooter';

interface Vehicle {
  id: string;
  model: string;
  segment: string;
  plate: string;
  station: string;
  pricePerHour: number;
  batteryPercent: number; 
  vehicleType: VehicleType;
  status: VehicleStatus;
  image?: string;
}

interface VehicleTracking {
  id: string;
  vehicleId: string;
  action: 'pickup' | 'return' | 'maintenance_start' | 'maintenance_end' | 'location_change';
  timestamp: Date;
  location: string;
  performedBy: string;
  notes?: string;
  customerInfo?: {
    name: string;
    phone: string;
    licenseNumber: string;
  };
}

const initialVehicles: Vehicle[] = [
  { id: 'VF8-001', model: 'VinFast VF8', segment: 'SUV 5+2', plate: '30G-123.45', station: 'EV Station A', pricePerHour: 800000, batteryPercent: 92, vehicleType: 'car', status: 'available', image: '/images/imagecar/vf8.jpg' },
  { id: 'VF7-011', model: 'VinFast VF7', segment: 'Crossover', plate: '51H-678.90', station: 'EV Station B', pricePerHour: 500000, batteryPercent: 85, vehicleType: 'car', status: 'available', image: '/images/imagecar/vf7.jpg' },
  { id: 'VF6-005', model: 'VinFast VF6', segment: 'Crossover', plate: '47A-333.22', station: 'EV Station C', pricePerHour: 300000, batteryPercent: 100, vehicleType: 'car', status: 'maintenance', image: '/images/imagecar/vf6.jpg' },
  { id: 'KLA-101', model: 'VinFast Klara', segment: 'E-Scooter', plate: '29E1-456.78', station: 'EV Station A', pricePerHour: 150000, batteryPercent: 100, vehicleType: 'scooter', status: 'disabled', image: '/images/imagecar/klaraneo.jpg' },
];

const mockTrackingData: VehicleTracking[] = [
  {
    id: 'TR001',
    vehicleId: 'VF8-001',
    action: 'pickup',
    timestamp: new Date('2024-01-15T09:30:00'),
    location: 'EV Station A',
    performedBy: 'Nguyễn Văn A',
    customerInfo: {
      name: 'Trần Thị B',
      phone: '0901234567',
      licenseNumber: 'A123456789'
    },
    notes: 'Khách hàng nhận xe đúng giờ'
  },
  {
    id: 'TR002',
    vehicleId: 'VF8-001',
    action: 'return',
    timestamp: new Date('2024-01-16T10:15:00'),
    location: 'EV Station A',
    performedBy: 'Nguyễn Văn A',
    customerInfo: {
      name: 'Trần Thị B',
      phone: '0901234567',
      licenseNumber: 'A123456789'
    },
    notes: 'Xe trả về trong tình trạng tốt, pin còn 92%'
  },
  {
    id: 'TR003',
    vehicleId: 'VF6-005',
    action: 'maintenance_start',
    timestamp: new Date('2024-01-14T14:00:00'),
    location: 'EV Station C',
    performedBy: 'Kỹ thuật viên C',
    notes: 'Bắt đầu bảo trì định kỳ, kiểm tra hệ thống pin'
  },
  {
    id: 'TR004',
    vehicleId: 'VF7-011',
    action: 'location_change',
    timestamp: new Date('2024-01-13T16:30:00'),
    location: 'EV Station A',
    performedBy: 'Nhân viên D',
    notes: 'Chuyển xe từ Station B sang Station A'
  }
];

// Đổi tên hàm currency
const currency = (v: number) => `${v.toLocaleString()}₫/ngày`;

// Danh sách ảnh có sẵn trong thư viện
const availableImages = [
  { name: 'VF e34', path: '/images/imagecar/e34.jpg'},
  { name: 'VF 3', path: '/images/imagecar/vf3.jpg' },
  { name: 'VF 5', path: '/images/imagecar/vf5.jpg' },
  { name: 'VF 6', path: '/images/imagecar/vf6.jpg' },
  { name: 'VF 7', path: '/images/imagecar/vf7.jpg' },
  { name: 'VF 8', path: '/images/imagecar/vf8.jpg' },
  { name: 'VF 9', path: '/images/imagecar/vf9.jpg' },
  { name: 'Feliz', path: '/images/imagecar/feliz.jpg' },
  { name: 'Klara Neo', path: '/images/imagecar/klaraneo.jpg' },
  { name: 'Evo Neo', path: '/images/imagecar/evoneo.jpg' },
  { name: 'Evo Grand', path: '/images/imagecar/evogrand.jpg' },
  { name: 'Vento Neo', path: '/images/imagecar/ventoneo.jpg' },
];

const StationStaffVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [trackingData, setTrackingData] = useState<VehicleTracking[]>(mockTrackingData);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'prebooked' | 'rented'>('all');
  const [trackingSearch, setTrackingSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = vehicles;
    // Map status filter to our demo statuses
    if (statusFilter !== 'all') {
      list = list.filter(v => {
        if (statusFilter === 'available') return v.status === 'available';
        if (statusFilter === 'prebooked') return v.status === 'maintenance'; // demo mapping
        if (statusFilter === 'rented') return v.status === 'disabled'; // demo mapping
        return true;
      });
    }
    if (!q) return list;
    return list.filter(v =>
      [v.id, v.model, v.segment, v.plate, v.station].some(f => f.toLowerCase().includes(q))
    );
  }, [vehicles, search, statusFilter]);

  const filteredTracking = useMemo(() => {
    let filtered = trackingData;
    
    if (selectedVehicle) {
      filtered = filtered.filter(t => t.vehicleId === selectedVehicle);
    }
    
    const q = trackingSearch.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(t =>
        [t.id, t.action, t.location, t.performedBy, t.notes].some(f => 
          f?.toLowerCase().includes(q)
        )
      );
    }
    
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [trackingData, selectedVehicle, trackingSearch]);

  const handleSave = (vehicle: Vehicle) => {
    setVehicles(prev => {
      const exists = prev.some(v => v.id === vehicle.id);
      return exists ? prev.map(v => (v.id === vehicle.id ? vehicle : v)) : [vehicle, ...prev];
    });
    setModalOpen(false);
    setEditing(null);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'pickup': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'return': return <XCircle className="w-4 h-4 text-blue-500" />;
      case 'maintenance_start': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'maintenance_end': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'location_change': return <MapPin className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'pickup': return 'Nhận xe';
      case 'return': return 'Trả xe';
      case 'maintenance_start': return 'Bắt đầu bảo trì';
      case 'maintenance_end': return 'Kết thúc bảo trì';
      case 'location_change': return 'Chuyển vị trí';
      default: return action;
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleStatus = (id: string) => {
    setVehicles(prev => prev.map(v =>
      v.id === id ? { ...v, status: v.status === 'disabled' ? 'available' : 'disabled' } : v
    ));
  };

  const removeVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="vehicles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Quản lý xe
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Theo dõi lịch sử
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="space-y-6">
          <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                <Car className="h-5 w-5 text-green-500 mr-2" />
                Danh Sách Xe Điện
              </CardTitle>
            </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <Input
              placeholder="Tìm theo mã xe, model, biển số, trạm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:max-w-md"
            />
            <div className="flex items-center gap-2">
              <select
                className="border rounded-md px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="available">Có sẵn</option>
                <option value="prebooked">Đã đặt trước</option>
                <option value="rented">Đang cho thuê</option>
              </select>
              <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditing(null)} className="bg-green-500 hover:bg-green-600">
                    <Plus className="h-4 w-4 mr-2" /> Thêm xe
                  </Button>
                </DialogTrigger>
                <VehicleFormModal
                  editing={editing}
                  onSave={handleSave}
                />
              </Dialog>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ảnh</TableHead>
                  <TableHead>Mã xe</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Phân khúc</TableHead>
                  <TableHead>Loại xe</TableHead>
                  <TableHead>Pin</TableHead>
                  <TableHead>Biển số</TableHead>
                  <TableHead>Trạm</TableHead>
                  <TableHead>Giá/ngày</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(v => (
                  <TableRow key={v.id} className="hover:bg-gray-50">
                    <TableCell>
                      {v.image ? (
                        <img 
                          src={v.image} 
                          alt={v.model}
                          className="w-12 h-8 object-cover rounded border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-8 bg-gray-200 rounded border flex items-center justify-center">
                          <Car className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{v.id}</TableCell>
                    <TableCell>{v.model}</TableCell>
                    <TableCell className="text-gray-600">{v.segment}</TableCell>
                    <TableCell className="text-gray-600">{v.vehicleType === 'car' ? 'Ô tô' : 'Xe máy điện'}</TableCell>
                    <TableCell>{v.batteryPercent}%</TableCell>
                    <TableCell>{v.plate}</TableCell>
                    <TableCell>{v.station}</TableCell>
                    <TableCell className="font-semibold text-green-700">{currency(v.pricePerHour)}</TableCell>
                    <TableCell>
                      {v.status === 'available' && <Badge className="bg-green-100 text-green-800">Sẵn sàng</Badge>}
                      {v.status === 'maintenance' && <Badge className="bg-yellow-100 text-yellow-800">Bảo trì</Badge>}
                      {v.status === 'disabled' && <Badge className="bg-gray-100 text-gray-800">Tạm khóa</Badge>}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog open={modalOpen && editing?.id === v.id} onOpenChange={setModalOpen}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setEditing(v); setModalOpen(true); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <VehicleFormModal editing={editing?.id === v.id ? v : null} onSave={handleSave} />
                      </Dialog>
                      <Button variant="outline" size="sm" onClick={() => toggleStatus(v.id)}>
                        {v.status === 'disabled' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600" onClick={() => removeVehicle(v.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Danh sách xe có sẵn */}
      <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800">Danh Sách Xe Có Sẵn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại</TableHead>
                  <TableHead>Dung lượng pin</TableHead>
                  <TableHead>Giá/ngày</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.filter(v => v.status === 'available').map(v => (
                  <TableRow key={`avail-${v.id}`} className="hover:bg-gray-50">
                    <TableCell>{v.vehicleType === 'car' ? `${v.model} (Ô tô)` : `${v.model} (Xe máy điện)`}</TableCell>
                    <TableCell>{v.batteryPercent}%</TableCell>
                    <TableCell className="font-semibold text-green-700">{currency(v.pricePerHour)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                <History className="h-5 w-5 text-blue-500 mr-2" />
                Lịch sử giao/nhận và tình trạng xe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <select
                  className="border rounded-md px-3 py-2 text-sm"
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                >
                  <option value="">Tất cả xe</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.id} - {vehicle.model}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Tìm theo hành động, vị trí, người thực hiện..."
                  value={trackingSearch}
                  onChange={(e) => setTrackingSearch(e.target.value)}
                  className="flex-1"
                />
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Xe</TableHead>
                      <TableHead>Hành động</TableHead>
                      <TableHead>Vị trí</TableHead>
                      <TableHead>Người thực hiện</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTracking.map((track) => (
                      <TableRow key={track.id}>
                        <TableCell className="font-medium">
                          {formatDateTime(track.timestamp)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-gray-500" />
                            {track.vehicleId}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getActionIcon(track.action)}
                            {getActionLabel(track.action)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            {track.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            {track.performedBy}
                          </div>
                        </TableCell>
                        <TableCell>
                          {track.customerInfo ? (
                            <div className="text-sm">
                              <div className="font-medium">{track.customerInfo.name}</div>
                              <div className="text-gray-500">{track.customerInfo.phone}</div>
                              <div className="text-gray-500">{track.customerInfo.licenseNumber}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={track.notes}>
                            {track.notes || '-'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StationStaffVehicles;

interface VehicleFormModalProps {
  editing: Vehicle | null;
  onSave: (v: Vehicle) => void;
}

const VehicleFormModal = ({ editing, onSave }: VehicleFormModalProps) => {
  const [form, setForm] = useState<Vehicle>(
    editing || { id: '', model: '', segment: '', plate: '', station: '', pricePerHour: 100000, batteryPercent: 50, vehicleType: 'car', status: 'available', image: '' }
  );
  const [showImageGallery, setShowImageGallery] = useState(false);

  const isEdit = Boolean(editing);

  const handleChange = (key: keyof Vehicle, value: string | number | VehicleStatus) => {
    setForm(prev => ({ ...prev, [key]: value } as Vehicle));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setForm(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const selectImageFromGallery = (imagePath: string) => {
    setForm(prev => ({ ...prev, image: imagePath }));
    setShowImageGallery(false);
  };

  return (
    <DialogContent className="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Cập nhật xe' : 'Thêm xe mới'}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
        <Input placeholder="Mã xe" value={form.id} onChange={(e) => handleChange('id', e.target.value)} />
        <Input placeholder="Model" value={form.model} onChange={(e) => handleChange('model', e.target.value)} />
        <Input placeholder="Phân khúc" value={form.segment} onChange={(e) => handleChange('segment', e.target.value)} />
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={form.vehicleType}
          onChange={(e) => handleChange('vehicleType', e.target.value as VehicleType)}
        >
          <option value="car">Ô tô</option>
          <option value="scooter">Xe máy điện</option>
        </select>
        <Input
          type="number"
          placeholder="Pin (%)"
          value={form.batteryPercent}
          onChange={(e) => handleChange('batteryPercent', Number(e.target.value))}
        />
        <Input placeholder="Biển số" value={form.plate} onChange={(e) => handleChange('plate', e.target.value)} />
        <Input placeholder="Trạm" value={form.station} onChange={(e) => handleChange('station', e.target.value)} />
        <Input
          type="number"
          placeholder="Giá/ngày"
          value={form.pricePerHour}
          onChange={(e) => handleChange('pricePerHour', Number(e.target.value))}
        />
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={form.status}
          onChange={(e) => handleChange('status', e.target.value as VehicleStatus)}
        >
          <option value="available">Sẵn sàng</option>
          <option value="maintenance">Bảo trì</option>
          <option value="disabled">Tạm khóa</option>
        </select>
      </div>
      
      {/* Image Upload Section */}
      <div className="py-4 border-t">
        <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh xe</label>
        <div className="space-y-3">
          {/* Current Image Preview */}
          {form.image && (
            <div className="mb-3">
              <img 
                src={form.image} 
                alt="Vehicle preview" 
                className="w-full h-32 object-cover rounded-md border"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Upload Options */}
          <div className="flex gap-2">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Upload ảnh</span>
              </div>
            </label>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowImageGallery(!showImageGallery)}
              className="flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="text-sm">Thư viện</span>
            </Button>
          </div>

          {/* Image Gallery */}
          {showImageGallery && (
            <div className="border rounded-md p-3 bg-gray-50">
              <div className="text-sm font-medium text-gray-700 mb-2">Chọn ảnh từ thư viện:</div>
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {availableImages.map((img, index) => (
                  <div
                    key={index}
                    className="cursor-pointer border rounded-md overflow-hidden hover:border-blue-500 transition-colors"
                    onClick={() => selectImageFromGallery(img.path)}
                  >
                    <img
                      src={img.path}
                      alt={img.name}
                      className="w-full h-16 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="p-1 text-xs text-center bg-white">{img.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manual URL Input */}
          <div>
            <Input 
              placeholder="Hoặc nhập URL ảnh trực tiếp" 
              value={form.image || ''} 
              onChange={(e) => handleChange('image', e.target.value)} 
            />
            <div className="text-xs text-gray-500 mt-1">
              Hỗ trợ: Upload file, chọn từ thư viện, hoặc nhập URL
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button className="bg-green-500 hover:bg-green-600" onClick={() => onSave(form)}>
          Lưu
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};


