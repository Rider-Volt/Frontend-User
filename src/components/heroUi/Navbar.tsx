import { Link, useNavigate } from "react-router-dom";
import { Car, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutApi } from "@/services/authService";
import { useEffect, useMemo, useState } from "react";

interface NavbarProps {
  isLoggedIn?: boolean;
  username?: string;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, username }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Tự đọc trạng thái đăng nhập từ localStorage nếu không truyền props
  const computedAuth = useMemo(() => {
    const token = localStorage.getItem("token");
    let name = "";
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        name = u.full_name || u.username || u.email || "";
      }
    } catch {}
    return { isLogged: !!token, name };
  }, []);

  const [internalIsLoggedIn, setInternalIsLoggedIn] = useState(
    isLoggedIn ?? computedAuth.isLogged
  );
  const [internalUsername, setInternalUsername] = useState(
    username ?? computedAuth.name
  );

  useEffect(() => {
    // Đồng bộ khi props thay đổi
    if (typeof isLoggedIn === "boolean") setInternalIsLoggedIn(isLoggedIn);
    if (typeof username === "string") setInternalUsername(username);
  }, [isLoggedIn, username]);

  useEffect(() => {
    // Theo dõi thay đổi localStorage (logout/login ở tab khác)
    const onStorage = () => {
      const token = !!localStorage.getItem("token");
      let name = "";
      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const u = JSON.parse(raw);
          name = u.full_name || u.username || u.email || "";
        }
      } catch {}
      setInternalIsLoggedIn(token);
      setInternalUsername(name);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogout = () => {
    // Optimistic logout: dọn local state và điều hướng ngay lập tức
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    // Gọi API ở hậu cảnh, không chặn UI
    logoutApi().catch((err) => console.error("Logout failed:", err));
  };

  return (
    <header className="bg-white shadow border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <div className="bg-primary p-2 rounded-xl">
            <Car className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-primary">EV Rental</span>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-foreground hover:text-primary font-medium">
            Trang chủ
          </Link>
          <Link to="/search" className="text-foreground hover:text-primary font-medium">
            Tìm xe
          </Link>
          
          
        </nav>

        {/* User actions */}
        <div className="flex items-center gap-3">
          {internalIsLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 font-medium hover:bg-accent/30 px-3 py-2 rounded-lg"
                >
                  👋 <span className="text-primary">{internalUsername || "Bạn"}</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-48 rounded-lg shadow-lg border bg-popover text-popover-foreground"
              >
                <DropdownMenuLabel>
                  Xin chào, <span className="font-semibold">{internalUsername || "Bạn"}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer hover:bg-accent/20"
                >
                  Trang cá nhân
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate("/Bookings")}
                  className="cursor-pointer hover:bg-accent/20"
                >
                  Lịch sử đặt xe
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 hover:bg-red-50"
                >
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-primary border-secondary"
                >
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-accent text-primary-foreground"
                >
                  Đăng ký
                </Button>
              </Link>
            </>
          )}
          {/* Mobile menu */}
          <DropdownMenu open={mobileOpen} onOpenChange={setMobileOpen}>
            <DropdownMenuTrigger asChild>
              <button className="md:hidden p-2 rounded-lg border" aria-label="Mở menu">
                <Menu className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-56">
              <DropdownMenuLabel>Menu</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/" onClick={() => setMobileOpen(false)}>Trang chủ</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/search" onClick={() => setMobileOpen(false)}>Tìm xe</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/Stations" onClick={() => setMobileOpen(false)}>Điểm thuê</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {internalIsLoggedIn ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" onClick={() => setMobileOpen(false)}>Trang cá nhân</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/Bookings" onClick={() => setMobileOpen(false)}>Lịch sử đặt xe</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setMobileOpen(false); handleLogout(); }} className="text-red-600">
                    Đăng xuất
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>Đăng nhập</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/register" onClick={() => setMobileOpen(false)}>Đăng ký</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
