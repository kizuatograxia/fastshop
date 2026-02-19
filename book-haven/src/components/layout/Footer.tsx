import { Link } from 'react-router-dom';
import { BookOpen, Twitter, Facebook, Instagram, Youtube, ShieldCheck, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
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

      {/* Legal & Compliance Bottom Bar */}
      <div className="border-t border-border">
        <div className="container py-8 flex flex-col items-center justify-center gap-6 text-sm text-muted-foreground text-center">

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-4">
            {/* Authenticity Badges */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-1 font-semibold text-foreground/80">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                Ambiente 100% Seguro
              </div>
              <span className="text-xs">Certificado SSL de Segurança</span>
            </div>

            <div className="w-px h-10 bg-border hidden md:block"></div>

            {/* Payment Methods */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-1 font-semibold text-foreground/80">
                <CreditCard className="h-5 w-5 text-primary" />
                Formas de Pagamento
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Badge variant="outline" className="px-2 py-0.5 text-[10px] tracking-widest text-[#32BCAD] border-[#32BCAD]/30 bg-[#32BCAD]/10">PIX</Badge>
                <div className="flex -space-x-1">
                  <div className="h-4 w-7 rounded bg-red-500 flex items-center justify-center z-10 shadow-sm"><div className="h-2 w-2 rounded-full bg-yellow-400"></div></div>
                  <div className="h-4 w-7 rounded bg-blue-600 flex items-center justify-end pr-1 text-[6px] text-white italic font-bold z-0 shadow-sm">VISA</div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-2xl space-y-2 text-xs">
            <p className="font-semibold text-foreground/80">MundoPix Academy - Conteúdos Digitais e Educação LTDA</p>
            <p>CNPJ: 00.000.000/0001-00</p>
            <p>Avenida Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100</p>
            <p className="mt-4 pt-4 border-t border-border/50">
              © {new Date().getFullYear()} BookVault / MundoPix Academy. Todos os direitos reservados.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs mt-2">
            <Link to="/terms" className="hover:text-primary transition-colors">
              Termos de Uso
            </Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Políticas de Privacidade
            </Link>
            <Link to="/refund" className="hover:text-primary transition-colors">
              Política de Reembolso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
