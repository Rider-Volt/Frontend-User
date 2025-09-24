import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CarSearchPage from "./pages/CarSearchPage";
import Bookings from "./pages/Bookings";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RentalPoints from "./pages/RentalPoints";
import NotFound from "./pages/NotFound";
import AdminLayout from '@/components/layout/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardMenu';

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
          <Route path="/rental-points" element={<RentalPoints />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
           <Route path="/admin" element={<AdminLayout />}>
           <Route path="dashboard" element={<AdminDashboardPage />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
