import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getBestsellers } from '@/lib/mockData';

export function BestsellerTable() {
  const bestsellers = getBestsellers();

  const getTrendIcon = (index: number) => {
    if (index < 3) return <TrendingUp className="h-4 w-4 text-success" />;
    if (index > 6) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">Weekly Rankings</Badge>
          <h2 className="text-3xl md:text-4xl font-bold">Bestseller Rankings</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Discover what readers are loving this week
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="bg-card rounded-xl border border-border overflow-hidden card-shadow"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-16 text-center">#</TableHead>
                  <TableHead>Book</TableHead>
                  <TableHead className="hidden sm:table-cell">Genre</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Weekly Sales</TableHead>
                  <TableHead className="text-right hidden lg:table-cell">All Time</TableHead>
                  <TableHead className="w-16 text-center hidden sm:table-cell">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestsellers.map((book, index) => (
                  <TableRow key={book.id} className="hover:bg-muted/50">
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        index === 0 ? 'bg-warning text-warning-foreground' :
                        index === 1 ? 'bg-muted text-muted-foreground' :
                        index === 2 ? 'bg-accent text-accent-foreground' :
                        'text-muted-foreground'
                      }`}>
                        {index + 1}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-10 h-14 object-cover rounded"
                        />
                        <div>
                          <Link to={`/book/${book.slug}`} className="font-medium hover:text-primary transition-colors line-clamp-1">
                            {book.title}
                          </Link>
                          <Link to={`/author/${book.author.slug}`} className="text-sm text-muted-foreground hover:text-primary">
                            {book.author.name}
                          </Link>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{book.genre}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${(book.salePrice || book.price).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                      {book.weeklySales.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell text-muted-foreground">
                      {book.totalSales.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                      {getTrendIcon(index)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-4 mt-8"
        >
          <div className="text-center p-4 rounded-lg bg-card border border-border">
            <div className="text-2xl md:text-3xl font-bold text-primary">1,234</div>
            <div className="text-sm text-muted-foreground">Total Titles</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-card border border-border">
            <div className="text-2xl md:text-3xl font-bold text-primary">45.2K</div>
            <div className="text-sm text-muted-foreground">Books Sold</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-card border border-border">
            <div className="text-2xl md:text-3xl font-bold text-primary">$892K</div>
            <div className="text-sm text-muted-foreground">Weekly Volume</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
