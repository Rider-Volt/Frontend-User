// Hardcoded vehicle specs per model name. Extend this map as needed.

export type HardcodedSpecs = {
  seats?: number | string;
  transmission?: string;
  fuel?: string;
  consumption?: string;
  description?: string;
};

// Key by lowercased model name for flexible lookup
const MODEL_SPECS: Record<string, HardcodedSpecs> = {
  // Examples
  "vinfast vf3": { seats: 4, transmission: "Số tự động", fuel: "Điện", consumption: "Tiêu thụ ~13 kWh/100km", description: "VF 3 là mẫu mini EV linh hoạt trong phố, kích thước nhỏ gọn, tiết kiệm năng lượng và dễ lái." },
  "vinfast vf5": { seats: 5, transmission: "Số tự động", fuel: "Điện", consumption: "Tiêu thụ ~14 kWh/100km", description: "VF 5 hướng đến người dùng trẻ với thiết kế hiện đại, đủ chỗ cho 5 người và hành lý cơ bản." },
  "vinfast vf6": { seats: 5, transmission: "Số tự động", fuel: "Điện", consumption: "Tiêu thụ ~15 kWh/100km", description: "VF 6 thuộc phân khúc C-SUV điện, khoang nội thất rộng rãi, vận hành êm ái, phù hợp gia đình." },
  "vinfast vf7": { seats: 5, transmission: "Số tự động", fuel: "Điện", consumption: "Tiêu thụ ~16 kWh/100km", description: "VF 7 là SUV điện phong cách với nhiều công nghệ an toàn và trải nghiệm lái thú vị." },
  "vinfast vf8": { seats: 5, transmission: "Số tự động", fuel: "Điện", consumption: "Tiêu thụ ~18 kWh/100km", description: "VF 8 là SUV điện tầm trung, hiệu năng tốt, không gian rộng và nhiều tiện nghi cho chuyến đi dài." },
  "vinfast vf9": { seats: 7, transmission: "Số tự động", fuel: "Điện", consumption: "Tiêu thụ ~20 kWh/100km", description: "VF 9 là SUV 7 chỗ cao cấp, phù hợp gia đình đông người hoặc nhóm bạn, thoải mái cho hành trình xa." },
  "hyundai ioniq 5": { seats: 5, transmission: "Số tự động", fuel: "Điện", consumption: "Tiêu thụ ~21 kWh/100km", description: "Hyundai Ioniq 5 là SUV 5 chỗ cao cấp, phù hợp gia đình đông người hoặc nhóm bạn, thoải mái cho hành trình xa." },
  "Hyundai Ioniq 5": { seats: 5, transmission: "Số tự động", fuel: "Điện", consumption: "Tiêu thụ ~21 kWh/100km", description: "Hyundai Ioniq 5 là SUV 5 chỗ cao cấp, phù hợp gia đình đông người hoặc nhóm bạn, thoải mái cho hành trình xa." },
  "tesla3": {  seats: 5,  transmission: "Số tự động",  fuel: "Điện",  consumption: "Tiêu thụ ~14,5 kWh/100km",  description: "Tesla 3 là sedan điện hiện đại với khả năng tăng tốc mạnh mẽ, tầm hoạt động dài và nhiều tính năng hỗ trợ lái thông minh." },
"datbike quantum s1": { seats: 2, transmission: "Tự động", fuel: "Điện", consumption: "Tiêu thụ ~6.4 kWh/100km", description: "Quantum S1 là xe máy điện hiệu suất cao của Dat Bike, động cơ 7.000W, tầm hoạt động ~285 km mỗi lần sạc, tăng tốc nhanh và vận hành êm ái."},
"datbike quantum s2": { seats: 2, transmission: "Tự động ", fuel: "Điện", consumption: "Tiêu thụ ~6.4 kWh/100km ", description: "Quantum S2 là mẫu xe máy điện cao cấp của Dat Bike với động cơ 6 000 W, quãng đường lên tới ~285 km mỗi lần sạc, vận tốc tối đa khoảng 90km/h, nhiều tiện ích hiện đại phù hợp di chuyển đô thị và liên tục." },
"vinfast feliz s": {seats: 2,transmission: "Tự động",fuel: "Điện",consumption: "Tiêu thụ ~ 1.77 kWh/100km", description: "Feliz S là mẫu xe máy điện đô thị nhỏ gọn của VinFast với pin LFP 3.5 kWh, quãng đường lên đến ~198 km/lần sạc, tốc độ tối đa ~78 km/h, phù hợp di chuyển trong phố."},


  // Add other models below
};

function normalize(text: string | undefined | null): string {
  return (text || "").trim().toLowerCase();
}

export function getHardcodedSpecs(modelName?: string | null): HardcodedSpecs | undefined {
  const key = normalize(modelName);
  if (!key) return undefined;
  // direct match (normalized)
  if (MODEL_SPECS[key]) return MODEL_SPECS[key];
  // try partial contains by keys (normalize keys for comparison)
  const hit = Object.keys(MODEL_SPECS).find(k => {
    const normalizedKey = normalize(k);
    return key.includes(normalizedKey) || normalizedKey.includes(key);
  });
  return hit ? MODEL_SPECS[hit] : undefined;
}


