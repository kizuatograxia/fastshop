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
        // Fetch recent books
        const resentResponse = await fetch('/api/books?limit=4');
        const recentData = await resentResponse.json();

        // Fetch featured books
        const featuredResponse = await fetch('/api/books?featured=true&limit=5');
        const featuredData = await featuredResponse.json();

        if (recentData.length > 0) setRecentReleases(recentData);
        else setRecentReleases(getRecentReleases()); // Fallback

        if (featuredData.length > 0) setFeaturedBooks(featuredData);
        else setFeaturedBooks(mockBooks.slice(0, 5)); // Fallback

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
              <Badge variant="secondary" className="mb-2">Fresh Arrivals</Badge>
              <h2 className="text-2xl md:text-3xl font-bold">Recent Releases</h2>
              <p className="text-muted-foreground mt-1">
                These books just got released, get one before they sell out!
              </p>
            </div>
            <Link to="/store?sort=newest">
              <Button variant="outline" className="gap-2">
                View All
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
            <h2 className="text-2xl md:text-3xl font-bold">Stay in the Loop</h2>
            <p className="text-muted-foreground mt-2">
              Get weekly updates on new releases, author interviews, and exclusive deals.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 mt-8 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="lg" className="h-12">
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4">
              By subscribing, you agree to our Privacy Policy and Terms of Service.
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
