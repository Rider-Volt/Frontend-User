import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, DollarSign, Users, Menu, X, Map, Calendar, Car, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { staffLogout } from '@/services/authService';

interface StationStaffSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const StationStaffSidebar = ({ isOpen, onToggle }: StationStaffSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationItems = [
    {
      name: 'Bảng điều khiển',
      href: '/',
      icon: LayoutDashboard,
      end: true
    },
    {
      name: 'Doanh thu',
      href: '/StationStaff/revenue',
      icon: DollarSign
    },
    {
      name: 'Quản lý điểm thuê',
      href: '/StationStaff/stations',
      icon: Map
    },
    {
      name: 'Quản lý xe điện',
      href: '/StationStaff/vehicles',
      icon: Car
    },
    {
      name: 'Quản lý đơn thuê',
      href: '/StationStaff/orders',
      icon: Calendar
    },
    {
      name: 'Khách hàng',
      href: '/StationStaff/customers',
      icon: Users
    },
    
  ];

  const onLogout = () => {
    staffLogout();
    navigate('/StationStaff/login', { replace: true });
  };

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
          <div key={item.name} className="relative group">
            <Link
              to={item.href}
              className={`flex items-center px-3 py-3 mb-2 rounded-lg text-sm font-medium transition-all duration-200 text-gray-700 hover:bg-green-50 hover:text-green-700`}
            >
              <item.icon className={`h-5 w-5 ${isOpen ? 'mr-3' : 'mx-auto'} flex-shrink-0`} />
              {isOpen && (
                <span className="truncate">{item.name}</span>
              )}
            </Link>
            {!isOpen && (
              <div className="absolute left-16 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                {item.name}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer with Logout */}
      <div className="absolute bottom-0 left-0 right-0">
        <button
          onClick={onLogout}
          className={`m-3 w-[calc(100%-1.5rem)] flex items-center ${isOpen ? 'justify-start' : 'justify-center'} px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition`}
        >
          <LogOut className={`h-5 w-5 ${isOpen ? 'mr-2' : ''}`} />
          {isOpen && <span>Đăng xuất</span>}
        </button>
        <div className="h-20 bg-gradient-to-t from-green-50 to-transparent pointer-events-none opacity-30" />
      </div>
    </div>
  );
};

export default StationStaffSidebar;