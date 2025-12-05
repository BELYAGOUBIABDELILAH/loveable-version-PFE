
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NewIndex from "./pages/NewIndex";
import WhyPage from "./pages/WhyPage";
import HowPage from "./pages/HowPage";
import MapPage from "./pages/MapPage";
import ContactPage from "./pages/ContactPage";
import FavoritesPage from "./pages/FavoritesPage";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Import from "./pages/Import";
import SearchPage from "./pages/SearchPage";
import ProvidersPage from "./pages/ProvidersPage";
import Settings from "./pages/Settings";
import ManagePage from "./pages/ManagePage";
import AdminPage from "./pages/AdminPage";
import { Header } from "./components/layout/Header";
import FloatingSidebar from "./components/FloatingSidebar";
import EmergencyPage from "./pages/EmergencyPage";
import ProviderProfilePage from "./pages/ProviderProfilePage";
import ProviderRegister from "./pages/ProviderRegister";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserProfilePage from "./pages/UserProfilePage";
import AIChatWidget from "./components/AIChatWidget";
import { AIChatbot } from "./components/AIChatbot";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { seedProvidersIfNeeded } from "@/data/providers";

const queryClient = new QueryClient();

// Page transition wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <div className="transition-opacity duration-300 animate-fade-in">
      {children}
    </div>
  );
};

const SeedInit = () => { useEffect(() => { seedProvidersIfNeeded(50); }, []); return null; };

const AppRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <PageTransition>
            <NewIndex />
          </PageTransition>
        } 
      />
      <Route 
        path="/why" 
        element={
          <PageTransition>
            <WhyPage />
          </PageTransition>
        } 
      />
      <Route 
        path="/how" 
        element={
          <PageTransition>
            <HowPage />
          </PageTransition>
        } 
      />
      <Route 
        path="/manage" 
        element={
          <PageTransition>
            <ManagePage />
          </PageTransition>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <PageTransition>
            <Profile />
          </PageTransition>
        } 
      />
      <Route 
        path="/import" 
        element={
          <PageTransition>
            <Import />
          </PageTransition>
        } 
      />
      <Route 
        path="/search" 
        element={
          <PageTransition>
            <SearchPage />
          </PageTransition>
        } 
      />
      <Route 
        path="/providers" 
        element={
          <PageTransition>
            <ProvidersPage />
          </PageTransition>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <PageTransition>
            <Settings />
          </PageTransition>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <PageTransition>
            <AdminPage />
          </PageTransition>
        } 
      />
      <Route 
        path="/map" 
        element={
          <PageTransition>
            <MapPage />
          </PageTransition>
        } 
      />
      <Route 
        path="/contact" 
        element={
          <PageTransition>
            <ContactPage />
          </PageTransition>
        } 
      />
      <Route 
        path="/favorites" 
        element={
          <PageTransition>
            <FavoritesPage />
          </PageTransition>
        } 
      />
      <Route 
        path="/emergency" 
        element={
          <PageTransition>
            <EmergencyPage />
          </PageTransition>
        } 
      />
      <Route 
        path="/provider/:id" 
        element={
          <PageTransition>
            <ProviderProfilePage />
          </PageTransition>
        } 
      />
      <Route 
        path="/provider/register" 
        element={
          <PageTransition>
            <ProviderRegister />
          </PageTransition>
        } 
      />
      <Route 
        path="/provider/dashboard" 
        element={
          <PageTransition>
            <ProtectedRoute requireRole="provider">
              <ProviderDashboard />
            </ProtectedRoute>
          </PageTransition>
        } 
      />
      <Route 
        path="/admin/dashboard" 
        element={
          <PageTransition>
            <ProtectedRoute requireRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          </PageTransition>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <PageTransition>
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          </PageTransition>
        } 
      />
      <Route 
        path="*" 
        element={
          <PageTransition>
            <NotFound />
          </PageTransition>
        } 
      />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <SeedInit />
                <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10 animate-gradient">
                  <FloatingSidebar />
                  <AIChatbot />
                  <AppRoutes />
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
