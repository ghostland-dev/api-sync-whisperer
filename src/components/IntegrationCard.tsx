import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Settings } from "lucide-react";

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: string;
  category: string;
  status: "active" | "inactive" | "connected";
  connectionCount?: number;
}

export function IntegrationCard({ 
  name, 
  description, 
  icon, 
  category, 
  status,
  connectionCount = 0
}: IntegrationCardProps) {
  const statusColor = {
    active: "bg-primary",
    inactive: "bg-muted",
    connected: "bg-accent"
  };

  const statusText = {
    active: "Actif",
    inactive: "Inactif", 
    connected: "Connecté"
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow-primary/20 group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-secondary flex items-center justify-center text-2xl">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          </div>
        </div>
        
        <Badge 
          className={`${statusColor[status]} text-white border-0`}
        >
          {statusText[status]}
        </Badge>
      </div>
      
      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
        {description}
      </p>
      
      {connectionCount > 0 && (
        <div className="text-sm text-muted-foreground mb-4">
          <span className="font-medium text-foreground">{connectionCount}</span> connexions actives
        </div>
      )}
      
      <div className="flex gap-2">
        {status === "connected" ? (
          <>
            <Button variant="default" size="sm" className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Gérer
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button variant="connect" size="sm" className="flex-1 group-hover:shadow-glow-accent">
            Connecter
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </div>
    </Card>
  );
}