import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFeaturedBooks } from '@/lib/mockData';

export function FeaturedSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featuredBooks = getFeaturedBooks();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredBooks.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredBooks.length]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredBooks.length) % featuredBooks.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredBooks.length);
  };

  const currentBook = featuredBooks[currentIndex];

  return (
    <section className="relative hero-gradient overflow-hidden">
      <div className="container py-12 md:py-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBook.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-center gap-8 md:gap-16"
          >
            {/* Book Cover */}
            <div className="relative shrink-0">
              <motion.div
                initial={{ scale: 0.9, rotateY: -10 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <img
                  src={currentBook.coverImage}
                  alt={currentBook.title}
                  className="w-48 md:w-64 h-72 md:h-96 object-cover rounded-lg book-shadow"
                />
                <div className="absolute -bottom-4 -right-4 w-48 md:w-64 h-72 md:h-96 rounded-lg bg-primary/20 -z-10" />
              </motion.div>
            </div>

            {/* Book Details */}
            <div className="flex-1 text-center md:text-left text-white">
              <Badge className="bg-accent text-accent-foreground mb-4">
                Featured
              </Badge>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-5xl font-bold leading-tight"
              >
                {currentBook.title}
              </motion.h1>
              
              {currentBook.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg md:text-xl text-white/80 mt-2"
                >
                  {currentBook.subtitle}
                </motion.p>
              )}
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-white/70 mt-2"
              >
                by <span className="text-accent font-semibold">{currentBook.author.name}</span>
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center md:justify-start gap-2 mt-4"
              >
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(currentBook.rating) ? 'fill-warning text-warning' : 'text-white/30'}`}
                    />
                  ))}
                </div>
                <span className="text-white/80">{currentBook.rating} ({currentBook.reviewCount.toLocaleString()} reviews)</span>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-white/70 mt-6 max-w-xl line-clamp-3"
              >
                {currentBook.shortDescription}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mt-8"
              >
                <div className="text-3xl font-bold">
                  ${(currentBook.salePrice || currentBook.price).toFixed(2)}
                  {currentBook.salePrice && (
                    <span className="text-lg text-white/50 line-through ml-2">${currentBook.price.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </Button>
                  <Link to={`/book/${currentBook.slug}`}>
                    <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                      View Details
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {featuredBooks.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-8 bg-accent' : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
