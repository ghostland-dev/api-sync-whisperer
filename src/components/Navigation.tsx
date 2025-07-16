import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Zap, Settings, Activity, User } from "lucide-react";

interface NavigationProps {
  currentView: "home" | "dashboard";
  onViewChange: (view: "home" | "dashboard") => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">API Glue</span>
            <Badge variant="secondary" className="text-xs">
              Beta
            </Badge>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant={currentView === "home" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewChange("home")}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Accueil
            </Button>
            
            <Button
              variant={currentView === "dashboard" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewChange("dashboard")}
              className="gap-2"
            >
              <Activity className="w-4 h-4" />
              Dashboard
            </Button>
            
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Paramètres
            </Button>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              Connexion
            </Button>
            <Button variant="hero" size="sm">
              <User className="w-4 h-4 mr-2" />
              Inscription
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}