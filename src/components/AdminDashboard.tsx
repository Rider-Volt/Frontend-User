import { useState } from 'react';
import {
  DollarSign, Users, Car, CalendarCheck, Settings, Search, Edit, Trash2, UserCheck, UserX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DashboardStats {
  dailyRevenue: number;
  totalRentals: number;
  activeCustomers: number;
  evsInFleet: number;
  revenueChange: number;
  rentalChange: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended';
  joinDate: string;
  lastRental: string;
}

interface RentalStat {
  id: string;
  car: string;
  customer: string;
  date: string;
  duration: number;
  revenue: number;
  status: 'completed' | 'ongoing' | 'cancelled';
}

interface EV {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'rented' | 'maintenance';
  location: string;
  battery: number;
}

const AdminDashboard = () => {
  const [stats] = useState<DashboardStats>({
    dailyRevenue: 32000000,
    totalRentals: 87,
    activeCustomers: 1245,
    evsInFleet: 56,
    revenueChange: 8.2,
    rentalChange: 2.5
  });

  const [customers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Nguyen Van A',
      email: 'nguyenvana@email.com',
      status: 'active',
      joinDate: '2024-01-15',
      lastRental: '2024-09-20'
    },
    {
      id: '2',
      name: 'Tran Thi B',
      email: 'tranthib@email.com',
      status: 'suspended',
      joinDate: '2024-02-10',
      lastRental: '2024-08-28'
    }
  ]);

  const [rentalStats] = useState<RentalStat[]>([
    {
      id: '1',
      car: 'VinFast VF 8',
      customer: 'Nguyen Van A',
      date: '2024-09-24',
      duration: 3,
      revenue: 3600000,
      status: 'completed'
    },
    {
      id: '2',
      car: 'VinFast VF 5',
      customer: 'Tran Thi B',
      date: '2024-09-23',
      duration: 1,
      revenue: 1200000,
      status: 'ongoing'
    }
  ]);

  const [evs] = useState<EV[]>([
    {
      id: '1',
      name: 'VinFast VF 8',
      type: 'SUV',
      status: 'available',
      location: 'Quận 2, TP.HCM',
      battery: 92
    },
    {
      id: '2',
      name: 'VinFast VF 5',
      type: 'SUV',
      status: 'rented',
      location: 'Quận 7, TP.HCM',
      battery: 78
    }
  ]);

  const getStatusBadge = (status: Customer['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return null;
    }
  };

  const getRentalStatusBadge = (status: RentalStat['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'ongoing':
        return <Badge className="bg-blue-100 text-blue-800">Ongoing</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const getEVStatusBadge = (status: EV['status']) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'rented':
        return <Badge className="bg-blue-100 text-blue-800">Rented</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">EV Rental Admin Dashboard</h1>
            <p className="text-gray-600">Tổng quan hệ thống cho thuê xe điện</p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Cài đặt
            </Button>
            <Button>
              <CalendarCheck className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Doanh thu hôm nay</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.dailyRevenue.toLocaleString()}₫</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <span className="text-sm text-green-500 font-medium">+{stats.revenueChange}%</span>
                <span className="text-sm text-gray-500 ml-2">so với hôm qua</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lượt thuê xe</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalRentals}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <CalendarCheck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <span className="text-sm text-blue-500 font-medium">+{stats.rentalChange}%</span>
                <span className="text-sm text-gray-500 ml-2">so với hôm qua</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Khách hàng hoạt động</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeCustomers}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <span className="text-sm text-green-500 font-medium">+3.1%</span>
                <span className="text-sm text-gray-500 ml-2">tháng này</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Số xe điện</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.evsInFleet}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Car className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <span className="text-sm text-gray-500">Đang quản lý</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="rentals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rentals">Thống kê đơn thuê</TabsTrigger>
            <TabsTrigger value="customers">Quản lý khách hàng</TabsTrigger>
            <TabsTrigger value="evs">Quản lý xe điện</TabsTrigger>
          </TabsList>

          <TabsContent value="rentals">
            <Card>
              <CardHeader>
                <CardTitle>Đơn thuê gần đây</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Xe</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Ngày thuê</TableHead>
                      <TableHead>Thời gian (ngày)</TableHead>
                      <TableHead>Doanh thu</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rentalStats.map((stat) => (
                      <TableRow key={stat.id}>
                        <TableCell className="font-medium">{stat.car}</TableCell>
                        <TableCell>{stat.customer}</TableCell>
                        <TableCell>{stat.date}</TableCell>
                        <TableCell>{stat.duration}</TableCell>
                        <TableCell className="font-semibold">{stat.revenue.toLocaleString()}₫</TableCell>
                        <TableCell>{getRentalStatusBadge(stat.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Quản lý khách hàng</CardTitle>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input className="pl-10" placeholder="Tìm khách hàng..." />
                    </div>
                    <Button>Thêm khách hàng</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Lần thuê gần nhất</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{getStatusBadge(customer.status)}</TableCell>
                        <TableCell>{customer.lastRental}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            {customer.status === 'active' ? (
                              <Button variant="outline" size="sm">
                                <UserX className="h-3 w-3" />
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm">
                                <UserCheck className="h-3 w-3" />
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evs">
            <Card>
              <CardHeader>
                <CardTitle>Quản lý xe điện</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên xe</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Vị trí</TableHead>
                      <TableHead>Pin (%)</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evs.map((ev) => (
                      <TableRow key={ev.id}>
                        <TableCell className="font-medium">{ev.name}</TableCell>
                        <TableCell>{ev.type}</TableCell>
                        <TableCell>{ev.location}</TableCell>
                        <TableCell>{ev.battery}%</TableCell>
                        <TableCell>{getEVStatusBadge(ev.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
