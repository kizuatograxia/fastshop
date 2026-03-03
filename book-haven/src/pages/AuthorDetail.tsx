import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Facebook, Twitter, Instagram, Globe, BookOpen, Star } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

interface Book {
    id: string;
    title: string;
    coverImageUrl: string;
    price: number;
    rating?: number;
    reviewCount?: number;
}

interface Author {
    id: string;
    name: string;
    photoUrl: string;
    bio: string;
    location?: string;
    website?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    books: Book[];
}

const AuthorDetail = () => {
    const { slug } = useParams();
    const [author, setAuthor] = useState<Author | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data fetch - in real app, fetch by slug
        setTimeout(() => {
            setAuthor({
                id: '1',
                name: 'F. Scott Fitzgerald',
                photoUrl: 'https://images.unsplash.com/photo-1455218873509-8093736ce711?auto=format&fit=crop&q=80&w=400',
                bio: "Francis Scott Key Fitzgerald (September 24, 1896 – December 21, 1940) was an American novelist, essayist, and short story writer. He is best known for his novels depicting the flamboyance and excess of the Jazz Age—a term he popularized.\n\nFitzgerald achieved widespread popularity for the first time with the publication of his debut novel, This Side of Paradise (1920). It was an immediate success, and it made him a celebrity.",
                location: "Saint Paul, Minnesota, USA",
                website: "https://fscottfitzgerald.com",
                twitter: "@fitzgerald_estate",
                books: [
                    { id: '1', title: 'The Great Gatsby', coverImageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400', price: 9.99, rating: 4.8, reviewCount: 1250 },
                    { id: '2', title: 'Tender Is the Night', coverImageUrl: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=400', price: 11.50, rating: 4.5, reviewCount: 850 },
                    { id: '3', title: 'This Side of Paradise', coverImageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400', price: 8.99, rating: 4.2, reviewCount: 430 },
                ]
            });
            setLoading(false);
        }, 500);
    }, [slug]);

    if (loading) {
        return (
            <div className="container mx-auto p-8 min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!author) return <div className="container mx-auto p-8">Author not found</div>;

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Hero Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-12 md:py-16">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                        <div className="relative">
                            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                <img src={author.photoUrl} alt={author.name} className="w-full h-full object-cover" />
                            </div>
                            <Badge className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-blue-600 hover:bg-blue-700">
                                Featured Author
                            </Badge>
                        </div>

                        <div className="flex-1 space-y-4 max-w-3xl">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">{author.name}</h1>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-600">
                                {author.location && <span>📍 {author.location}</span>}
                                <span>📚 {author.books.length} Books Published</span>
                            </div>

                            <p className="text-lg text-gray-700 leading-relaxed max-w-2xl whitespace-pre-wrap">
                                {author.bio}
                            </p>

                            <div className="flex gap-4 justify-center md:justify-start pt-2">
                                {author.website && (
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Globe className="h-4 w-4" /> Website
                                    </Button>
                                )}
                                {author.twitter && (
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Twitter className="h-4 w-4" /> Follow
                                    </Button>
                                )}
                                <Button className="gap-2 bg-gray-900 text-white hover:bg-gray-800">
                                    Follow Author
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex items-center gap-2 mb-8">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold">Books by {author.name}</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {author.books.map((book) => (
                        <Link to={`/book/${book.id}`} key={book.id} className="group">
                            <Card className="border-none shadow-none bg-transparent hover:bg-white hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="aspect-[2/3] rounded-lg overflow-hidden mb-4 shadow-sm bg-gray-200">
                                        <img
                                            src={book.coverImageUrl}
                                            alt={book.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
                                        {book.title}
                                    </h3>
                                    <div className="flex items-center gap-1 text-yellow-500 my-2 text-xs">
                                        <Star className="h-3 w-3 fill-current" />
                                        <span className="font-medium text-gray-900">{book.rating}</span>
                                        <span className="text-gray-400">({book.reviewCount})</span>
                                    </div>
                                    <p className="font-bold text-lg text-gray-900">${book.price.toFixed(2)}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AuthorDetail;
