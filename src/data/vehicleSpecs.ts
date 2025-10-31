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
  "vinfast vf3": { seats: 4, transmission: "1 cấp (EV)", fuel: "Điện", consumption: "Tiêu thụ ~13 kWh/100km", description: "VF 3 là mẫu mini EV linh hoạt trong phố, kích thước nhỏ gọn, tiết kiệm năng lượng và dễ lái." },
  "vinfast vf5": { seats: 5, transmission: "1 cấp (EV)", fuel: "Điện", consumption: "~14 kWh/100km", description: "VF 5 hướng đến người dùng trẻ với thiết kế hiện đại, đủ chỗ cho 5 người và hành lý cơ bản." },
  "vinfast vf6": { seats: 5, transmission: "1 cấp (EV)", fuel: "Điện", consumption: "~15 kWh/100km", description: "VF 6 thuộc phân khúc C-SUV điện, khoang nội thất rộng rãi, vận hành êm ái, phù hợp gia đình." },
  "vinfast vf7": { seats: 5, transmission: "1 cấp (EV)", fuel: "Điện", consumption: "~16 kWh/100km", description: "VF 7 là SUV điện phong cách với nhiều công nghệ an toàn và trải nghiệm lái thú vị." },
  "vinfast vf8": { seats: 5, transmission: "1 cấp (EV)", fuel: "Điện", consumption: "~18 kWh/100km", description: "VF 8 là SUV điện tầm trung, hiệu năng tốt, không gian rộng và nhiều tiện nghi cho chuyến đi dài." },
  "vinfast vf9": { seats: 7, transmission: "1 cấp (EV)", fuel: "Điện", consumption: "~20 kWh/100km", description: "VF 9 là SUV 7 chỗ cao cấp, phù hợp gia đình đông người hoặc nhóm bạn, thoải mái cho hành trình xa." },
  // Add other models below
};

function normalize(text: string | undefined | null): string {
  return (text || "").trim().toLowerCase();
}

export function getHardcodedSpecs(modelName?: string | null): HardcodedSpecs | undefined {
  const key = normalize(modelName);
  if (!key) return undefined;
  // direct match
  if (MODEL_SPECS[key]) return MODEL_SPECS[key];
  // try partial contains by keys
  const hit = Object.keys(MODEL_SPECS).find(k => key.includes(k));
  return hit ? MODEL_SPECS[hit] : undefined;
}


