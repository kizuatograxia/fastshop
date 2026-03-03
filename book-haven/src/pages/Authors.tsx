import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, BookOpen } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { authors } from '@/lib/mockData';

const Authors = () => {
  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold">Our Authors</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Discover talented authors from around the world and explore their works
          </p>
        </motion.div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search authors..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Authors Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {authors.map((author, index) => (
            <motion.div
              key={author.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                to={`/author/${author.slug}`}
                className="block group bg-card rounded-xl border border-border p-6 text-center hover:card-shadow-hover transition-all duration-300"
              >
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <img
                    src={author.photo}
                    alt={author.name}
                    className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-medium flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {author.bookCount}
                  </div>
                </div>

                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {author.name}
                </h3>

                <div className="flex flex-wrap justify-center gap-1 mt-3">
                  {author.genres.slice(0, 2).map((genre) => (
                    <Badge key={genre} variant="secondary" className="text-xs">
                      {genre}
                    </Badge>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                  {author.bio}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Authors;
