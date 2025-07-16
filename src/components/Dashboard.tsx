import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IntegrationCard } from "./IntegrationCard";
import { Plus, Activity, Zap, Settings, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Dashboard() {
  const integrations = [
    {
      name: "Calendly",
      description: "Synchronisez vos rendez-vous avec vos outils de productivité",
      icon: "📅",
      category: "Calendrier",
      status: "connected" as const,
      connectionCount: 3
    },
    {
      name: "Notion",
      description: "Automatisez la création de pages et la gestion de bases de données",
      icon: "📝",
      category: "Productivité",
      status: "connected" as const,
      connectionCount: 2
    },
    {
      name: "Slack",
      description: "Envoyez des notifications et gérez les conversations",
      icon: "💬",
      category: "Communication",
      status: "active" as const,
      connectionCount: 5
    },
    {
      name: "GitHub",
      description: "Automatisez vos workflows de développement",
      icon: "🔧",
      category: "Développement",
      status: "inactive" as const
    },
    {
      name: "Stripe",
      description: "Gérez les paiements et les abonnements automatiquement",
      icon: "💳",
      category: "Paiement",
      status: "inactive" as const
    },
    {
      name: "Mailchimp",
      description: "Synchronisez vos contacts et campagnes email",
      icon: "📧",
      category: "Marketing",
      status: "inactive" as const
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Gérez vos intégrations API en temps réel
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </Button>
              <Button variant="hero" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle intégration
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Intégrations actives</p>
                  <p className="text-2xl font-bold text-primary">12</p>
                </div>
                <Activity className="w-8 h-8 text-primary" />
              </div>
            </Card>
            
            <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Requêtes ce mois</p>
                  <p className="text-2xl font-bold text-accent">2.4k</p>
                </div>
                <Zap className="w-8 h-8 text-accent" />
              </div>
            </Card>
            
            <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taux de succès</p>
                  <p className="text-2xl font-bold text-primary">99.2%</p>
                </div>
                <Badge className="bg-primary text-primary-foreground">↗</Badge>
              </div>
            </Card>
            
            <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Latence moyenne</p>
                  <p className="text-2xl font-bold text-accent">245ms</p>
                </div>
                <Badge className="bg-accent text-accent-foreground">✓</Badge>
              </div>
            </Card>
          </div>

          {/* Search and filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Rechercher une intégration..." 
                className="pl-10 bg-card/50 border-border/50"
              />
            </div>
            
            <div className="flex gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                Tous
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                Connectés
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                Actifs
              </Badge>
            </div>
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration, index) => (
            <IntegrationCard
              key={index}
              {...integration}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8 p-6 bg-gradient-secondary border-border/50">
          <h3 className="text-xl font-semibold mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="glass" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Calendly → Notion</div>
                <div className="text-sm text-muted-foreground">Créer une page pour chaque RDV</div>
              </div>
            </Button>
            
            <Button variant="glass" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Stripe → Slack</div>
                <div className="text-sm text-muted-foreground">Notification nouveau paiement</div>
              </div>
            </Button>
            
            <Button variant="glass" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">GitHub → Notion</div>
                <div className="text-sm text-muted-foreground">Sync issues vers base de données</div>
              </div>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}