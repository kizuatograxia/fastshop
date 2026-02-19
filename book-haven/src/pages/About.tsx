import { motion } from 'framer-motion';
import { BookOpen, Users, Globe, Award, Heart, Zap } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const stats = [
  { label: 'Books Available', value: '50,000+', icon: BookOpen },
  { label: 'Happy Readers', value: '2M+', icon: Users },
  { label: 'Countries', value: '180+', icon: Globe },
  { label: 'Awards Won', value: '25', icon: Award },
];

const team = [
  {
    name: 'Alexandra Chen',
    role: 'CEO & Co-Founder',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop',
    bio: 'Former VP at Amazon Books. Passionate about democratizing reading.',
  },
  {
    name: 'Marcus Williams',
    role: 'CTO & Co-Founder',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
    bio: 'Tech veteran with 15 years in digital publishing.',
  },
  {
    name: 'Sarah Mitchell',
    role: 'Head of Content',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
    bio: 'Award-winning editor who curates our bestseller collection.',
  },
  {
    name: 'David Park',
    role: 'Head of Partnerships',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    bio: 'Building relationships with publishers worldwide.',
  },
];

const values = [
  {
    icon: Heart,
    title: 'Reader First',
    description: 'Every decision we make starts with what\'s best for our readers.',
  },
  {
    icon: BookOpen,
    title: 'Quality Content',
    description: 'We partner with the world\'s best authors and publishers.',
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'Constantly improving the digital reading experience.',
  },
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative hero-gradient text-white py-20 md:py-32 overflow-hidden">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="bg-accent text-accent-foreground mb-6">About Us</Badge>
            <h1 className="text-4xl md:text-5xl font-bold">
              Revolutionizing How the World Reads
            </h1>
            <p className="text-xl text-white/80 mt-6">
              BookVault is on a mission to make reading accessible, enjoyable, and sustainable for everyone, everywhere.
            </p>
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920')] bg-cover bg-center opacity-10" />
      </section>

      {/* Stats */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-card rounded-xl border border-border"
              >
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-3xl md:text-4xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="secondary" className="mb-4">Our Story</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                From Book Lovers, For Book Lovers
              </h2>
              <p className="text-muted-foreground mt-6 leading-relaxed">
                BookVault was born in 2020 when two avid readers realized that the digital book marketplace was fragmented and frustrating. They envisioned a platform that would combine the curation of a beloved bookstore with the convenience of digital delivery.
              </p>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                Today, we're proud to serve millions of readers across 180+ countries, partnering with thousands of publishers and independent authors to bring you the world's best stories.
              </p>
              <Button className="mt-6">Learn More</Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=400&fit=crop"
                alt="Books"
                className="rounded-2xl book-shadow"
              />
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-accent/30 rounded-2xl -z-10" />
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4">Our Values</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">What Drives Us</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-8 bg-card rounded-2xl border border-border"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{value.title}</h3>
                <p className="text-muted-foreground mt-3">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4">Our Team</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Meet the Team</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Passionate professionals dedicated to transforming digital reading
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-card rounded-xl border border-border hover:card-shadow-hover transition-all"
              >
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                />
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-primary">{member.role}</p>
                <p className="text-sm text-muted-foreground mt-3">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-primary/80 text-white">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Reading?</h2>
            <p className="text-white/80 mt-4 max-w-xl mx-auto">
              Join millions of readers who have discovered their next favorite book on BookVault.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Browse Books
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
