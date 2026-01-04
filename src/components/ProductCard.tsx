import React from "react";
import { ShoppingCart, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.nome.substring(0, 30)}... adicionado ao carrinho!`, {
      duration: 2000,
    });
  };

  const parcela = (product.preco / product.parcelas).toFixed(2);
  const desconto = Math.round(
    ((product.precoAntigo - product.preco) / product.precoAntigo) * 100
  );

  return (
    <article
      className="group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-elevated hover:border-primary/30 hover:-translate-y-1 animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Discount Badge */}
      {desconto > 0 && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-lg text-xs font-bold">
          <Tag className="h-3 w-3" />
          -{desconto}%
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-secondary/30">
        <img
          src={product.imagem}
          alt={product.nome}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-medium text-sm text-foreground leading-tight line-clamp-2 h-10 group-hover:text-primary transition-colors">
          {product.nome}
        </h3>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground line-through">
            R$ {product.precoAntigo.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-2xl font-bold text-gradient">
            R$ {product.preco.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-xs text-muted-foreground">
            à vista ou {product.parcelas}x de{" "}
            <span className="text-foreground font-medium">
              R$ {parcela.replace(".", ",")}
            </span>
          </p>
        </div>

        <Button
          variant="cart"
          size="default"
          className="w-full"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
          Adicionar
        </Button>
      </div>
    </article>
  );
};

export default ProductCard;
