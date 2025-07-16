import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Zap, Settings, Activity, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface NavigationProps {
  currentView: "home" | "dashboard";
  onViewChange: (view: "home" | "dashboard") => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

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
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleAuthAction}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleAuthAction}>
                  Connexion
                </Button>
                <Button variant="hero" size="sm" onClick={handleAuthAction}>
                  <User className="w-4 h-4 mr-2" />
                  Inscription
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}