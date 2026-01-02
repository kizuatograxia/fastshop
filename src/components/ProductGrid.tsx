import ProductCard from "./ProductCard";

interface Product {
  id: number;
  nome: string;
  preco: number;
  imagem: string;
}

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ProductGrid = ({ products, onAddToCart }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-muted" />
          <div className="mx-auto h-4 w-48 rounded bg-muted" />
          <div className="mx-auto h-3 w-32 rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Produtos em Destaque
          </h2>
          <p className="text-muted-foreground mt-1">
            {products.length} produtos encontrados
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ProductCard product={product} onAddToCart={onAddToCart} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;
