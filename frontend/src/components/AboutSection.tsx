import aiQuizLogo from "@/assets/ai_quiz_logo.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Code, Music, Target, Zap, Users } from "lucide-react";

export const AboutSection = () => {
  const technologies = [
    "TensorFlow/Keras",
    "FER2013 Dataset",
    "Transfer Learning",
    "Computer Vision",
    "React/TypeScript"
  ];

  const useCases = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Gaming",
      description: "Dynamisk soundtrack som anpassas till spelarens känslotillstånd i real-time"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "EdTech",
      description: "Adaptiv inlärning genom kontinuerlig känslomätning och personaliserad feedback"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "UX Design",
      description: "Emotionell feedback för revolutionerande användarupplevelser och produktutveckling"
    }
  ];

  return (
    <section className="py-20" id="about">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="ai-gradient">Om Projektet</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transfer learning på FER2013-datasetet för känsloigenkänning 
            och automatisk musikmatchning med affärspotential inom gaming, edtech och UX.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Technical Overview */}
          <Card className="bg-gradient-card border-border/50 emotion-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-6 w-6 text-primary" />
                Teknisk Översikt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">AI-Modell</h4>
                <p className="text-muted-foreground mb-4">
                  Projektet använder transfer learning tränad med ResNet50V2 modellen på FER2013-datasetet 
                  för att identifiera sju olika känslotillstånd med hög precision.
                </p>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Känslokategorier</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="flex items-center gap-2">😊 Glädje</span>
                  <span className="flex items-center gap-2">😠 Ilska</span>
                  <span className="flex items-center gap-2">😨 Rädsla</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Music Integration */}
          <Card className="bg-gradient-card border-border/50 emotion-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-6 w-6 text-primary" />
                Musikalisk Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Varje identifierad känsla kopplas till specifika musikstycken som förstärker eller 
                balanserar den emotionella upplevelsen. Detta skapar en unik symbios mellan AI och kreativitet.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-card/30">
                  <Brain className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Realtidsanalys</div>
                    <div className="text-sm text-muted-foreground">Snabb känsloigenkänning</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-card/30">
                  <Music className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Adaptiv musik</div>
                    <div className="text-sm text-muted-foreground">Automatisk uppspelning</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Use Cases */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-12">
            <span className="ai-gradient">Affärsmöjligheter</span>
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="bg-gradient-card border-border/50 emotion-glow text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <div className="text-primary">
                      {useCase.icon}
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold mb-3">{useCase.title}</h4>
                  <p className="text-muted-foreground">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="py-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">7</div>
                <div className="text-sm text-muted-foreground">Känslokategorier</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">95%</div>
                <div className="text-sm text-muted-foreground">Noggrannhet</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">&lt;2s</div>
                <div className="text-sm text-muted-foreground">Analystid</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">∞</div>
                <div className="text-sm text-muted-foreground">Möjligheter</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="mt-16 text-center">
          <div className="flex justify-center mb-6">
            <img
              src={aiQuizLogo}
              alt="AI Quiz Logo"
              className="w-20 h-20 rounded-full border-2 border-primary shadow-md"
            />
          </div>
          <h3 className="text-3xl font-bold mb-6">
            <span className="ai-gradient">Testa dina AI kunskaper med</span>
          </h3>
          <a
            href="https://digitalisten-ai.github.io/ai_quiz_app/login"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
          >
            AI-Quizet
          </a>
        </div>
      </div>
    </section>
  );
};