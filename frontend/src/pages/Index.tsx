import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { EmotionAnalyzer } from "@/components/EmotionAnalyzer";
import { AboutSection } from "@/components/AboutSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main>
        <section id="hero">
          <Hero />
        </section>
        
        <section id="demo" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="ai-gradient">Testa AI:n Live</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Upplev kraften i emotionell AI genom att ladda upp en bild eller ta ett foto
              </p>
            </div>
            <EmotionAnalyzer />
          </div>
        </section>
        
        <AboutSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
