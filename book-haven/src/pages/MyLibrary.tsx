import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Download, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

interface LibraryItem {
    id: string;
    book: {
        id: string;
        title: string;
        authorName?: string;
        coverImageUrl: string;
        author?: { name: string };
    };
    readingProgress: number;
    purchaseDate: string;
}

const MyLibrary = () => {
    const [books, setBooks] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        const fetchLibrary = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                // Demo Mode
                setBooks([
                    {
                        id: '1',
                        readingProgress: 45,
                        purchaseDate: new Date().toISOString(),
                        book: {
                            id: 'b1',
                            title: 'The Great Gatsby',
                            authorName: 'F. Scott Fitzgerald',
                            coverImageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400'
                        }
                    },
                    {
                        id: '2',
                        readingProgress: 0,
                        purchaseDate: new Date().toISOString(),
                        book: {
                            id: 'b2',
                            title: '1984',
                            authorName: 'George Orwell',
                            coverImageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400'
                        }
                    },
                ]);
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/library', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setBooks(data);
                }
            } catch (error) {
                console.error("Failed to fetch library", error);
                toast({ variant: "destructive", title: "Error", description: "Could not load library" });
            } finally {
                setLoading(false);
            }
        };

        fetchLibrary();
    }, []);

    const filteredBooks = books.filter(item =>
        item.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.book.author?.name || item.book.authorName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="container mx-auto p-8 min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Library</h1>
                        <p className="text-muted-foreground mt-1">Manage your collection and continue reading.</p>
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search your books..."
                            className="pl-10 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Categories / Filter Tabs (Static for now) */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
                    <Button variant="secondary" size="sm" className="bg-white hover:bg-gray-100 shadow-sm">All Books</Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">Unread</Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">Finished</Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">Favorites</Button>
                </div>

                {filteredBooks.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No books found</h3>
                        <p className="text-muted-foreground mb-6">Looks like your library is empty or no results matched.</p>
                        <Link to="/store">
                            <Button>Browse Store</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredBooks.map((item) => (
                            <Card key={item.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col h-full">
                                <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10" />
                                    <img
                                        src={item.book.coverImageUrl || 'https://placehold.co/100x150'}
                                        alt={item.book.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {item.readingProgress > 0 && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 z-20">
                                            <div className="flex justify-between text-xs text-white/90 mb-1">
                                                <span>{item.readingProgress}% Complete</span>
                                                <span>Page 45 of 320</span>
                                            </div>
                                            <Progress value={item.readingProgress} className="h-1 bg-white/20" />
                                        </div>
                                    )}
                                </div>

                                <CardContent className="p-5 flex-1 space-y-3">
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                                            {item.book.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {item.book.author?.name || item.book.authorName || 'Unknown Author'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>Last read 2 days ago</span>
                                    </div>
                                </CardContent>

                                <CardFooter className="p-5 pt-0 gap-2 grid grid-cols-2">
                                    <Link to={`/read/${item.book.id}`} className="w-full">
                                        <Button className="w-full" size="sm">
                                            Read Now
                                        </Button>
                                    </Link>
                                    <Button variant="outline" size="sm" className="w-full gap-2">
                                        <Download className="h-3 w-3" /> EPUB
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyLibrary;
