import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Car, Plus, Pencil, Lock, Unlock, Trash } from 'lucide-react';

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
}

const initialVehicles: Vehicle[] = [
  { id: 'VF8-001', model: 'VinFast VF8', segment: 'SUV 5+2', plate: '30G-123.45', station: 'EV Station A', pricePerHour: 800000, batteryPercent: 92, vehicleType: 'car', status: 'available' },
  { id: 'VF7-011', model: 'VinFast VF7', segment: 'Crossover', plate: '51H-678.90', station: 'EV Station B', pricePerHour: 500000, batteryPercent: 85, vehicleType: 'car', status: 'available' },
  { id: 'VF6-005', model: 'VinFast VF6', segment: 'Crossover', plate: '47A-333.22', station: 'EV Station C', pricePerHour: 300000, batteryPercent: 100, vehicleType: 'car', status: 'maintenance' },
  { id: 'KLA-101', model: 'VinFast Klara', segment: 'E-Scooter', plate: '29E1-456.78', station: 'EV Station A', pricePerHour: 150000, batteryPercent: 100, vehicleType: 'scooter', status: 'disabled' },
];

// Đổi tên hàm currency
const currency = (v: number) => `${v.toLocaleString()}₫/ngày`;

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter(v =>
      [v.id, v.model, v.segment, v.plate, v.station].some(f => f.toLowerCase().includes(q))
    );
  }, [vehicles, search]);

  const handleSave = (vehicle: Vehicle) => {
    setVehicles(prev => {
      const exists = prev.some(v => v.id === vehicle.id);
      return exists ? prev.map(v => (v.id === vehicle.id ? vehicle : v)) : [vehicle, ...prev];
    });
    setModalOpen(false);
    setEditing(null);
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

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
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
    </div>
  );
};

export default AdminVehicles;

interface VehicleFormModalProps {
  editing: Vehicle | null;
  onSave: (v: Vehicle) => void;
}

const VehicleFormModal = ({ editing, onSave }: VehicleFormModalProps) => {
  const [form, setForm] = useState<Vehicle>(
    editing || { id: '', model: '', segment: '', plate: '', station: '', pricePerHour: 100000, batteryPercent: 50, vehicleType: 'car', status: 'available' }
  );

  const isEdit = Boolean(editing);

  const handleChange = (key: keyof Vehicle, value: string | number | VehicleStatus) => {
    setForm(prev => ({ ...prev, [key]: value } as Vehicle));
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
      <DialogFooter>
        <Button className="bg-green-500 hover:bg-green-600" onClick={() => onSave(form)}>
          Lưu
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};


