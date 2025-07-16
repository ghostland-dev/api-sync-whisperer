import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Link } from "lucide-react";
import heroImage from "@/assets/hero-api-connections.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-hero" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glass-bg backdrop-blur-glass border border-glass-border">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Connectez vos APIs en quelques clics</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          API Glue
        </h1>
        
        <p className="text-xl md:text-2xl mb-4 text-muted-foreground max-w-3xl mx-auto">
          La plateforme ultime pour connecter vos outils préférés
        </p>
        
        <p className="text-lg mb-12 text-muted-foreground/80 max-w-2xl mx-auto">
          Calendly • Notion • Slack • GitHub • et bien plus encore
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="hero" size="lg" className="text-lg px-8 py-4">
            Commencer gratuitement
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <Button variant="glass" size="lg" className="text-lg px-8 py-4">
            <Link className="mr-2 w-5 h-5" />
            Voir les intégrations
          </Button>
        </div>
        
        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">50+</div>
            <div className="text-muted-foreground">APIs supportées</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">99.9%</div>
            <div className="text-muted-foreground">Uptime garanti</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">10k+</div>
            <div className="text-muted-foreground">Connexions actives</div>
          </div>
        </div>
      </div>
    </section>
  );
}