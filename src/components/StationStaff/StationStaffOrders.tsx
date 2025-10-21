import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, User, Phone, Calendar, Clock, MapPin } from 'lucide-react';
import { fetchVehicleById } from '@/services/vehicleService';

// Map FE order buckets to backend billing statuses
type OrderStatus = 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
import { getStationBillings, updateBillingStatus, BillingStatus, BillingResponse } from '@/services/staffBillingService';

interface StaffOrder {
  id: string;
  vehicleId: string;
  vehicleName: string;
  plate: string;
  customerName: string;
  customerPhone: string;
  pickupTime: Date;
  returnTime: Date;
  pickupLocation: string;
  status: OrderStatus;
  notes?: string;
}

const initialOrders: StaffOrder[] = [];

const statusBadge = (s: OrderStatus) => {
  switch (s) {
    case 'pending':
      return <Badge className="bg-gray-100 text-gray-800">Chờ xác nhận</Badge>;
    case 'confirmed':
      return <Badge className="bg-blue-100 text-blue-800">Đã xác nhận</Badge>;
    case 'ongoing':
      return <Badge className="bg-yellow-100 text-yellow-800">Đang thuê</Badge>;
    case 'completed':
      return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>;
  }
};

const formatDateTime = (d: Date) =>
  d.toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

// Cache model id -> model name to avoid repeated calls
const modelNameCache = new Map<number, string>();

async function getModelNameById(modelId: number): Promise<string | undefined> {
  if (modelNameCache.has(modelId)) return modelNameCache.get(modelId);
  const data = await fetchVehicleById(modelId).catch(() => null);
  const name = data?.model || data?.name;
  if (name) modelNameCache.set(modelId, name);
  return name;
}

