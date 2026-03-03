import { motion } from 'framer-motion';
import { Smartphone, Download, Wifi, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppPromo() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground overflow-hidden">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 text-center lg:text-left"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Get the Reading App
            </h2>
            <p className="text-primary-foreground/80 mt-4 text-lg max-w-lg">
              Take your entire library with you. Read or listen anywhere, anytime with our mobile app.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-white/10">
                <Download className="h-6 w-6" />
                <div>
                  <div className="font-medium">Offline Mode</div>
                  <div className="text-sm text-primary-foreground/70">Read without internet</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-white/10">
                <Wifi className="h-6 w-6" />
                <div>
                  <div className="font-medium">Sync Across</div>
                  <div className="text-sm text-primary-foreground/70">All your devices</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-white/10">
                <BookOpen className="h-6 w-6" />
                <div>
                  <div className="font-medium">Custom Reader</div>
                  <div className="text-sm text-primary-foreground/70">Personalized settings</div>
                </div>
              </div>
            </div>

            {/* App Store Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-8">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2 w-full sm:w-auto">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Download for iOS
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2 w-full sm:w-auto">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                Download for Android
              </Button>
            </div>
          </motion.div>

          {/* Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative w-64 md:w-80">
              {/* Phone Frame */}
              <div className="relative bg-black rounded-[3rem] p-2 shadow-2xl">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-10" />
                <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                  <div className="flex flex-col h-full p-4 pt-10">
                    {/* App Header */}
                    <div className="flex items-center justify-between mb-4">
                      <Smartphone className="h-5 w-5 text-white/50" />
                      <div className="text-white/70 text-sm font-medium">My Library</div>
                      <div className="h-5 w-5" />
                    </div>
                    {/* Book Grid Preview */}
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-[2/3] bg-gradient-to-br from-accent/30 to-primary/30 rounded-lg animate-pulse" />
                      ))}
                    </div>
                    {/* Bottom Nav */}
                    <div className="flex justify-around pt-4 border-t border-white/10 mt-4">
                      <div className="h-6 w-6 rounded-full bg-white/20" />
                      <div className="h-6 w-6 rounded-full bg-primary" />
                      <div className="h-6 w-6 rounded-full bg-white/20" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-accent/30 rounded-full blur-xl" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
