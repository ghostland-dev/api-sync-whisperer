import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface UserConnection {
  id: string;
  connection_name: string;
  api_providers: {
    name: string;
    icon: string;
  };
}

interface IntegrationBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function IntegrationBuilder({ open, onOpenChange, onSuccess }: IntegrationBuilderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (open && user) {
      fetchConnections();
    }
  }, [open, user]);

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('user_connections')
        .select(`
          id,
          connection_name,
          api_providers (
            name,
            icon
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'connected');

      if (error) throw error;
      setConnections(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger vos connexions",
        variant: "destructive",
      });
    } finally {
      setLoadingConnections(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const sourceConnectionId = formData.get('sourceConnection') as string;
    const targetConnectionId = formData.get('targetConnection') as string;
    const triggerType = formData.get('triggerType') as string;

    const triggerConfig = {
      type: triggerType,
      interval: triggerType === 'polling' ? 300 : null, // 5 minutes for polling
    };

    try {
      const { error } = await supabase
        .from('integrations')
        .insert({
          user_id: user?.id,
          name,
          description,
          source_connection_id: sourceConnectionId,
          target_connection_id: targetConnectionId,
          trigger_config: triggerConfig,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Intégration créée",
        description: "Votre workflow d'intégration a été configuré avec succès.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'intégration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-card border-border/50">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle intégration</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {loadingConnections ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : connections.length < 2 ? (
            <Card className="p-6 text-center bg-muted/50">
              <p className="text-muted-foreground">
                Vous devez avoir au moins 2 connexions API pour créer une intégration.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => onOpenChange(false)}
              >
                Créer des connexions
              </Button>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l'intégration</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Calendly vers Notion"
                    required
                    className="bg-input border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="triggerType">Type de déclencheur</Label>
                  <Select name="triggerType" defaultValue="webhook">
                    <SelectTrigger className="bg-input border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="webhook">Webhook</SelectItem>
                      <SelectItem value="polling">Polling (5 min)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Crée automatiquement une page Notion pour chaque nouveau rendez-vous Calendly"
                  className="bg-input border-border/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="space-y-2">
                  <Label htmlFor="sourceConnection">Source (Déclencheur)</Label>
                  <Select name="sourceConnection" required>
                    <SelectTrigger className="bg-input border-border/50">
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      {connections.map((connection) => (
                        <SelectItem key={connection.id} value={connection.id}>
                          <div className="flex items-center gap-2">
                            <span>{connection.api_providers.icon}</span>
                            {connection.connection_name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-6 h-6 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetConnection">Cible (Action)</Label>
                  <Select name="targetConnection" required>
                    <SelectTrigger className="bg-input border-border/50">
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      {connections.map((connection) => (
                        <SelectItem key={connection.id} value={connection.id}>
                          <div className="flex items-center gap-2">
                            <span>{connection.api_providers.icon}</span>
                            {connection.connection_name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                  variant="hero"
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Créer l'intégration
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}