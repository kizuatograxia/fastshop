import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Camera, Send, X, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useUserRaffles } from "@/contexts/UserRafflesContext";
import { api } from "@/lib/api";

interface SubmitTestimonialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubmitTestimonialModal = ({
  open,
  onOpenChange,
}: SubmitTestimonialModalProps) => {
  const { getWonRaffles } = useUserRaffles();
  const [selectedPrize, setSelectedPrize] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wonRaffles = getWonRaffles();
  const hasWon = wonRaffles.length > 0;

  // Debug: Simular ganho se estiver vazio para teste (Remover em prod)
  // const debugRaffles = hasWon ? wonRaffles : [{raffle: {id: "999", titulo: "Prêmio de Teste (Dev)", imagem: ""}}];
  // const displayRaffles = hasWon ? wonRaffles : []; 

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPrize || !testimonial || rating === 0) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    // await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const raffle = wonRaffles.find(r => String(r.raffle.id) === selectedPrize)?.raffle;

      await api.submitTestimonial({
        userId: user.id || "0",
        userName: user.name || "Usuario",
        userAvatar: user.avatar || "",
        raffleName: raffle?.titulo || "Sorteio",
        prizeName: raffle?.premio || "Prêmio",
        rating,
        comment: testimonial,
        photoUrl: imagePreview || user.picture // Use uploaded photo OR user avatar
      });

      toast.success("Depoimento enviado com sucesso!", {
        description: "Seu feedback será analisado e publicado em breve.",
      });

      // Reset form
      setSelectedPrize("");
      setTestimonial("");
      setRating(0);
      setImagePreview(null);
      setIsSubmitting(false);
      onOpenChange(false);

    } catch (error) {
      console.error("Falha ao enviar depoimento:", error);
      toast.error("Erro ao enviar depoimento. Tente novamente.");
      setIsSubmitting(false);
    }

    // Reset form
    setSelectedPrize("");
    setTestimonial("");
    setRating(0);
    setImagePreview(null);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border/50 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            🎉 Compartilhe sua Conquista!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {hasWon
              ? "Conte para todos como foi ganhar na MundoPix"
              : "Você precisa ganhar um sorteio para enviar um depoimento."}
          </DialogDescription>
        </DialogHeader>

        {!hasWon ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="bg-secondary/50 p-6 rounded-full">
              <Lock className="w-12 h-12 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Assim que você ganhar seu primeiro sorteio, essa área será desbloqueada para você contar sua história!
            </p>
            <Button variant="outline" onClick={handleClose}>
              Entendi, vou participar!
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-6 py-4">
              {/* Prize Select */}
              <div className="space-y-2">
                <Label htmlFor="prize">Prêmio Ganho *</Label>
                <Select value={selectedPrize} onValueChange={setSelectedPrize}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Selecione o prêmio que você ganhou" />
                  </SelectTrigger>
                  <SelectContent>
                    {wonRaffles.map((ur) => (
                      <SelectItem key={ur.raffle.id} value={ur.raffle.id}>
                        {ur.raffle.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Star Rating */}
              <div className="space-y-2">
                <Label>Sua Avaliação *</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${star <= (hoveredRating || rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted-foreground/30"
                          }`}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Testimonial Text */}
              <div className="space-y-2">
                <Label htmlFor="testimonial">Sua Experiência *</Label>
                <Textarea
                  id="testimonial"
                  placeholder="Conte como foi receber seu prêmio, a velocidade da entrega, sua experiência com a MundoPix..."
                  value={testimonial}
                  onChange={(e) => setTestimonial(e.target.value)}
                  className="min-h-[120px] bg-background/50 border-border/50 resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {testimonial.length}/500 caracteres
                </p>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Foto (Opcional)</Label>
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden aspect-video">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => setImagePreview(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/50 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                      <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Clique ou arraste uma foto
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publicar Depoimento
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
