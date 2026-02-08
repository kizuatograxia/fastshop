import { motion } from "framer-motion";
import { Star, CheckCircle, Heart, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WinnerTestimonial } from "@/types/winner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

interface WinnerCardProps {
  winner: WinnerTestimonial;
  index: number;
}

export const WinnerCard = ({ winner, index }: WinnerCardProps) => {
  const [likes, setLikes] = useState(winner.likes);
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLikes((prev) => prev - 1);
    } else {
      setLikes((prev) => prev + 1);
    }
    setLiked(!liked);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formattedDate = formatDistanceToNow(new Date(winner.date), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_40px_hsl(162,95%,71%,0.15)]">
        {/* Card Header - User Info */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary/30">
                <AvatarImage src={winner.avatar} alt={winner.name} />
                <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                  {getInitials(winner.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {winner.name}
                  </span>
                  {winner.verified && (
                    <CheckCircle className="w-4 h-4 text-primary fill-primary/20" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formattedDate}
                </span>
              </div>
            </div>
            <Badge
              variant="outline"
              className="bg-primary/10 border-primary/30 text-primary"
            >
              <Trophy className="w-3 h-3 mr-1" />
              Ganhador
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Prize Image */}
          <div className="relative overflow-hidden rounded-xl aspect-video">
            <img
              src={winner.prizeImage}
              alt={winner.prize}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <h3 className="font-bold text-lg text-foreground drop-shadow-lg">
                {winner.prize}
              </h3>
            </div>
          </div>

          {/* Star Rating */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= winner.rating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-2">
              ({winner.rating}/5)
            </span>
          </div>

          {/* Testimonial Text */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            "{winner.testimonial}"
          </p>

          {/* Footer - Like Button */}
          <div className="pt-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-2 transition-colors ${
                liked ? "text-red-500 hover:text-red-400" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-all ${liked ? "fill-red-500 scale-110" : ""}`}
              />
              <span>{likes}</span>
              <span className="text-xs">Parabéns!</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
