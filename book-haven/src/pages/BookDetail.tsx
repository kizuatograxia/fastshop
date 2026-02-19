import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, Heart, Share2, ShoppingCart, BookOpen, Headphones,
  Clock, Calendar, Globe, ChevronRight, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { BookCard } from '@/components/books/BookCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { getBookBySlug as getMockBookBySlug, getReviewsByBook, books as mockBooks } from '@/lib/mockData';
import { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';

const BookDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`/api/books/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setBook(data);
        } else {
          setBook(getMockBookBySlug(slug || ''));
        }
      } catch (error) {
        setBook(getMockBookBySlug(slug || ''));
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-32 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </Layout>
    );
  }

  if (!book) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold">Book not found</h1>
          <Link to="/store">
            <Button className="mt-4">Browse Books</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const reviews = getReviewsByBook(book.id);
  const relatedBooks = mockBooks.filter((b) => b.genre === book.genre && b.id !== book.id).slice(0, 4);
  const hasDiscount = book.salePrice && book.salePrice < book.price;

  const ratingBreakdown = [
    { stars: 5, percentage: 75 },
    { stars: 4, percentage: 15 },
    { stars: 3, percentage: 6 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 1 },
  ];

  return (
    <Layout>
      <div className="bg-secondary/30 border-b border-border">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link to="/store" className="text-muted-foreground hover:text-primary">Store</Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link to={`/store?genre=${book.genre}`} className="text-muted-foreground hover:text-primary">{book.genre}</Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium truncate">{book.title}</span>
          </nav>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24">
              <div className="relative aspect-[2/3] max-w-sm mx-auto">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-xl book-shadow"
                />
                {hasDiscount && (
                  <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-lg px-3 py-1">
                    {Math.round((1 - book.salePrice! / book.price) * 100)}% OFF
                  </Badge>
                )}
              </div>
              <Button variant="outline" className="w-full mt-6 gap-2">
                <BookOpen className="h-4 w-4" />
                Read Sample Chapter
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {book.format?.map((f: string) => (
                <Badge key={f} variant="secondary" className="text-sm gap-1">
                  {f === 'ebook' ? (
                    <><BookOpen className="h-3.5 w-3.5" /> eBook</>
                  ) : (
                    <><Headphones className="h-3.5 w-3.5" /> Audiobook</>
                  )}
                </Badge>
              ))}
              {book.status === 'preorder' && (
                <Badge className="bg-warning text-warning-foreground">Pre-order</Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold">{book.title}</h1>
            {book.subtitle && (
              <p className="text-xl text-muted-foreground mt-2">{book.subtitle}</p>
            )}

            <Link to={`/author/${book.author?.slug}`} className="text-lg text-primary hover:underline mt-2 block">
              by {book.author?.name}
            </Link>

            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(book.rating) ? 'fill-warning text-warning' : 'text-muted'}`}
                  />
                ))}
              </div>
              <span className="font-semibold">{book.rating}</span>
              <span className="text-muted-foreground">({(book.reviewCount || 0).toLocaleString()} reviews)</span>
            </div>

            <div className="flex flex-wrap gap-4 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(book.releaseDate).toLocaleDateString()}
              </div>
              {book.pageCount && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {book.pageCount} pages
                </div>
              )}
              {book.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {book.duration}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {book.language}
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">
                  ${(book.salePrice || book.price).toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${book.price.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <Button size="lg" className="gap-2" onClick={() => addToCart(book)}>
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
                <Button size="lg" variant="outline" onClick={() => { addToCart(book); navigate('/checkout'); }}>
                  Buy Now
                </Button>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button variant="ghost" size="sm" className="gap-2">
                <Heart className="h-4 w-4" />
                Add to Wishlist
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>

            <Separator className="my-6" />

            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="author">Author</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </TabsContent>

              <TabsContent value="details" className="mt-6">
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-muted-foreground">Publisher</dt>
                    <dd className="font-medium">{book.publisher?.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">ISBN</dt>
                    <dd className="font-medium">{book.isbn}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Genre</dt>
                    <dd className="font-medium">{book.genre}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Language</dt>
                    <dd className="font-medium">{book.language}</dd>
                  </div>
                </dl>
              </TabsContent>

              <TabsContent value="author" className="mt-6">
                <div className="flex items-start gap-4">
                  <img
                    src={book.author?.photo}
                    alt={book.author?.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-lg">{book.author?.name}</h4>
                    <p className="text-muted-foreground mt-2 leading-relaxed">
                      {book.author?.bio}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default BookDetail;
