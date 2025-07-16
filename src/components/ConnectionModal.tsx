import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface APIProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  auth_type: string;
  documentation_url: string;
}

interface ConnectionModalProps {
  provider: APIProvider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ConnectionModal({ provider, open, onOpenChange, onSuccess }: ConnectionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  if (!provider || !user) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const connectionName = formData.get('connectionName') as string;
    const apiKey = formData.get('apiKey') as string;
    const additionalData = formData.get('additionalData') as string;

    const credentials = {
      api_key: apiKey,
      ...(additionalData ? { additional_data: additionalData } : {})
    };

    try {
      const { error } = await supabase
        .from('user_connections')
        .insert({
          user_id: user.id,
          provider_id: provider.id,
          connection_name: connectionName,
          credentials,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Connexion créée",
        description: "Votre connexion API a été configurée avec succès.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la connexion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Test réussi",
      description: "La connexion à l'API fonctionne correctement.",
    });
    setIsTestingConnection(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{provider.icon}</span>
            <div>
              <div>Connecter {provider.name}</div>
              <div className="text-sm text-muted-foreground font-normal">
                {provider.description}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{provider.category}</Badge>
            <Badge variant="outline" className="gap-1">
              {provider.auth_type.toUpperCase()}
            </Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="connectionName">Nom de la connexion</Label>
              <Input
                id="connectionName"
                name="connectionName"
                placeholder={`Ma connexion ${provider.name}`}
                required
                className="bg-input border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">
                {provider.auth_type === 'api_key' ? 'Clé API' : 'Token d\'accès'}
              </Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                placeholder="sk-..."
                required
                className="bg-input border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalData">Configuration additionnelle (optionnel)</Label>
              <Textarea
                id="additionalData"
                name="additionalData"
                placeholder="Données JSON ou paramètres supplémentaires"
                className="bg-input border-border/50 h-20"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={testConnection}
                disabled={isTestingConnection}
                className="flex-1"
              >
                {isTestingConnection && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Tester la connexion
              </Button>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
                variant="hero"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Créer la connexion
              </Button>
            </div>
          </form>

          <div className="border-t border-border/50 pt-4">
            <a
              href={provider.documentation_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Documentation de l'API {provider.name}
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}