import { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import StationStaffSidebar from '@/components/StationStaff/StationStaffSidebar';
import { ArrowLeft, LogOut, LogIn, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { staffLogout } from '@/services/authService';

const StationStaffLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    // Use dedicated staff token to guard staff area
    const staffToken = localStorage.getItem('staff_token');
    if (!staffToken) {
      navigate('/StationStaff/login', { replace: true });
    } else if (location.pathname.toLowerCase() === '/stationstaff') {
      navigate('/StationStaff/vehicles', { replace: true });
    }
  }, [navigate, location.pathname]);

  const staff = useMemo(() => {
    const raw = localStorage.getItem('staff_user');
    if (!raw) return null;
    try { return JSON.parse(raw) as { staffName?: string } } catch { return null; }
  }, [location.key]);

  const handleLogout = () => {
    staffLogout();
    navigate('/StationStaff/login', { replace: true });
  };

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
        <div className="flex justify-between items-center p-4 border-b bg-white">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="border-gray-300 text-green-700 hover:bg-green-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Về trang chủ
          </Button>

          <div className="flex items-center gap-3">
            {staff ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <UserCircle2 className="w-5 h-5 text-gray-500" />
                  <span>{staff.staffName || 'Nhân viên'}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700">
                  <LogOut className="w-4 h-4 mr-1" /> Đăng xuất
                </Button>
              </>
            ) : (
              <Link to="/StationStaff/login" className="text-sm text-green-700 hover:underline flex items-center">
                <LogIn className="w-4 h-4 mr-1" /> Đăng nhập
              </Link>
            )}
          </div>
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
