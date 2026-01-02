import { Zap, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

const Hero = () => {
  return (
    <section className="relative overflow-hidden gradient-hero py-12 sm:py-16 lg:py-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-primary-foreground/30 rounded-full" />
        <div className="absolute top-20 right-20 w-48 h-48 border-2 border-primary-foreground/20 rounded-full" />
        <div className="absolute bottom-10 left-1/3 w-24 h-24 border-2 border-primary-foreground/25 rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="h-6 w-6 text-accent animate-pulse" />
          <span className="text-accent font-semibold text-sm uppercase tracking-widest">
            Ofertas Exclusivas
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary-foreground mb-4 tracking-tight">
          DESTAQUES DA SEMANA
        </h1>

        <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
          Tecnologia de ponta para sua missão. Equipamentos selecionados com os melhores preços do mercado.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="hero" size="lg" className="bg-card text-primary hover:bg-card/90">
            Ver Ofertas
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <Button variant="hero" size="lg" className="bg-transparent border-2 border-primary-foreground/30 hover:bg-primary-foreground/10">
            Explorar Categorias
          </Button>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 80V40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
