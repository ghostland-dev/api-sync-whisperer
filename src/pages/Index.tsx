import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const [currentView, setCurrentView] = useState<"home" | "dashboard">("home");

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="pt-20">
        {currentView === "home" ? (
          <HeroSection />
        ) : (
          <Dashboard />
        )}
      </div>
    </div>
  );
};

export default Index;
