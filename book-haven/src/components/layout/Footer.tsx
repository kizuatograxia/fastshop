import { Link } from 'react-router-dom';
import { BookOpen, Twitter, Facebook, Instagram, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const footerLinks = {
  helpful: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
  forAuthors: [
    { label: 'Publish With Us', href: '/publish' },
    { label: 'Author Portal', href: '/author-portal' },
    { label: 'Author FAQ', href: '/author-faq' },
    { label: 'Marketing Support', href: '/marketing' },
  ],
  discover: [
    { label: 'Browse Books', href: '/store' },
    { label: 'Authors', href: '/authors' },
    { label: 'Publishers', href: '/publishers' },
    { label: 'Bestsellers', href: '/store?sort=bestselling' },
    { label: 'New Releases', href: '/store?sort=newest' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span>BookVault</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              Your digital library for the modern age. Discover, purchase, and read thousands of eBooks and audiobooks from world-class authors.
            </p>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Stay Updated</h4>
              <form className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-background"
                />
                <Button type="submit" size="sm">
                  Subscribe
                </Button>
              </form>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-background border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                >
                  <social.icon className="h-4 w-4" />
                  <span className="sr-only">{social.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Helpful Links</h4>
            <ul className="space-y-3">
              {footerLinks.helpful.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">For Authors</h4>
            <ul className="space-y-3">
              {footerLinks.forAuthors.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Discover</h4>
            <ul className="space-y-3">
              {footerLinks.discover.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2020-2026 BookVault. All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link to="/cookies" className="hover:text-primary transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
