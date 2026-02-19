import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Settings, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

// Mock content for the reader
const MOCK_CONTENT = `
  Chapter 1
  
  In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.
  
  "Whenever you feel like criticizing any one," he told me, "just remember that all the people in this world haven't had the advantages that you've had."
  
  He didn't say any more but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence I'm inclined to reserve all judgments, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores. The abnormal mind is quick to detect and attach itself to this quality when it appears in a normal person, and so it came about that in college I was unjustly accused of being a politician, because I was privy to the secret griefs of wild, unknown men. Most of the confidences were unsought—frequently I have feigned sleep, preoccupation, or a hostile levity when I realized by some unmistakable sign that an intimate revelation was quivering on the horizon—for the intimate revelations of young men or at least the terms in which they express them are usually plagiaristic and marred by obvious suppressions. Reserving judgments is a matter of infinite hope. I am still a little afraid of missing something if I forget that, as my father snobbishly suggested, and I snobbishly repeat a sense of the fundamental decencies is parcelled out unequally at birth.
  
  And, after boasting this way of my tolerance, I come to the admission that it has a limit. Conduct may be founded on the hard rock or the wet marshes but after a certain point I don't care what it's founded on. When I came back from the East last autumn I felt that I wanted the world to be in uniform and at a sort of moral attention forever; I wanted no more riotous excursions with privileged glimpses into the human heart. Only Gatsby, the man who gives his name to this book, was exempt from my reaction—Gatsby who represented everything for which I have an unaffected scorn. If personality is an unbroken series of successful gestures, then there was something gorgeous about him, some heightened sensitivity to the promises of life, as if he were related to one of those intricate machines that register earthquakes ten thousand miles away. This responsiveness had nothing to do with that flabby impressionability which is dignified under the name of the "creative temperament"—it was an extraordinary gift for hope, a romantic readiness such as I have never found in any other person and which it is not likely I shall ever find again. No—Gatsby turned out all right at the end; it is what preyed on Gatsby, what foul dust floated in the wake of his dreams that temporarily closed out my interest in the abortive sorrows and short-winded elations of men.
`;

const Reader = () => {
    const { slug } = useParams();
    const [fontSize, setFontSize] = useState(18);
    const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
    const [currentPage, setCurrentPage] = useState(1);
    const { toast } = useToast();

    // Mock total pages based on mock content length just for demo
    const totalPages = 15;

    const handleThemeChange = (newTheme: 'light' | 'sepia' | 'dark') => {
        setTheme(newTheme);
    };

    const handleBookmark = () => {
        toast({
            description: "Bookmark added at current location",
        });
    };

    const getThemeStyles = () => {
        switch (theme) {
            case 'sepia': return 'bg-[#f4ecd8] text-[#5b4636]';
            case 'dark': return 'bg-gray-900 text-gray-300';
            default: return 'bg-white text-gray-900';
        }
    };

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-300 ${getThemeStyles()}`}>
            {/* Toolbar */}
            <div className={`h-16 border-b flex items-center justify-between px-4 sticky top-0 z-10 ${theme === 'dark' ? 'border-gray-800 bg-gray-900/90' : 'border-gray-200 bg-white/90'
                } backdrop-blur`}>
                <Link to="/library">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium opacity-70 hidden sm:inline-block">
                        The Great Gatsby
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={handleBookmark}>
                        <Bookmark className="h-5 w-5" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Settings className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 p-4">
                            <DropdownMenuLabel>Reader Settings</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <div className="space-y-4 pt-2">
                                <div>
                                    <div className="text-xs text-muted-foreground mb-2">Font Size ({fontSize}px)</div>
                                    <Slider
                                        value={[fontSize]}
                                        min={14}
                                        max={32}
                                        step={1}
                                        onValueChange={(vals) => setFontSize(vals[0])}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => handleThemeChange('light')}
                                        className={`p-2 rounded border text-center text-xs ${theme === 'light' ? 'ring-2 ring-primary' : ''} bg-white text-black`}
                                    >
                                        Light
                                    </button>
                                    <button
                                        onClick={() => handleThemeChange('sepia')}
                                        className={`p-2 rounded border text-center text-xs ${theme === 'sepia' ? 'ring-2 ring-primary' : ''} bg-[#f4ecd8] text-[#5b4636]`}
                                    >
                                        Sepia
                                    </button>
                                    <button
                                        onClick={() => handleThemeChange('dark')}
                                        className={`p-2 rounded border text-center text-xs ${theme === 'dark' ? 'ring-2 ring-primary' : ''} bg-gray-900 text-white`}
                                    >
                                        Dark
                                    </button>
                                </div>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 max-w-2xl mx-auto w-full p-6 md:p-12 leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
                {MOCK_CONTENT.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-6">{paragraph}</p>
                ))}
            </div>

            {/* Footer / Pagination */}
            <div className={`h-16 border-t flex items-center justify-between px-4 sticky bottom-0 z-10 ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
                }`}>
                <div className="flex-1"></div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <span className="text-sm font-medium">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
                <div className="flex-1 flex justify-end">
                    <span className="text-xs opacity-50">{(currentPage / totalPages * 100).toFixed(0)}%</span>
                </div>
            </div>
        </div>
    );
};

export default Reader;
