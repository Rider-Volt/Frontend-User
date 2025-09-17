import { Button } from "@/components/ui/button";
import { Search, MapPin, Zap, Clock, Car } from "lucide-react";
import { Link } from "react-router-dom";
// import heroImage from "@/assets/hero-ev.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img 
          src="https://vinfast.vn/wp-content/uploads/2023/03/VF8-Hero-1.jpg" 
          alt="VinFast Electric Vehicle" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-primary/20" />
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 opacity-30">
        <div className="w-32 h-32 bg-electric-gradient rounded-full blur-3xl" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-30">
        <div className="w-24 h-24 bg-energy-gradient rounded-full blur-2xl" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Thuê xe điện
            <span className="block bg-electric-gradient bg-clip-text text-transparent">
              Tương lai xanh
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Trải nghiệm công nghệ xe điện tiên tiến. 
            Đặt xe nhanh chóng, thuận tiện và thân thiện với môi trường.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/vehicles">
              <Button variant="electric" size="lg" className="text-lg px-8 py-6">
                <Search className="w-5 h-5 mr-2" />
                Tìm xe ngay
              </Button>
            </Link>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-glass/60 backdrop-blur-sm rounded-xl p-6 border border-glass-border">
              <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Sạc nhanh</h3>
              <p className="text-sm text-muted-foreground">Mạng lưới sạc rộng khắp thành phố</p>
            </div>
            
            <div className="bg-glass/60 backdrop-blur-sm rounded-xl p-6 border border-glass-border">
              <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">24/7 hỗ trợ</h3>
              <p className="text-sm text-muted-foreground">Đặt xe bất cứ lúc nào, hỗ trợ tận tình</p>
            </div>
            
            <div className="bg-glass/60 backdrop-blur-sm rounded-xl p-6 border border-glass-border">
              <Car className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Đa dạng xe</h3>
              <p className="text-sm text-muted-foreground">Từ xe đô thị đến SUV cao cấp</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};