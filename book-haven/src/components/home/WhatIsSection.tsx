import { motion } from 'framer-motion';
import { Play, BookOpen, Headphones, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WhatIsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Video Thumbnail */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative w-full lg:w-1/2 aspect-video rounded-2xl overflow-hidden group cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=450&fit=crop"
              alt="Library"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="h-8 w-8 text-primary fill-primary ml-1" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-white text-sm">
              Watch our story (2:34)
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 text-center lg:text-left"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              What is <span className="text-gradient">BookVault</span>?
            </h2>
            <p className="text-xl text-muted-foreground mt-4">
              The Future of Digital Reading
            </p>
            <p className="text-muted-foreground mt-6 leading-relaxed">
              BookVault is a revolutionary digital marketplace where readers discover, purchase, and enjoy the world's best books. We bring together bestselling authors, prestigious publishers, and passionate readers in one seamless platform.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="p-4 rounded-xl bg-secondary/50">
                <BookOpen className="h-8 w-8 text-primary mb-3" />
                <h4 className="font-semibold">eBooks</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Thousands of titles ready to read
                </p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50">
                <Headphones className="h-8 w-8 text-primary mb-3" />
                <h4 className="font-semibold">Audiobooks</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Professional narration
                </p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50">
                <Globe className="h-8 w-8 text-primary mb-3" />
                <h4 className="font-semibold">Global Access</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Read from anywhere
                </p>
              </div>
            </div>

            <Button size="lg" className="mt-8">
              Learn More About Us
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
