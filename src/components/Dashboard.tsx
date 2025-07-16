import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IntegrationCard } from "./IntegrationCard";
import { ConnectionModal } from "./ConnectionModal";
import { IntegrationBuilder } from "./IntegrationBuilder";
import { Plus, Activity, Zap, Settings, Search, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface APIProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  auth_type: string;
  documentation_url: string;
}

interface UserConnection {
  id: string;
  connection_name: string;
  status: string;
  api_providers: APIProvider;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  run_count: number;
  success_count: number;
  source_connection: { api_providers: { name: string; icon: string } };
  target_connection: { api_providers: { name: string; icon: string } };
}

export function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [providers, setProviders] = useState<APIProvider[]>([]);
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<APIProvider | null>(null);
  const [connectionModalOpen, setConnectionModalOpen] = useState(false);
  const [integrationBuilderOpen, setIntegrationBuilderOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [providersRes, connectionsRes, integrationsRes] = await Promise.all([
        supabase.from('api_providers').select('*').eq('is_active', true),
        supabase.from('user_connections').select(`
          *,
          api_providers (*)
        `).eq('user_id', user?.id),
        supabase.from('integrations').select(`
          *,
          source_connection:user_connections!source_connection_id (
            api_providers (name, icon)
          ),
          target_connection:user_connections!target_connection_id (
            api_providers (name, icon)
          )
        `).eq('user_id', user?.id)
      ]);

      if (providersRes.error) throw providersRes.error;
      if (connectionsRes.error) throw connectionsRes.error;
      if (integrationsRes.error) throw integrationsRes.error;

      setProviders(providersRes.data);
      setConnections(connectionsRes.data);
      setIntegrations(integrationsRes.data);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (provider: APIProvider) => {
    setSelectedProvider(provider);
    setConnectionModalOpen(true);
  };

  const getConnectionForProvider = (providerId: string) => {
    return connections.find(conn => conn.api_providers.id === providerId);
  };

  const getProviderStatus = (provider: APIProvider): "active" | "inactive" | "connected" => {
    const connection = getConnectionForProvider(provider.id);
    if (!connection) return "inactive";
    return connection.status === "connected" ? "connected" : "active";
  };

  const getConnectionCount = (providerId: string) => {
    return connections.filter(conn => 
      conn.api_providers.id === providerId && conn.status === "connected"
    ).length;
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || 
                           provider.category === selectedCategory ||
                           (selectedCategory === "Connectés" && getConnectionForProvider(provider.id)) ||
                           (selectedCategory === "Actifs" && getProviderStatus(provider) === "active");
    return matchesSearch && matchesCategory;
  });

  const categories = ["Tous", "Connectés", "Actifs", ...Array.from(new Set(providers.map(p => p.category)))];
  
  const stats = {
    activeIntegrations: integrations.filter(i => i.is_active).length,
    totalConnections: connections.filter(c => c.status === "connected").length,
    totalRequests: integrations.reduce((sum, i) => sum + i.run_count, 0),
    successRate: integrations.length > 0 
      ? Math.round((integrations.reduce((sum, i) => sum + i.success_count, 0) / 
                   Math.max(integrations.reduce((sum, i) => sum + i.run_count, 0), 1)) * 100 * 10) / 10
      : 100
  };

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
              <Button 
                variant="hero" 
                size="sm"
                onClick={() => setIntegrationBuilderOpen(true)}
              >
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
                  <p className="text-2xl font-bold text-primary">{stats.activeIntegrations}</p>
                </div>
                <Activity className="w-8 h-8 text-primary" />
              </div>
            </Card>
            
            <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Connexions</p>
                  <p className="text-2xl font-bold text-accent">{stats.totalConnections}</p>
                </div>
                <Zap className="w-8 h-8 text-accent" />
              </div>
            </Card>
            
            <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taux de succès</p>
                  <p className="text-2xl font-bold text-primary">{stats.successRate}%</p>
                </div>
                <Badge className="bg-primary text-primary-foreground">↗</Badge>
              </div>
            </Card>
            
            <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total requêtes</p>
                  <p className="text-2xl font-bold text-accent">{stats.totalRequests}</p>
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Badge 
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-6 bg-card/50 backdrop-blur-sm border-border/50 animate-pulse">
                <div className="h-20 bg-muted/20 rounded mb-4"></div>
                <div className="h-4 bg-muted/20 rounded mb-2"></div>
                <div className="h-3 bg-muted/20 rounded"></div>
              </Card>
            ))
          ) : (
            filteredProviders.map((provider) => {
              const connection = getConnectionForProvider(provider.id);
              return (
                <IntegrationCard
                  key={provider.id}
                  name={provider.name}
                  description={provider.description}
                  icon={provider.icon}
                  category={provider.category}
                  status={getProviderStatus(provider)}
                  connectionCount={getConnectionCount(provider.id)}
                  onConnect={() => handleConnect(provider)}
                />
              );
            })
          )}
        </div>

        {/* Active Integrations */}
        {integrations.length > 0 && (
          <Card className="mt-8 p-6 bg-gradient-secondary border-border/50">
            <h3 className="text-xl font-semibold mb-4">Vos intégrations actives</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.slice(0, 3).map((integration) => (
                <Button key={integration.id} variant="glass" className="justify-start h-auto p-4">
                  <div className="text-left flex items-center gap-3 w-full">
                    <div className="flex items-center gap-1">
                      <span className="text-lg">{integration.source_connection.api_providers.icon}</span>
                      <span>→</span>
                      <span className="text-lg">{integration.target_connection.api_providers.icon}</span>
                    </div>
                    <div>
                      <div className="font-medium">{integration.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {integration.run_count} exécutions
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
              {integrations.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground">
                  <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Aucune intégration créée pour le moment
                </div>
              )}
            </div>
          </Card>
        )}

        <ConnectionModal
          provider={selectedProvider}
          open={connectionModalOpen}
          onOpenChange={setConnectionModalOpen}
          onSuccess={fetchData}
        />

        <IntegrationBuilder
          open={integrationBuilderOpen}
          onOpenChange={setIntegrationBuilderOpen}
          onSuccess={fetchData}
        />
      </div>
    </div>
  );
}