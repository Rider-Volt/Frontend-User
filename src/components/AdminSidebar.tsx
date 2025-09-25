import { NavLink } from 'react-router-dom';
import { LayoutDashboard, DollarSign, Route, Bus, Users, Menu, X, Map, Calendar, Clock, UserCog, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const AdminSidebar = ({ isOpen, onToggle }: AdminSidebarProps) => {
  const navigationItems = [
    {
      name: 'Bảng điều khiển',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      end: true
    },
    {
      name: 'Doanh thu',
      href: '/admin/revenue',
      icon: DollarSign
    },
    {
      name: 'Quản lý điểm thuê',
      href: '/admin/',
      icon: Map
    },
    {
      name: 'quản lí xe điện',
      href: '/admin/provinces',
      icon: Car
    },
    {
      name: 'Quản lý đơn thuê',
      href: '/admin/buses',
      icon: Calendar
    },
    {
      name: 'Khách hàng',
      href: '/admin/customers',
      icon: Users
    },
    {
      name: 'Quản lý nhân viên',
      href: '/admin/tickets',
      icon: UserCog
    }
  ];

  return (
    <div className={`bg-white shadow-xl transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} fixed h-full z-20 border-r border-gray-200`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600">
        <div className="flex items-center justify-between">
          {isOpen && (
            <div>
              <h1 className="text-xl font-bold text-white">EV Rental</h1>
              <p className="text-sm text-green-100">Quản trị hệ thống</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-2 text-white hover:bg-green-600 rounded-lg"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6 px-3">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center px-3 py-3 mb-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-green-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
              }`
            }
          >
            <item.icon className={`h-5 w-5 ${isOpen ? 'mr-3' : 'mx-auto'} flex-shrink-0`} />
            {isOpen && (
              <span className="truncate">{item.name}</span>
            )}
            
            {/* Tooltip for collapsed state */}
            {!isOpen && (
              <div className="absolute left-16 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Background Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-green-50 to-transparent pointer-events-none opacity-30"></div>
    </div>
  );
};

export default AdminSidebar;