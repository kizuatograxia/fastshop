import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { FeaturedSlider } from '@/components/books/FeaturedSlider';
import { BookCard } from '@/components/books/BookCard';
import { BestsellerTable } from '@/components/books/BestsellerTable';

import { WhatIsSection } from '@/components/home/WhatIsSection';
import { AppPromo } from '@/components/home/AppPromo';
import { Testimonials } from '@/components/home/Testimonials';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getRecentReleases, books as mockBooks } from '@/lib/mockData';

const Index = () => {
  const [recentReleases, setRecentReleases] = useState<any[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        // Fetch all books from API
        const response = await fetch('http://localhost:3000/api/books');
        const allBooks = await response.json();

        if (allBooks.length > 0) {
          // Use first 5 for featured carousel
          setFeaturedBooks(allBooks.slice(0, 5));
          // Use next 4 for recent releases
          setRecentReleases(allBooks.slice(5, 9).length > 0 ? allBooks.slice(5, 9) : allBooks.slice(0, 4));
        } else {
          // Fallback to mock data if no books
          setRecentReleases(getRecentReleases());
          setFeaturedBooks(mockBooks.slice(0, 5));
        }

      } catch (error) {
        console.error("Failed to load home content, using mocks");
        setRecentReleases(getRecentReleases());
        setFeaturedBooks(mockBooks.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };

    fetchHomeContent();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Featured Books Slider */}
      <FeaturedSlider books={featuredBooks} />

      {/* Recent Releases */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
          >
            <div>
              <Badge variant="secondary" className="mb-2">Novidades</Badge>
              <h2 className="text-2xl md:text-3xl font-bold">Lançamentos Recentes</h2>
              <p className="text-muted-foreground mt-1">
                Estes livros acabaram de ser lançados, pegue um antes que esgotem!
              </p>
            </div>
            <Link to="/store?sort=newest">
              <Button variant="outline" className="gap-2">
                Ver Todos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recentReleases.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* What is BookVault */}
      <WhatIsSection />

      {/* Bestseller Rankings */}
      <BestsellerTable />



      {/* Spotlight - Using Featured Books for now as well or could fetch differently */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <Badge variant="secondary" className="mb-2">Destaques</Badge>
            <h2 className="text-2xl md:text-3xl font-bold">Livros que Achamos Incríveis</h2>
            <p className="text-muted-foreground mt-1">
              Descubra títulos em alta e aclamados pela crítica
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
            {featuredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* App Promo */}
      <AppPromo />

      {/* Testimonials */}
      <Testimonials />

      {/* Newsletter */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <Badge variant="secondary" className="mb-4">Newsletter</Badge>
            <h2 className="text-2xl md:text-3xl font-bold">Fique por Dentro</h2>
            <p className="text-muted-foreground mt-2">
              Receba atualizações semanais sobre novos lançamentos, entrevistas com autores e ofertas exclusivas.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 mt-8 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Digite seu e-mail"
                className="flex-1 h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="lg" className="h-12">
                Inscrever-se
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4">
              Ao se inscrever, você concorda com nossa Política de Privacidade e Termos de Serviço.
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
