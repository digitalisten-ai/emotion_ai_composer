import { Brain, Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="py-12 border-t border-border/50" id="contact">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <span className="font-bold text-lg ai-gradient">EmotionAI</span>
            </div>
            <p className="text-muted-foreground">
              Revolutionerande AI som förstår mänskliga känslor och skapar musikaliska upplevelser.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Kontakt</h3>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Intresserad av samarbete eller har frågor?
              </p>
              <div className="flex gap-2">
                <a
                  href="mailto:digitalisten.ai@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={-1}
                >
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    E-post
                  </Button>
                </a>
                <a
                  href="https://www.linkedin.com/in/gabriel-ord%C3%B3%C3%B1ez-184450ba"
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={-1}
                >
                  <Button variant="outline" size="sm">
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </Button>
                </a>
                <a
                  href="https://github.com/digitalisten-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={-1}
                >
                  <Button variant="outline" size="sm">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Teknologi</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <span>• TensorFlow</span>
              <span>• React</span>
              <span>• EfficientNetB0</span>
              <span>• TypeScript</span>
              <span>• FER2013</span>
              <span>• Tailwind CSS</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2024 EmotionAI. Skapad med ❤️ och avancerad AI.
          </p>
        </div>
      </div>
    </footer>
  );
};