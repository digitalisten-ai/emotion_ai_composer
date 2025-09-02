import { Button } from "@/components/ui/button";
import { ArrowDown, Brain, Music, Sparkles, Camera } from "lucide-react";

export const Hero = () => {
  const scrollToDemo = () => {
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Icon decoration */}
          <div className="flex justify-center space-x-4 mb-8">
            <div className="p-3 rounded-full bg-card/50 border float-animation">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div className="p-3 rounded-full bg-card/50 border float-animation" style={{ animationDelay: "0.5s" }}>
              <Music className="h-8 w-8 text-primary" />
            </div>
            <div className="p-3 rounded-full bg-card/50 border float-animation" style={{ animationDelay: "1s" }}>
              <Camera className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="ai-gradient">Emotionell AI</span>
            <br />
            <span className="text-foreground">som förstår</span>
            <br />
            <span className="ai-gradient">dina känslor</span>
          </h1>
          
          {/* Description */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Avancerad AI som tolkar känslor i ansiktsbilder och spelar musik som matchar din sinnesstämning. 
            Byggd med transfer learning tränad på FER2013-datasetet.
          </p>
          
          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
            <div className="p-6 rounded-xl bg-card/30 border border-border/50 emotion-glow">
              <Brain className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">AI-driven Analys</h3>
              <p className="text-sm text-muted-foreground">
                Transfer learning på FER2013 dataset
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-card/30 border border-border/50 emotion-glow">
              <Music className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Musikalisk Matchning</h3>
              <p className="text-sm text-muted-foreground">
                Automatisk musikuppspelning baserat på identifierad känsla
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-card/30 border border-border/50 emotion-glow">
              <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Affärspotential</h3>
              <p className="text-sm text-muted-foreground">
                Revolutionerande för gaming, edtech och UX-design
              </p>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="pt-8">
            <Button 
              onClick={scrollToDemo}
              size="lg"
              className="text-lg px-8 py-4 emotion-glow"
            >
              <Camera className="h-5 w-5 mr-2" />
              Testa AI:n nu
              <ArrowDown className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ArrowDown className="h-6 w-6 text-muted-foreground" />
      </div>
    </section>
  );
};