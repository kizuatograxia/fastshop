// Mock data for the book marketplace

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  author: Author;
  publisher: Publisher;
  coverImageUrl: string;
  description: string;
  shortDescription: string;
  price: number;
  salePrice?: number;
  rating: number;
  reviewCount: number;
  format: ('ebook' | 'audiobook')[];
  genre: string;
  releaseDate: string;
  pageCount?: number;
  duration?: string;
  language: string;
  isbn: string;
  status: 'available' | 'sold_out' | 'preorder';
  isFeatured?: boolean;
  totalSales: number;
  weeklySales: number;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  photo: string;
  bio: string;
  bookCount: number;
  genres: string[];
}

export interface Publisher {
  id: string;
  name: string;
  slug: string;
  logo: string;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  helpful: number;
  notHelpful: number;
}

export const authors: Author[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    slug: 'sarah-mitchell',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    bio: 'Sarah Mitchell is a New York Times bestselling author known for her gripping psychological thrillers. With over 20 million copies sold worldwide, she continues to captivate readers with her intricate plots and unforgettable characters.',
    bookCount: 12,
    genres: ['Thriller', 'Mystery', 'Suspense'],
  },
  {
    id: '2',
    name: 'James Chen',
    slug: 'james-chen',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    bio: 'James Chen is an award-winning science fiction author whose works explore the intersection of technology and humanity. His novels have been translated into 30 languages.',
    bookCount: 8,
    genres: ['Science Fiction', 'Fantasy'],
  },
  {
    id: '3',
    name: 'Emily Roberts',
    slug: 'emily-roberts',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    bio: 'Emily Roberts writes heartwarming romance novels that have touched millions of readers. Her stories celebrate love in all its forms.',
    bookCount: 15,
    genres: ['Romance', 'Contemporary Fiction'],
  },
  {
    id: '4',
    name: 'Michael Torres',
    slug: 'michael-torres',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    bio: 'Michael Torres is a historian and author who brings the past to life through meticulously researched historical fiction.',
    bookCount: 6,
    genres: ['Historical Fiction', 'Non-Fiction'],
  },
];

export const publishers: Publisher[] = [
  { id: '1', name: 'Penguin Random House', slug: 'penguin-random-house', logo: '' },
  { id: '2', name: 'HarperCollins', slug: 'harpercollins', logo: '' },
  { id: '3', name: 'Simon & Schuster', slug: 'simon-schuster', logo: '' },
  { id: '4', name: 'Macmillan Publishers', slug: 'macmillan', logo: '' },
];

