import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Grid3X3, List, SlidersHorizontal, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { BookCard } from '@/components/books/BookCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { books, genres } from '@/lib/mockData';

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'bestselling', label: 'Bestselling' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'title', label: 'Title A-Z' },
];

const formats = ['eBook', 'Audiobook'];

const Store = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const sortBy = searchParams.get('sort') || 'newest';

  const sortedBooks = useMemo(() => {
    let result = [...books];

    // Filter by format
    if (selectedFormats.length > 0) {
      result = result.filter((book) =>
        selectedFormats.some((format) =>
          format === 'eBook' ? book.format.includes('ebook') : book.format.includes('audiobook')
        )
      );
    }

    // Filter by genre
    if (selectedGenres.length > 0) {
      result = result.filter((book) => selectedGenres.includes(book.genre));
    }

    // Filter by price
    result = result.filter((book) => {
      const price = book.salePrice || book.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        break;
      case 'bestselling':
        result.sort((a, b) => b.weeklySales - a.weeklySales);
        break;
      case 'price-low':
        result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-high':
        result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [books, sortBy, selectedFormats, selectedGenres, priceRange]);

  const handleSortChange = (value: string) => {
    setSearchParams({ sort: value });
  };

  const toggleFormat = (format: string) => {
    setSelectedFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    );
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const clearFilters = () => {
    setSelectedFormats([]);
    setSelectedGenres([]);
    setPriceRange([0, 50]);
  };

  const activeFilterCount = selectedFormats.length + selectedGenres.length + (priceRange[0] > 0 || priceRange[1] < 50 ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Format */}
      <div>
        <h4 className="font-semibold mb-3">Format</h4>
        <div className="space-y-2">
          {formats.map((format) => (
            <label key={format} className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={selectedFormats.includes(format)}
                onCheckedChange={() => toggleFormat(format)}
              />
              <span className="text-sm">{format}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Genre */}
      <div>
        <h4 className="font-semibold mb-3">Genre</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {genres.slice(0, 10).map((genre) => (
            <label key={genre} className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={selectedGenres.includes(genre)}
                onCheckedChange={() => toggleGenre(genre)}
              />
              <span className="text-sm">{genre}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold mb-3">Price Range</h4>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={50}
            step={1}
            className="mb-3"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}+</span>
          </div>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold">Browse Books</h1>
          <p className="text-muted-foreground mt-2">
            Discover your next favorite read from our collection of {books.length}+ titles
          </p>
        </motion.div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </h3>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary">{activeFilterCount}</Badge>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-2">
                {/* Mobile Filter Button */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <span className="text-sm text-muted-foreground">
                  {sortedBooks.length} results
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="hidden sm:flex border border-border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedFormats.map((format) => (
                  <Badge key={format} variant="secondary" className="gap-1 pr-1">
                    {format}
                    <button onClick={() => toggleFormat(format)} className="ml-1 hover:bg-secondary-foreground/10 rounded">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {selectedGenres.map((genre) => (
                  <Badge key={genre} variant="secondary" className="gap-1 pr-1">
                    {genre}
                    <button onClick={() => toggleGenre(genre)} className="ml-1 hover:bg-secondary-foreground/10 rounded">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {(priceRange[0] > 0 || priceRange[1] < 50) && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    ${priceRange[0]} - ${priceRange[1]}
                    <button onClick={() => setPriceRange([0, 50])} className="ml-1 hover:bg-secondary-foreground/10 rounded">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Books Grid/List */}
            {sortedBooks.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-4"
              }>
                {sortedBooks.map((book) => (
                  <BookCard 
                    key={book.id} 
                    book={book} 
                    variant={viewMode === 'list' ? 'detailed' : 'compact'} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No books match your filters.</p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Store;
