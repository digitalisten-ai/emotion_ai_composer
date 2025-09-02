import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Camera, Brain, Music, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE as string;

interface EmotionResult {
  emotion: string;
  confidence: number;
}

const emotionColors = {
  happy: "hsl(var(--emotion-happy))",
  sad: "hsl(var(--emotion-sad))",
  angry: "hsl(var(--emotion-angry))",
  fear: "hsl(var(--emotion-fear))",
  surprise: "hsl(var(--emotion-surprise))",
  disgust: "hsl(var(--emotion-disgust))",
  neutral: "hsl(var(--emotion-neutral))",
};

const emotionEmojis = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  fear: "😨",
  surprise: "😲",
  disgust: "🤢",
  neutral: "😐",
};

export const EmotionAnalyzer = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<EmotionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [usingCamera, setUsingCamera] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const waitForVideoElement = (timeoutMs = 2000) =>
    new Promise<HTMLVideoElement>((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        const v = videoRef.current;
        if (v) return resolve(v);
        if (Date.now() - start > timeoutMs) return reject(new Error("Video element not available."));
        requestAnimationFrame(tick);
      };
      tick();
    });

  const startCamera = async () => {
    // 1) Se till att videon finns i DOM: visa kamerasektionen först
    setUsingCamera(true);

    let v: HTMLVideoElement;
    try {
      v = await waitForVideoElement(2000);
    } catch (e) {
      console.error(e);
      toast({ title: "Kamera", description: "Kunde inte hitta videoelementet i sidan.", variant: "destructive" });
      setUsingCamera(false);
      return;
    }

    const attachAndPlay = async (stream: MediaStream) => {
      streamRef.current = stream;
      try {
        // @ts-ignore
        v.srcObject = stream;
      } catch {
        // @ts-ignore
        v.src = URL.createObjectURL(stream as any);
      }
      v.setAttribute("playsinline", "true");
      v.muted = true;
      try {
        await v.play();
      } catch (e) {
        console.warn("video.play() was interrupted; will try on metadata", e);
        v.onloadedmetadata = () => v.play().catch(() => {});
      }
    };

    try {
      // Preferred constraints
      const constraints: MediaStreamConstraints = {
        video: { facingMode: { ideal: "user" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      await attachAndPlay(stream);
    } catch (err1) {
      console.warn("Preferred constraints failed, retrying with video:true", err1);
      try {
        // Fallback: any camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        await attachAndPlay(stream);
      } catch (err2) {
        console.error("Kameratillgång nekad eller ej tillgänglig", err2);
        toast({ title: "Kamera", description: "Kunde inte öppna kamera. Tillåt behörighet och använd localhost (inte LAN IP) eller HTTPS.", variant: "destructive" });
        // rollback UI
        setUsingCamera(false);
      }
    }
  };

  const stopCamera = () => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } finally {
      streamRef.current = null;
      const v = videoRef.current;
      if (v) {
        try {
          v.pause();
        } catch {}
        // @ts-ignore
        if (v.srcObject) v.srcObject = null;
        v.removeAttribute("src");
        v.load();
      }
      setUsingCamera(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = 224; // match model input; backend resizar ändå
    canvas.height = 224;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    setSelectedImage((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return dataUrl;
    });
    setResult(null);
    toast({ title: "Foto taget", description: "Förhandsvisningen uppdaterades med kamerabilden." });
  };

  // Städa upp kamerastream vid unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const dataURLtoFile = async (dataUrl: string, filename = `image_${Date.now()}.jpg`): Promise<File> => {
    if (dataUrl.startsWith("blob:")) {
      const blob = await fetch(dataUrl).then((r) => r.blob());
      return new File([blob], filename, { type: blob.type || "image/jpeg" });
    }
    if (dataUrl.startsWith("data:")) {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      return new File([blob], filename, { type: blob.type || "image/jpeg" });
    }
    const blob = await fetch(dataUrl).then((r) => r.blob());
    return new File([blob], filename, { type: blob.type || "image/jpeg" });
  };

  const analyzeEmotion = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      // Build a File from whatever is in selectedImage (dataURL or blob URL)
      const file = await dataURLtoFile(selectedImage);
      const form = new FormData();
      form.append("image", file);

      const resp = await fetch(`${API_BASE}/api/predict`, {
        method: "POST",
        body: form,
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`API error ${resp.status}: ${txt}`);
      }

      const data: { emotion: string; confidence: number; audio?: string } = await resp.json();
      setResult({ emotion: data.emotion, confidence: data.confidence });

      // Autoplay audio if provided by backend
      if (data.audio) {
        try {
          const audioUrl = data.audio.startsWith("http") ? data.audio : `${API_BASE}${data.audio}`;
          const audio = new Audio(audioUrl);
          audio.play().catch(() => {});
        } catch {}
      }

      toast({ title: "Känsloanalys klar!", description: `Identifierad känsla: ${data.emotion}` });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Fel vid analys", description: String(err?.message || err), variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="bg-gradient-card border-border/50 emotion-glow">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Känsloanalys Demo
            <Sparkles className="h-6 w-6 text-primary" />
          </CardTitle>
          <p className="text-muted-foreground">
            Ladda upp en bild så analyserar AI:n känslan och spelar passande musik
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <Button
                onClick={triggerFileInput}
                variant="outline"
                size="lg"
                className="w-full h-32 border-dashed border-2 hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span>Ladda upp bild</span>
                  <span className="text-sm text-muted-foreground">JPG, PNG</span>
                </div>
              </Button>

              {usingCamera ? (
                <div className="space-y-3">
                  <div className="border rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      controls={false}
                      className="w-full h-64 object-cover bg-black"
                      style={{ minHeight: "16rem" }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="default" className="flex-1" onClick={capturePhoto}>
                      <Camera className="h-5 w-5 mr-2" /> Ta foto
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={stopCamera}>
                      Stäng kamera
                    </Button>
                  </div>
                  {/* Hidden canvas kept in DOM for stability on some browsers */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-16"
                  onClick={startCamera}
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Använd kamera
                </Button>
              )}
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
              {selectedImage ? (
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Uploaded"
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                  {result && (
                    <div 
                      className="absolute top-2 right-2 px-3 py-1 rounded-full text-white font-semibold text-sm"
                      style={{ backgroundColor: emotionColors[result.emotion as keyof typeof emotionColors] }}
                    >
                      {emotionEmojis[result.emotion as keyof typeof emotionEmojis]} {result.emotion}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-64 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Din bild visas här</p>
                </div>
              )}

              <Button
                onClick={analyzeEmotion}
                disabled={!selectedImage || isAnalyzing}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Brain className="h-5 w-5 mr-2 animate-pulse" />
                    Analyserar...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5 mr-2" />
                    Analysera känsla
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <Card className="bg-card/50 border-border/30">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="text-6xl">
                    {emotionEmojis[result.emotion as keyof typeof emotionEmojis]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold capitalize">{result.emotion}</h3>
                    <p className="text-muted-foreground">
                      Säkerhet: {(result.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Music className="h-4 w-4" />
                    <span>Spelar passande musik för {result.emotion}...</span>
                  </div>
                  
                  {/* Progress bar for confidence */}
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${result.confidence * 100}%`,
                        backgroundColor: emotionColors[result.emotion as keyof typeof emotionColors]
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};