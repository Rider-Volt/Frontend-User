export interface VehicleData {
  id: number;
  name: string;
  model?: string;
  type: string;
  batteryLevel: number;
  range: number;
  pricePerDay: number;
  pricePerHour?: number;
  location: string;
  image?: string;
  imageUrl?: string;
  available: boolean;
  status?: string;
  stationId?: number | null;
  licensePlate?: string;
  features?: {
    seats: number;
    transmission: string;
    fuel: string;
    consumption: string;
  };
  description?: string;
  fullAddress?: string;
}

/* Hard-coded mock vehicles kept for offline reference.
export const vehiclesData: VehicleData[] = [
  {
    id: 1,
    name: "VinFast VF e34",
    model: "VinFast VF e34",
    type: "Ô tô điện",
    batteryLevel: 85,
    range: 300,
    pricePerDay: 600000,
    location: "Quận 1, TP.HCM",
    image: "/images/imagecar/e34.jpg",
    available: true,
    features: {
      seats: 5,
      transmission: "Số tự động",
      fuel: "Điện",
      consumption: "0l/100km",
    },
    description:
      "Xe điện cao cấp với thiết kế hiện đại, phù hợp cho việc di chuyển trong thành phố và các chuyến đi dài. Được trang bị công nghệ tiên tiến và tiết kiệm năng lượng.",
    fullAddress: "Quận 1, TP.HCM",
  },
  {
    id: 2,
    name: "VinFast VF 3",
    model: "VinFast VF 3",
    type: "Ô tô điện",
    batteryLevel: 92,
    range: 450,
    pricePerDay: 1200000,
    location: "Quận 2, TP.HCM",
    image: "/images/imagecar/vf3.jpg",
    available: true,
    features: {
      seats: 5,
      transmission: "Số tự động",
      fuel: "Điện",
      consumption: "0l/100km",
    },
    description:
      "VinFast VF 3 là mẫu xe điện thông minh với công nghệ AI tiên tiến, phù hợp cho gia đình hiện đại.",
    fullAddress: "123 Đường Nguyễn Văn Cừ, Quận 2, TP.HCM",
  },
  {
    id: 3,
    name: "VinFast VF 5",
    model: "VinFast VF 5",
    type: "Ô tô điện",
    batteryLevel: 78,
    range: 380,
    pricePerDay: 960000,
    location: "Quận 7, TP.HCM",
    image: "/images/imagecar/vf5.jpg",
    available: false,
    features: {
      seats: 7,
      transmission: "Số tự động",
      fuel: "Điện",
      consumption: "0l/100km",
    },
    description:
      "VinFast VF 5 là SUV điện 7 chỗ với không gian rộng rãi, lý tưởng cho gia đình đông người.",
    fullAddress: "456 Đường Huỳnh Tấn Phát, Quận 7, TP.HCM",
  },
  {
    id: 4,
    name: "VinFast VF 6",
    model: "VinFast VF 6",
    type: "Ô tô điện",
    batteryLevel: 88,
    range: 420,
    pricePerDay: 1080000,
    location: "Quận 3, TP.HCM",
    image: "/images/imagecar/vf6.jpg",
    available: true,
    features: {
      seats: 5,
      transmission: "Số tự động",
      fuel: "Điện",
      consumption: "0l/100km",
    },
    description: "Mẫu crossover điện đa dụng với thiết kế trẻ trung và nội thất cao cấp.",
    fullAddress: "98 Trần Quốc Thảo, Quận 3, TP.HCM",
  },
  {
    id: 5,
    name: "VinFast VF 7",
    model: "VinFast VF 7",
    type: "Ô tô điện",
    batteryLevel: 90,
    range: 450,
    pricePerDay: 1350000,
    location: "Quận 1, TP.HCM",
    image: "/images/imagecar/vf7.jpg",
    available: true,
    features: {
      seats: 5,
      transmission: "Số tự động",
      fuel: "Điện",
      consumption: "0l/100km",
    },
    description:
      "VinFast VF 7 mang đến trải nghiệm lái thể thao với hệ dẫn động mạnh mẽ và các công nghệ hỗ trợ tiên tiến.",
    fullAddress: "22 Lê Lợi, Quận 1, TP.HCM",
  },
  {
    id: 6,
    name: "VinFast VF 7 Plus",
    model: "VinFast VF 7 Plus",
    type: "Ô tô điện",
    batteryLevel: 88,
    range: 470,
    pricePerDay: 1490000,
    location: "Quận 1, TP.HCM",
    image: "/images/imagecar/vf7.jpg",
    available: true,
    features: {
      seats: 5,
      transmission: "Số tự động",
      fuel: "Điện",
      consumption: "0l/100km",
    },
    description:
      "Phiên bản cao cấp của VF 7 với nội thất sang trọng, hệ thống âm thanh cao cấp và gói an toàn nâng cao.",
    fullAddress: "22 Lê Lợi, Quận 1, TP.HCM",
  },
  {
    id: 7,
    name: "VinFast VF 8 Eco",
    model: "VinFast VF 8 Eco",
    type: "Ô tô điện",
    batteryLevel: 82,
    range: 420,
    pricePerDay: 1600000,
    location: "Quận 5, TP.HCM",
    image: "/images/imagecar/vf8.jpg",
    available: true,
    features: {
      seats: 5,
      transmission: "Số tự động",
      fuel: "Điện",
      consumption: "0l/100km",
    },
    description:
      "Phiên bản Eco cân bằng giữa hiệu năng và mức giá, phù hợp cho đô thị và đường dài.",
    fullAddress: "215 Trần Hưng Đạo, Quận 5, TP.HCM",
  },
  {
    id: 8,
    name: "VinFast VF 8 Plus",
    model: "VinFast VF 8 Plus",
    type: "Ô tô điện",
    batteryLevel: 86,
    range: 460,
    pricePerDay: 1850000,
    location: "Quận 7, TP.HCM",
    image: "/images/imagecar/vf8.jpg",
    available: true,
    features: {
      seats: 5,
      transmission: "Số tự động",
      fuel: "Điện",
      consumption: "0l/100km",
    },
    description:
      "Bản Plus với hệ thống treo thích ứng, ghế massage và đầy đủ tiện nghi cao cấp.",
    fullAddress: "789 Nguyễn Văn Linh, Quận 7, TP.HCM",
  },
  {
    id: 9,
    name: "VinFast VF 9",
    model: "VinFast VF 9",
    type: "Ô tô điện",
    batteryLevel: 90,
    range: 520,
    pricePerDay: 2100000,
    location: "Thủ Đức, TP.HCM",
    image: "/images/imagecar/vf9.jpg",
    available: true,
    features: {
      seats: 7,
      transmission: "Số tự động",
      fuel: "Điện",
      consumption: "0l/100km",
    },
    description:
      "SUV 7 chỗ cao cấp với tầm hoạt động dài, phù hợp cho chuyến đi gia đình hoặc doanh nhân.",
    fullAddress: "Đại lộ Phạm Văn Đồng, Thủ Đức, TP.HCM",
  },
  {
    id: 10,
    name: "VinFast VF 9 Plus",
    model: "VinFast VF 9 Plus",
    type: "Ô tô điện",
    batteryLevel: 92,
    range: 550,
    pricePerDay: 2350000,
    location: "Thủ Đức, TP.HCM",
    image: "/images/imagecar/vf9.jpg",
    available: true,
    features: {
      seats: 7,
      transmission: "Số tự động",
      fuel: "Điện",
      consumption: "0l/100km",
    },
    description:
      "Phiên bản cao cấp nhất của VF 9 với nội thất bọc da cao cấp, điều hòa độc lập, hệ thống giải trí dành cho hàng ghế sau.",
    fullAddress: "Đại lộ Phạm Văn Đồng, Thủ Đức, TP.HCM",
  },
  {
    id: 11,
    name: "VinFast Feliz",
    model: "VinFast Feliz",
    type: "Xe máy điện",
    batteryLevel: 80,
    range: 90,
    pricePerDay: 120000,
    location: "Quận 1, TP.HCM",
    image: "/images/imagecar/feliz.jpg",
    available: true,
    features: {
      seats: 2,
      transmission: "Tự động",
      fuel: "Điện",
      consumption: "0l/100km",
    },
    description: "Xe máy điện đô thị nhỏ gọn, dễ điều khiển và tiết kiệm chi phí.",
    fullAddress: "45 Nguyễn Du, Quận 1, TP.HCM",
  },
  {
    id: 12,
    name: "VinFast Klara Neo",
    model: "VinFast Klara Neo",
    type: "Xe máy điện",
    batteryLevel: 82,
    range: 110,
    pricePerDay: 140000,
    location: "Quận 1, TP.HCM",
    image: "/images/imagecar/klaraneo.jpg",
    available: true,
    features: {
      seats: 2,
      transmission: "Tự động",
      fuel: "Điện",
      consumption: "0l/100km",
    },
    description: "Mẫu xe máy điện phổ thông với thiết kế thanh lịch và pin bền bỉ.",
    fullAddress: "45 Nguyễn Du, Quận 1, TP.HCM",
  },
  {
    id: 13,
    name: "VinFast Evo Neo",
    model: "VinFast Evo Neo",
    type: "Xe máy điện",
    batteryLevel: 78,
    range: 95,
    pricePerDay: 130000,
    location: "Quận Bình Thạnh, TP.HCM",
    image: "/images/imagecar/evoneo.jpg",
    available: true,
    features: {
      seats: 2,
      transmission: "Tự động",
      fuel: "Điện",
      consumption: "0l/100km",
    },
    description: "Phong cách hiện đại, thao tác dễ dàng và phù hợp mọi đối tượng.",
    fullAddress: "120 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM",
  },
  {
    id: 14,
    name: "VinFast Evo Grand",
    model: "VinFast Evo Grand",
    type: "Xe máy điện",
    batteryLevel: 88,
    range: 85,
    pricePerDay: 140000,
    location: "Quận 3, TP.HCM",
    image: "/images/imagecar/evogrand.jpg",
    available: true,
    features: {
      seats: 2,
      transmission: "Tự động",
      fuel: "Điện",
      consumption: "0l/100km",
    },
    description: "Thiết kế hiện đại, vận hành êm ái và bền bỉ.",
    fullAddress: "45 Võ Văn Tần, Quận 3, TP.HCM",
  },
  {
    id: 15,
    name: "VinFast Vento Neo",
    model: "VinFast Vento Neo",
    type: "Xe máy điện",
    batteryLevel: 92,
    range: 90,
    pricePerDay: 150000,
    location: "Quận 1, TP.HCM",
    image: "/images/imagecar/ventoneo.jpg",
    available: true,
    features: {
      seats: 2,
      transmission: "Tự động",
      fuel: "Điện",
      consumption: "0l/100km",
    },
    description: "VinFast Vento Neo cao cấp với hiệu năng tốt, phù hợp di chuyển linh hoạt.",
    fullAddress: "90 Lê Lợi, Quận 1, TP.HCM",
  },
];
*/

export const vehiclesData: VehicleData[] = [];
