import { Button } from "@/components/ui/button";
import { Car, User, Menu, Calendar, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const location = useLocation();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-glass/95 backdrop-blur-md border-b border-glass-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-electric-gradient p-2 rounded-lg">
            <Car className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-electric-gradient bg-clip-text text-transparent">
            VinFast Rental
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className={`transition-smooth ${
              location.pathname === "/" 
                ? "text-primary font-medium" 
                : "text-foreground hover:text-primary"
            }`}
          >
            Trang chủ
          </Link>
          <Link 
            to="/bookings" 
            className={`transition-smooth ${
              location.pathname === "/bookings" 
                ? "text-primary font-medium" 
                : "text-foreground hover:text-primary"
            }`}
          >
            Đặt xe của tôi
          </Link>
          <Link 
            to="/vehicles" 
            className={`transition-smooth ${
              location.pathname === "/vehicles" 
                ? "text-primary font-medium" 
                : "text-foreground hover:text-primary"
            }`}
          >
            Danh sách xe
          </Link>
        </nav>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
          <Link to="/login">
            <Button variant="outline" size="sm">
              <User className="w-4 h-4 mr-2" />
              Đăng nhập
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="electric" size="sm">
              Đăng ký
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};