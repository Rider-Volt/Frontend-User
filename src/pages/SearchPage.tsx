import { useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { getRentalPoints } from "@/services/stationServices";

const SearchPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const searchLocation = params.get("location")?.toLowerCase() || "";
  const startDate = params.get("startDate") || "";
  const endDate = params.get("endDate") || "";
  const vehicleType = params.get("vehicleType") || "";

  const [points, setPoints] = useState([]);

  useEffect(() => {
    getRentalPoints().then(setPoints);
  }, []);

  const filteredPoints = useMemo(() => {
    return points.filter((p) => {
      const matchLocation = !searchLocation || p.address.toLowerCase().includes(searchLocation) || p.district.toLowerCase().includes(searchLocation);
      // Nếu có lọc theo loại xe thì thêm điều kiện ở đây
      return matchLocation;
    });
  }, [points, searchLocation]);

  return (
    <div>
      {/* Hiển thị danh sách trạm/xe đã lọc */}
      {filteredPoints.map((p) => (
        <div key={p.id}>
          <div>{p.name}</div>
          <div>{p.address}, {p.district}, {p.city}</div>
        </div>
      ))}
    </div>
  );
};

export default SearchPage;