import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import StationStaffSidebar from '@/components/StationStaff/StationStaffSidebar';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StationStaffLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
    //   navigate('/StationStaff/login', { replace: true });
    } else if (location.pathname === '/stationstaff') {
      navigate('/staionstaff/vehicles', { replace: true });
    }
  }, [navigate, location.pathname]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <StationStaffSidebar isOpen={isSidebarOpen} onToggle={handleToggleSidebar} />

      {/* Main content */}
      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? '16rem' : '4rem' }}
      >
        {/* Top Header with Back Button */}
        <div className="flex justify-end items-center p-4 border-b bg-white">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="border-gray-300 text-green-700 hover:bg-green-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Về trang chủ
          </Button>
        </div>

        {/* Nested Routes */}
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StationStaffLayout;
