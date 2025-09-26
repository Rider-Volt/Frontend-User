import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from '@/components/ui/table';
import { UserCog, Plus, Pencil, ShieldCheck, ShieldX } from 'lucide-react';

type EmployeeStatus = 'active' | 'inactive';

interface Employee {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'staff' | 'manager';
  stationId: string;
  stationName: string;
  verified: boolean;
  status: EmployeeStatus;
}

const initialEmployees: Employee[] = [
  { id: 'EMP001', fullName: 'Pham Nhat A', email: 'a@evrental.com', phone: '0901112222', role: 'staff', stationId: 'ST-A', stationName: 'EV Station A', verified: true, status: 'active' },
  { id: 'EMP002', fullName: 'Nguyen Thi B', email: 'b@evrental.com', phone: '0903334444', role: 'staff', stationId: 'ST-A', stationName: 'EV Station A', verified: true, status: 'active' },
  { id: 'EMP003', fullName: 'Tran Van C', email: 'c@evrental.com', phone: '0905556666', role: 'staff', stationId: 'ST-B', stationName: 'EV Station B', verified: false, status: 'inactive' },
];

const AdminEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Employee | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(e => [e.id, e.fullName, e.email, e.phone, e.stationId, e.stationName].some(f => f.toLowerCase().includes(q)));
  }, [employees, search]);

  const handleSave = (e: Employee) => {
    setEmployees(prev => {
      const exists = prev.some(x => x.id === e.id);
      return exists ? prev.map(x => (x.id === e.id ? e : x)) : [e, ...prev];
    });
    setOpen(false);
    setEditing(null);
  };

  const toggleVerify = (id: string) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, verified: !e.verified } : e));
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-xl font-bold text-gray-800">
            <UserCog className="h-5 w-5 text-green-500 mr-2" />
            Nhân Viên Điểm Thuê
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <Input placeholder="Tìm theo mã, tên, email, SĐT, điểm thuê" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:max-w-md" />
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditing(null)} className="bg-green-500 hover:bg-green-600">
                  <Plus className="h-4 w-4 mr-2" /> Thêm nhân viên
                </Button>
              </DialogTrigger>
              <EmployeeFormModal editing={editing} onSave={handleSave} />
            </Dialog>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Điểm thuê</TableHead>
                  <TableHead>Xác thực</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(e => (
                  <TableRow key={e.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{e.id}</TableCell>
                    <TableCell>{e.fullName}</TableCell>
                    <TableCell className="text-gray-600">{e.email}</TableCell>
                    <TableCell>{e.phone}</TableCell>
                    <TableCell className="capitalize">{e.role}</TableCell>
                    <TableCell>{e.stationName}</TableCell>
                    <TableCell>
                      {e.verified ? (
                        <Badge className="bg-green-100 text-green-800">Đã xác thực</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">Chưa xác thực</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {e.status === 'active' ? (
                        <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Tạm nghỉ</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog open={open && editing?.id === e.id} onOpenChange={setOpen}>
                        <Button variant="outline" size="sm" onClick={() => { setEditing(e); setOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <EmployeeFormModal editing={editing?.id === e.id ? e : null} onSave={handleSave} />
                      </Dialog>
                      <Button variant="outline" size="sm" onClick={() => toggleVerify(e.id)}>
                        {e.verified ? <ShieldX className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      </Button>
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

export default AdminEmployees;

interface EmployeeFormModalProps {
  editing: Employee | null;
  onSave: (e: Employee) => void;
}

const EmployeeFormModal = ({ editing, onSave }: EmployeeFormModalProps) => {
  const [form, setForm] = useState<Employee>(
    editing || { id: '', fullName: '', email: '', phone: '', role: 'staff', stationId: 'ST-A', stationName: 'EV Station A', verified: false, status: 'active' }
  );

  const isEdit = Boolean(editing);

  const handleChange = (key: keyof Employee, value: string | boolean | EmployeeStatus | Employee['role']) => {
    setForm(prev => ({ ...prev, [key]: value } as Employee));
  };

  return (
    <DialogContent className="sm:max-w-[560px]">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Cập nhật nhân viên' : 'Thêm nhân viên'}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
        <Input placeholder="Mã" value={form.id} onChange={(e) => handleChange('id', e.target.value)} />
        <Input placeholder="Họ tên" value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} />
        <Input placeholder="Email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
        <Input placeholder="Số điện thoại" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
        <select className="border rounded-md px-3 py-2 text-sm" value={form.role} onChange={(e) => handleChange('role', e.target.value as Employee['role'])}>
          <option value="staff">Nhân viên</option>
          <option value="manager">Quản lý</option>
        </select>
        <Input placeholder="Mã điểm thuê" value={form.stationId} onChange={(e) => handleChange('stationId', e.target.value)} />
        <Input placeholder="Tên điểm thuê" value={form.stationName} onChange={(e) => handleChange('stationName', e.target.value)} />
        <select className="border rounded-md px-3 py-2 text-sm" value={form.status} onChange={(e) => handleChange('status', e.target.value as EmployeeStatus)}>
          <option value="active">Hoạt động</option>
          <option value="inactive">Tạm nghỉ</option>
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


