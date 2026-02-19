import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const testimonials = [
  {
    id: '1',
    quote: "BookVault has transformed the way we publish and distribute our digital catalog. The platform is intuitive, fast, and our readers love it.",
    author: 'Jennifer Brooks',
    role: 'Digital Director',
    company: 'Penguin Random House',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
  },
  {
    id: '2',
    quote: "As an independent author, finding a platform that truly cares about reader experience was crucial. BookVault exceeded all my expectations.",
    author: 'Marcus Chen',
    role: 'Bestselling Author',
    company: 'Self-Published',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  },
];

export function Testimonials() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">Testimonials</Badge>
          <h2 className="text-3xl md:text-4xl font-bold">Words from Our Partners</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative p-8 rounded-2xl bg-card border border-border card-shadow"
            >
              <Quote className="absolute top-6 right-6 h-10 w-10 text-primary/10" />
              
              <p className="text-lg leading-relaxed text-muted-foreground">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
