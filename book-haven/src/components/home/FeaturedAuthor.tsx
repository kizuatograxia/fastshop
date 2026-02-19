import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { featuredAuthor, getBooksByAuthor } from '@/lib/mockData';

export function FeaturedAuthor() {
  const authorBooks = getBooksByAuthor(featuredAuthor.slug).slice(0, 3);

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">Spotlight</Badge>
          <h2 className="text-3xl md:text-4xl font-bold">Featured Author</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-2xl p-8 md:p-12"
        >
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Author Photo */}
            <div className="relative shrink-0">
              <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-primary/20 card-shadow">
                <img
                  src={featuredAuthor.photo}
                  alt={featuredAuthor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-medium flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {featuredAuthor.bookCount} books
              </div>
            </div>

            {/* Author Info */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold">{featuredAuthor.name}</h3>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                {featuredAuthor.genres.map((genre) => (
                  <Badge key={genre} variant="outline">
                    {genre}
                  </Badge>
                ))}
              </div>
              <p className="text-muted-foreground mt-4 max-w-2xl">
                {featuredAuthor.bio}
              </p>
              <Link to={`/author/${featuredAuthor.slug}`}>
                <Button className="mt-6 gap-2">
                  View All Books
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Author's Books */}
          <div className="mt-10 pt-10 border-t border-border/50">
            <h4 className="text-lg font-semibold mb-6">Popular Books by {featuredAuthor.name}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {authorBooks.map((book) => (
                <Link key={book.id} to={`/book/${book.slug}`} className="group">
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-card/50 hover:bg-card transition-colors">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-16 h-24 object-cover rounded book-shadow group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <h5 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {book.title}
                      </h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        ${(book.salePrice || book.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
