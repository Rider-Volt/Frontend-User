import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EV</span>
              </div>
              <span className="text-xl font-bold">EV Rental</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Dịch vụ cho thuê xe điện hàng đầu Việt Nam. 
              Cam kết mang đến trải nghiệm di chuyển xanh, 
              tiết kiệm và thân thiện với môi trường.
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-300 hover:text-green-400 transition-colors text-sm"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link 
                  to="/search" 
                  className="text-gray-300 hover:text-green-400 transition-colors text-sm"
                >
                  Tìm xe
                </Link>
              </li>
              <li>
                <Link 
                  to="/bookings" 
                  className="text-gray-300 hover:text-green-400 transition-colors text-sm"
                >
                  Đặt xe của tôi
                </Link>
              </li>
              <li>
                <Link 
                  to="/profile" 
                  className="text-gray-300 hover:text-green-400 transition-colors text-sm"
                >
                  Tài khoản
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dịch vụ</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-300 text-sm">Thuê xe điện</span>
              </li>
              <li>
                <span className="text-gray-300 text-sm">Thuê xe máy điện</span>
              </li>
              <li>
                <span className="text-gray-300 text-sm">Bảo hiểm thuê xe</span>
              </li>
              <li>
                <span className="text-gray-300 text-sm">Hỗ trợ 24/7</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">
                  123 Đường ABC, Quận XYZ, TP.HCM
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">
                  Hotline: 1900 1234
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">
                  support@evrental.vn
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 EV Rental. 
            </p>
            <div className="flex gap-6">
              <Link 
                to="/privacy" 
                className="text-gray-400 hover:text-green-400 transition-colors text-sm"
              >
               
              </Link>
              <Link 
                to="/terms" 
                className="text-gray-400 hover:text-green-400 transition-colors text-sm"
              >
               
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
