import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface Product {
  id: number;
  nome: string;
  preco: number;
  imagem: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const precoAntigo = (product.preco * 1.15).toFixed(2);
  const parcela = (product.preco / 12).toFixed(2);
  const desconto = Math.round(((product.preco * 1.15 - product.preco) / (product.preco * 1.15)) * 100);

  return (
    <article className="group relative bg-card rounded-xl border border-border p-5 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/30">
      {/* Discount Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
          -{desconto}%
        </span>
      </div>

      {/* Wishlist Button */}
      <button
        onClick={() => setIsLiked(!isLiked)}
        className={`absolute top-3 right-3 z-10 h-9 w-9 flex items-center justify-center rounded-full transition-all duration-300 ${
          isLiked
            ? "bg-destructive/10 text-destructive"
            : "bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-primary hover:bg-primary/10"
        }`}
        aria-label={isLiked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
      </button>

      {/* Product Image */}
      <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-muted">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
        )}
        <img
          src={product.imagem}
          alt={product.nome}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <h3 className="font-medium text-foreground text-sm leading-snug line-clamp-2 h-10">
          {product.nome}
        </h3>

        {/* Pricing */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground line-through">
            R$ {precoAntigo}
          </p>
          <p className="font-display text-2xl font-bold text-primary">
            R$ {product.preco.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            à vista ou <span className="font-medium text-foreground">12x de R$ {parcela}</span>
          </p>
        </div>

        {/* Add to Cart Button */}
        <Button
          variant="cart"
          size="lg"
          onClick={() => onAddToCart(product)}
          className="mt-4"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>
    </article>
  );
};

export default ProductCard;