export const books: Book[] = [
  {
    id: '1',
    title: 'The Midnight Library',
    subtitle: 'A Novel About Life\'s Infinite Possibilities',
    slug: 'the-midnight-library',
    author: authors[0],
    publisher: publishers[0],
    coverImageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    description: 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices... Would you have done anything different, if you had the chance to undo your regrets? A dazzling novel about all the choices that go into a life well lived.',
    shortDescription: 'A magical story about second chances and finding meaning in life.',
    price: 14.99,
    rating: 4.8,
    reviewCount: 2847,
    format: ['ebook', 'audiobook'],
    genre: 'Literary Fiction',
    releaseDate: '2024-01-15',
    pageCount: 304,
    duration: '8h 50m',
    language: 'English',
    isbn: '978-0525559474',
    status: 'available',
    isFeatured: true,
    totalSales: 45230,
    weeklySales: 1523,
  },
  {
    id: '2',
    title: 'Echoes of Tomorrow',
    slug: 'echoes-of-tomorrow',
    author: authors[1],
    publisher: publishers[1],
    coverImageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    description: 'In a world where time travel is possible but forbidden, one scientist risks everything to change the past. A thrilling journey through time that questions the very nature of destiny and free will.',
    shortDescription: 'A mind-bending sci-fi thriller about time travel and destiny.',
    price: 12.99,
    salePrice: 9.99,
    rating: 4.6,
    reviewCount: 1823,
    format: ['ebook'],
    genre: 'Science Fiction',
    releaseDate: '2024-02-20',
    pageCount: 412,
    language: 'English',
    isbn: '978-0525559475',
    status: 'available',
    isFeatured: true,
    totalSales: 32150,
    weeklySales: 982,
  },
  {
    id: '3',
    title: 'Hearts Unbound',
    slug: 'hearts-unbound',
    author: authors[2],
    publisher: publishers[2],
    coverImageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    description: 'When two strangers meet on a rainy night in Paris, they never expect their lives to become intertwined forever. A sweeping romance that spans continents and decades.',
    shortDescription: 'A sweeping romance that will capture your heart.',
    price: 11.99,
    rating: 4.7,
    reviewCount: 3421,
    format: ['ebook', 'audiobook'],
    genre: 'Romance',
    releaseDate: '2024-01-08',
    pageCount: 368,
    duration: '10h 15m',
    language: 'English',
    isbn: '978-0525559476',
    status: 'available',
    totalSales: 52340,
    weeklySales: 1845,
  },
  {
    id: '4',
    title: 'The Last Empire',
    slug: 'the-last-empire',
    author: authors[3],
    publisher: publishers[3],
    coverImageUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop',
    description: 'A sweeping historical epic that chronicles the fall of ancient civilizations and the rise of new powers. Based on extensive historical research.',
    shortDescription: 'An epic tale of empires rising and falling.',
    price: 16.99,
    rating: 4.5,
    reviewCount: 1256,
    format: ['ebook'],
    genre: 'Historical Fiction',
    releaseDate: '2023-12-01',
    pageCount: 524,
    language: 'English',
    isbn: '978-0525559477',
    status: 'available',
    totalSales: 18920,
    weeklySales: 456,
  },
  {
    id: '5',
    title: 'Whispers in the Dark',
    slug: 'whispers-in-the-dark',
    author: authors[0],
    publisher: publishers[0],
    coverImageUrl: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=400&h=600&fit=crop',
    description: 'A chilling psychological thriller that will keep you guessing until the very last page. When secrets from the past resurface, nothing is as it seems.',
    shortDescription: 'A gripping thriller that will keep you on edge.',
    price: 13.99,
    rating: 4.9,
    reviewCount: 4521,
    format: ['ebook', 'audiobook'],
    genre: 'Thriller',
    releaseDate: '2024-03-10',
    pageCount: 356,
    duration: '9h 30m',
    language: 'English',
    isbn: '978-0525559478',
    status: 'available',
    isFeatured: true,
    totalSales: 67890,
    weeklySales: 2341,
  },
  {
    id: '6',
    title: 'The Quantum Paradox',
    slug: 'the-quantum-paradox',
    author: authors[1],
    publisher: publishers[1],
    coverImageUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop',
    description: 'A groundbreaking science fiction novel that explores parallel universes and the nature of consciousness. Winner of multiple literary awards.',
    shortDescription: 'Explore the mysteries of parallel universes.',
    price: 15.99,
    salePrice: 12.99,
    rating: 4.7,
    reviewCount: 2156,
    format: ['ebook'],
    genre: 'Science Fiction',
    releaseDate: '2024-02-01',
    pageCount: 448,
    language: 'English',
    isbn: '978-0525559479',
    status: 'available',
    totalSales: 28450,
    weeklySales: 892,
  },
  {
    id: '7',
    title: 'Summer\'s Promise',
    slug: 'summers-promise',
    author: authors[2],
    publisher: publishers[2],
    coverImageUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop',
    description: 'A heartwarming story of love, loss, and second chances set against the backdrop of a small coastal town.',
    shortDescription: 'A touching story of love and second chances.',
    price: 10.99,
    rating: 4.6,
    reviewCount: 1987,
    format: ['ebook', 'audiobook'],
    genre: 'Romance',
    releaseDate: '2024-01-25',
    pageCount: 312,
    duration: '7h 45m',
    language: 'English',
    isbn: '978-0525559480',
    status: 'available',
    totalSales: 41230,
    weeklySales: 1234,
  },
  {
    id: '8',
    title: 'Code of Shadows',
    slug: 'code-of-shadows',
    author: authors[0],
    publisher: publishers[3],
    coverImageUrl: 'https://images.unsplash.com/photo-1509266272358-7701da638078?w=400&h=600&fit=crop',
    description: 'A cyber thriller that takes you deep into the world of hackers and digital espionage. Nothing online is safe.',
    shortDescription: 'A pulse-pounding cyber thriller.',
    price: 14.99,
    rating: 4.4,
    reviewCount: 1654,
    format: ['ebook'],
    genre: 'Thriller',
    releaseDate: '2024-03-01',
    pageCount: 392,
    language: 'English',
    isbn: '978-0525559481',
    status: 'preorder',
    totalSales: 8920,
    weeklySales: 523,
  },
];

export const genres = [
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Thriller',
  'Romance',
  'Science Fiction',
  'Fantasy',
  'Historical Fiction',
  'Biography',
  'Self-Help',
  'Business',
  'Children\'s',
  'Young Adult',
  'Horror',
  'Poetry',
];

export const reviews: Review[] = [
  {
    id: '1',
    bookId: '1',
    userId: '1',
    userName: 'BookLover92',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    rating: 5,
    title: 'Life-changing read!',
    comment: 'This book completely changed my perspective on life. The concept of the midnight library is so beautifully executed. Every chapter left me thinking about my own choices and possibilities.',
    date: '2024-02-15',
    helpful: 124,
    notHelpful: 8,
  },
  {
    id: '2',
    bookId: '1',
    userId: '2',
    userName: 'AvocadoReader',
    userAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
    rating: 4,
    title: 'Thought-provoking and beautiful',
    comment: 'A wonderfully written exploration of regret and the paths not taken. While the pacing slowed in the middle, the ending was absolutely perfect.',
    date: '2024-02-10',
    helpful: 89,
    notHelpful: 12,
  },
  {
    id: '3',
    bookId: '1',
    userId: '3',
    userName: 'NightOwlReads',
    userAvatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100&h=100&fit=crop',
    rating: 5,
    title: 'Could not put it down',
    comment: 'Finished this in one sitting. The writing is so engaging and the story is incredibly moving. Highly recommend to anyone going through a difficult time.',
    date: '2024-02-05',
    helpful: 67,
    notHelpful: 3,
  },
];

export const featuredAuthor = authors[0];

export const getFeaturedBooks = () => books.filter(book => book.isFeatured);
export const getRecentReleases = () => [...books].sort((a, b) =>
  new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
).slice(0, 4);
export const getBestsellers = () => [...books].sort((a, b) => b.weeklySales - a.weeklySales).slice(0, 10);
export const getBookBySlug = (slug: string) => books.find(book => book.slug === slug);
export const getBooksByAuthor = (authorSlug: string) => books.filter(book => book.author.slug === authorSlug);
export const getReviewsByBook = (bookId: string) => reviews.filter(review => review.bookId === bookId);
