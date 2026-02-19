import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Headphones, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Book } from '@/lib/mockData';

interface BookCardProps {
  book: Book;
  variant?: 'compact' | 'detailed';
}

export function BookCard({ book, variant = 'compact' }: BookCardProps) {
  const hasDiscount = book.salePrice && book.salePrice < book.price;
  const displayPrice = Number(book.salePrice || book.price);

  if (variant === 'detailed') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group flex gap-6 p-4 rounded-xl bg-card border border-border card-shadow hover:card-shadow-hover transition-all duration-300"
      >
        <Link to={`/book/${book.slug}`} className="relative shrink-0">
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="w-32 h-48 object-cover rounded-lg book-shadow transition-transform duration-300 group-hover:scale-105"
          />
          {book.status === 'preorder' && (
            <Badge className="absolute top-2 left-2 bg-warning text-warning-foreground">
              Pre-order
            </Badge>
          )}
        </Link>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
            {book.format?.map((f) => (
              <Badge key={f} variant="secondary" className="text-xs">
                {f === 'ebook' ? (
                  <><BookOpen className="h-3 w-3 mr-1" /> eBook</>
                ) : (
                  <><Headphones className="h-3 w-3 mr-1" /> Audio</>
                )}
              </Badge>
            ))}
          </div>

          <Link to={`/book/${book.slug}`}>
            <h3 className="font-bold text-lg leading-tight hover:text-primary transition-colors line-clamp-2">
              {book.title}
            </h3>
          </Link>

          <Link to={`/author/${book.author.slug}`} className="text-sm text-muted-foreground hover:text-primary mt-1">
            by {book.author.name}
          </Link>

          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="text-sm font-medium">{book.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">({book.reviewCount.toLocaleString()} reviews)</span>
          </div>

          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
            {book.shortDescription}
          </p>

          <div className="mt-auto pt-4 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-primary">${displayPrice.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">${Number(book.price).toFixed(2)}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Heart className="h-4 w-4" />
              </Button>
              <Button size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <Link to={`/book/${book.slug}`} className="block relative">
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg book-shadow transition-all duration-300 group-hover:scale-[1.02] group-hover:card-shadow-hover">
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && (
              <Badge className="bg-destructive text-destructive-foreground">
                Sale
              </Badge>
            )}
            {book.status === 'preorder' && (
              <Badge className="bg-warning text-warning-foreground">
                Pre-order
              </Badge>
            )}
            {book.status === 'sold_out' && (
              <Badge variant="secondary">
                Sold Out
              </Badge>
            )}
          </div>

          {/* Format Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {book.format?.includes('audiobook') && (
              <div className="h-7 w-7 rounded-full bg-background/90 flex items-center justify-center">
                <Headphones className="h-3.5 w-3.5" />
              </div>
            )}
          </div>

          {/* Quick Add Button */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button size="sm" className="w-full gap-2">
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </Link>

      <div className="mt-3">
        <Link to={`/book/${book.slug}`}>
          <h3 className="font-semibold leading-tight hover:text-primary transition-colors line-clamp-2">
            {book.title}
          </h3>
        </Link>
        <Link to={`/author/${book.author.slug}`} className="text-sm text-muted-foreground hover:text-primary mt-1 block">
          {book.author.name}
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span className="text-sm font-medium">{book.rating}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-sm font-bold", hasDiscount ? "text-primary" : "text-foreground")}>
              ${displayPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">${Number(book.price).toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
