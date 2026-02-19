import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Star, Heart, Share2, ShoppingCart, BookOpen, Headphones,
  Clock, Calendar, Globe, ChevronRight, ThumbsUp, ThumbsDown, Loader2
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { BookCard } from '@/components/books/BookCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { getBookBySlug, getReviewsByBook, books } from '@/lib/mockData';

const BookDetail = () => {
  const { slug } = useParams();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedBooks, setRelatedBooks] = useState<any[]>([]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        // Try to fetch from API first
        const response = await fetch(`http://localhost:3000/api/books?slug=${slug}`);
        const data = await response.json();

        if (data.length > 0) {
          setBook(data[0]);
          // Fetch related books by genre
          if (data[0].genre) {
            const relatedResponse = await fetch(`http://localhost:3000/api/books`);
            const allBooks = await relatedResponse.json();
            const related = allBooks.filter((b: any) => b.genre === data[0].genre && b.id !== data[0].id).slice(0, 4);
            setRelatedBooks(related);
          }
        } else {
          // Fallback to mock data
          const mockBook = getBookBySlug(slug || '');
          setBook(mockBook);
          if (mockBook) {
            setRelatedBooks(books.filter((b) => b.genre === mockBook.genre && b.id !== mockBook.id).slice(0, 4));
          }
        }
      } catch (error) {
        console.error('Failed to fetch book:', error);
        // Fallback to mock data
        const mockBook = getBookBySlug(slug || '');
        setBook(mockBook);
        if (mockBook) {
          setRelatedBooks(books.filter((b) => b.genre === mockBook.genre && b.id !== mockBook.id).slice(0, 4));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!book) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold">Livro não encontrado</h1>
          <Link to="/store">
            <Button className="mt-4">Explorar Livros</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const reviews = book.id ? getReviewsByBook(book.id) : [];
  const hasDiscount = book.salePrice && book.salePrice < book.price;

  // Rating breakdown mock data
  const ratingBreakdown = [
    { stars: 5, percentage: 75 },
    { stars: 4, percentage: 15 },
    { stars: 3, percentage: 6 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 1 },
  ];

  return (
    <Layout>
      {/* Breadcrumb */}
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
          {/* Book Cover */}
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

              {/* Sample Button */}
              <Button variant="outline" className="w-full mt-6 gap-2">
                <BookOpen className="h-4 w-4" />
                Read Sample Chapter
              </Button>
            </div>
          </motion.div>

          {/* Book Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            {/* Format Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {book.format.map((f) => (
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

            <Link to={`/author/${book.author.slug}`} className="text-lg text-primary hover:underline mt-2 block">
              by {book.author.name}
            </Link>

            {/* Rating */}
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
              <span className="text-muted-foreground">({book.reviewCount.toLocaleString()} reviews)</span>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(book.releaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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

            {/* Price & Actions */}
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
                <Button size="lg" className="gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
                <Button size="lg" variant="outline">
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

            {/* Tabs */}
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
                    <dd className="font-medium">{book.publisher.name}</dd>
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
                  {book.pageCount && (
                    <div>
                      <dt className="text-sm text-muted-foreground">Pages</dt>
                      <dd className="font-medium">{book.pageCount}</dd>
                    </div>
                  )}
                  {book.duration && (
                    <div>
                      <dt className="text-sm text-muted-foreground">Audio Duration</dt>
                      <dd className="font-medium">{book.duration}</dd>
                    </div>
                  )}
                </dl>
              </TabsContent>

              <TabsContent value="author" className="mt-6">
                <div className="flex items-start gap-4">
                  <img
                    src={book.author.photo}
                    alt={book.author.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-lg">{book.author.name}</h4>
                    <p className="text-muted-foreground mt-2 leading-relaxed">
                      {book.author.bio}
                    </p>
                    <Link to={`/author/${book.author.slug}`}>
                      <Button variant="outline" size="sm" className="mt-4">
                        View All Books
                      </Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Rating Summary */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-primary">{book.rating}</div>
                <div className="flex justify-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(book.rating) ? 'fill-warning text-warning' : 'text-muted'}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Based on {book.reviewCount.toLocaleString()} reviews
                </p>
              </div>

              <div className="space-y-3">
                {ratingBreakdown.map((item) => (
                  <div key={item.stars} className="flex items-center gap-3">
                    <span className="text-sm w-8">{item.stars} ★</span>
                    <Progress value={item.percentage} className="flex-1" />
                    <span className="text-sm text-muted-foreground w-10 text-right">{item.percentage}%</span>
                  </div>
                ))}
              </div>

              <Button className="w-full mt-6">Write a Review</Button>
            </div>

            {/* Reviews List */}
            <div className="md:col-span-2 space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium">{review.userName}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? 'fill-warning text-warning' : 'text-muted'}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h4 className="font-semibold mt-4">{review.title}</h4>
                  <p className="text-muted-foreground mt-2">{review.comment}</p>

                  <div className="flex items-center gap-4 mt-4 text-sm">
                    <span className="text-muted-foreground">Was this helpful?</span>
                    <button className="flex items-center gap-1 hover:text-primary">
                      <ThumbsUp className="h-4 w-4" />
                      {review.helpful}
                    </button>
                    <button className="flex items-center gap-1 hover:text-destructive">
                      <ThumbsDown className="h-4 w-4" />
                      {review.notHelpful}
                    </button>
                  </div>
                </div>
              ))}

              {reviews.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No reviews yet. Be the first to review this book!
                </div>
              )}

              {reviews.length > 0 && (
                <Button variant="outline" className="w-full">
                  See All Reviews
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedBooks.map((relatedBook) => (
                <BookCard key={relatedBook.id} book={relatedBook} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default BookDetail;
