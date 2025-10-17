import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CarSearchPage from "./pages/CarSearchPage";
import Bookings from "./pages/Bookings";
import VehicleDetailsPage from "./pages/VehicleDetailsPage";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StationsPage from "./pages/StationsPage";
import NotFound from "./pages/NotFound";
import AdminLayout from '@/components/layout/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardMenu';
import AdminRevenuePage from './pages/AdminRevenuePage';
import AdminVehiclesPage from './pages/AdminVehiclesPage';
import AdminCustomersPage from './pages/AdminCustomersPage';
import AdminStationsPage from './pages/AdminStationsPage';
import AdminEmployeesPage from './pages/AdminEmployeesPage';
import StationStaffLayout from '@/components/layout/StationStaffLayout';
import StationStaffVehiclesPage from './pages/StationStaffVehiclesPage'; 
import StationStaffOrders from '@/components/StationStaff/StationStaffOrders';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<CarSearchPage />} />
          <Route path="/Stations" element={<StationsPage />} />
          <Route path="/Bookings" element={<Bookings />} />
          <Route path="/vehicle/:id" element={<VehicleDetailsPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ADMIN ROUTES */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="revenue" element={<AdminRevenuePage />} />
            <Route path="vehicles" element={<AdminVehiclesPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="stations" element={<AdminStationsPage />} />
            <Route path="employees" element={<AdminEmployeesPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* STATION STAFF ROUTES  */}
          <Route path="/StationStaff" element={<StationStaffLayout />}>
            <Route path="vehicles" element={<StationStaffVehiclesPage />} />
            <Route path="orders" element={<StationStaffOrders />} />
          </Route>

          {/* CATCH ALL */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
