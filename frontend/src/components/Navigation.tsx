import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Menu, X } from "lucide-react";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  const navItems = [
    { label: "Demo", id: "demo" },
    { label: "Om Projektet", id: "about" },
    { label: "Kontakt", id: "contact" },
    { label: "AI-Quiz", url: "https://digitalisten-ai.github.io/ai_quiz_app/login" }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => scrollToSection("hero")}
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-lg ai-gradient">EmotionAI</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              item.url ? (
                <a
                  key={item.label}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </button>
              )
            ))}
            <Button 
              onClick={() => scrollToSection("demo")}
              size="sm"
              className="ml-4"
            >
              Testa Nu
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border/50 py-4">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                item.url ? (
                  <a
                    key={item.label}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left text-muted-foreground hover:text-primary transition-colors py-2"
                  >
                    {item.label}
                  </a>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-left text-muted-foreground hover:text-primary transition-colors py-2"
                  >
                    {item.label}
                  </button>
                )
              ))}
              <Button 
                onClick={() => scrollToSection("demo")}
                size="sm"
                className="w-fit mt-2"
              >
                Testa Nu
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};