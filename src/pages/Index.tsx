import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { Dashboard } from "@/components/Dashboard";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const Index = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<"home" | "dashboard">("home");

  // Redirect to dashboard if user is logged in and on home view
  if (user && currentView === "home" && !loading) {
    setCurrentView("dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="pt-20">
        {currentView === "home" ? (
          <HeroSection />
        ) : user ? (
          <Dashboard />
        ) : (
          <Navigate to="/auth" replace />
        )}
      </div>
    </div>
  );
};

export default Index;