const StationStaffOrders = () => {
  const [orders, setOrders] = useState<StaffOrder[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<OrderStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map backend Billing -> FE StaffOrder
  const mapBilling = (b: BillingResponse): StaffOrder => {
    // Prefer direct vehicleModel from API if provided, else resolve from nested model or cache by id
    const directModelName = (b as any).vehicleModel as string | undefined;
    const modelId = (b as any).vehicleId ? Number((b as any).vehicleId) : (
      typeof b.vehicle?.model?.id === 'number' ? b.vehicle.model!.id : undefined
    );
    const cachedName = modelId ? modelNameCache.get(modelId) : undefined;
    const vehicleName = directModelName || b.vehicle?.model?.name || cachedName || (modelId ? `Model #${modelId}` : 'Mẫu xe');
    const pickup = new Date(b.startTime);
    const ret = new Date(b.endTime);
    const stationName = b.vehicle?.station?.name || '';
    // Widen backend status mapping
    const status: OrderStatus = (() => {
      switch (b.status) {
        case 'PENDING': return 'pending';
        case 'APPROVED': return 'confirmed';
        case 'RENTING': return 'ongoing';
        case 'PAYED':
        case 'COMPLETED': return 'completed';
        case 'CANCELLED': default: return 'cancelled';
      }
    })();
    return {
      id: String(b.id),
      vehicleId: String(b.vehicle?.id ?? ''),
      vehicleName,
      plate: b.vehicle?.code || '',
      customerName: (b as any).renterName || b.renter?.name || '',
      customerPhone: (b as any).renterPhone || b.renter?.phone || '',
      pickupTime: pickup,
      returnTime: ret,
      pickupLocation: stationName,
      status,
    };
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getStationBillings();
        // Pre-resolve missing model names by id
        const missing = new Set<number>();
        for (const b of data as any[]) {
          const directName = b.vehicleModel as string | undefined;
          if (directName) continue;
          const mId = typeof b?.vehicle?.model?.id === 'number' ? b.vehicle.model.id : (typeof b.vehicleId === 'number' ? b.vehicleId : undefined);
          const mName = b?.vehicle?.model?.name as string | undefined;
          if (mId && !mName && !modelNameCache.has(mId)) missing.add(mId);
        }
        if (missing.size) {
          await Promise.all(Array.from(missing).map(id => getModelNameById(id)));
        }
        if (!cancelled) setOrders(data.map(mapBilling));
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Không tải được danh sách đơn');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let list = orders;
    if (tab !== 'all') list = list.filter(o => o.status === tab);
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(o => [o.id, o.vehicleId, o.vehicleName, o.plate, o.customerName, o.customerPhone, o.pickupLocation]
      .some(f => f.toLowerCase().includes(q)));
  }, [orders, search, tab]);

  const updateStatus = async (id: string, next: OrderStatus) => {
    // Only map actions that backend supports (PAYED / CANCELLED). Other FE-only states are not backed.
    const toBackend = (s: OrderStatus): BillingStatus | null => {
      if (s === 'completed') return 'PAYED';
      if (s === 'cancelled') return 'CANCELLED';
      return null; // no-op for confirmed/ongoing because backend doesn't have those statuses
    };

    const backendStatus = toBackend(next);
    if (!backendStatus) {
      alert('Hành động này chưa được hỗ trợ bởi backend. Vui lòng sử dụng Hoàn thành hoặc Hủy.');
      return;
    }

    try {
      const updated = await updateBillingStatus(Number(id), backendStatus);
      // Map backend returned status to FE OrderStatus
      const newStatus: OrderStatus = ((): OrderStatus => {
        switch (updated.status) {
          case 'PENDING': return 'pending';
          case 'PAYED': return 'completed';
          case 'CANCELLED': return 'cancelled';
          default: return 'pending';
        }
      })();

      setOrders(prev => prev.map(o => (o.id === String(updated.id) ? { ...o, status: newStatus } : o)));
    } catch (e: any) {
      alert(e?.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const actionOptions = (status: OrderStatus): { label: string; value: OrderStatus }[] => {
    // Backend only supports PAYED and CANCELLED transitions. Offer only meaningful actions.
    switch (status) {
      case 'pending':
      case 'confirmed':
        return [
          { label: 'Đánh dấu đã thanh toán', value: 'completed' },
          { label: 'Hủy', value: 'cancelled' },
        ];
      case 'ongoing':
        return [
          { label: 'Hoàn thành', value: 'completed' },
          { label: 'Hủy', value: 'cancelled' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold">Đơn thuê tại trạm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <Input
              placeholder="Tìm theo mã đơn, xe, khách hàng, SĐT, địa điểm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:max-w-lg"
            />
            <div className="w-full sm:w-64">
              <Select value={tab} onValueChange={(v) => setTab(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ</SelectItem>
                  <SelectItem value="confirmed">Xác nhận</SelectItem>
                  <SelectItem value="ongoing">Đang thuê</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-4">Đang tải...</div>
            ) : error ? (
              <div className="p-4 text-red-600">{error}</div>
            ) : null}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Xe</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Nhận</TableHead>
                  <TableHead>Trả</TableHead>
                  <TableHead>Địa điểm</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(o => (
                  <TableRow key={o.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{o.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-gray-500" />
                        {o.vehicleName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-500" />{o.customerName || 'Khách lẻ'}</div>
                        {o.customerPhone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="w-4 h-4" />{o.customerPhone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500" />{formatDateTime(o.pickupTime)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-500" />{formatDateTime(o.returnTime)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500" />{o.pickupLocation}</div>
                    </TableCell>
                    <TableCell>{statusBadge(o.status)}</TableCell>
                    <TableCell className="text-right">
                      {['completed','cancelled'].includes(o.status) ? (
                        <span className="text-sm text-gray-500">Không có thao tác</span>
                      ) : (
                        <div className="inline-block w-44">
                          <Select onValueChange={(v) => updateStatus(o.id, v as OrderStatus)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn thao tác" />
                            </SelectTrigger>
                            <SelectContent>
                              {actionOptions(o.status).map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </TableCell>
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

export default StationStaffOrders;


