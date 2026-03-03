import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Plus, Search, Filter, Download, Loader2, Upload, FileText, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import JSZip from 'jszip';

const AdminBooks = () => {
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [extractedCover, setExtractedCover] = useState<File | null>(null);
    const [extractedCoverPreview, setExtractedCoverPreview] = useState<string | null>(null);

    const { toast } = useToast();

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        authorName: '',
        price: '0',
        description: '',
        coverImageUrl: '', // fallback or manually entered
        isFeatured: false,
        status: 'PUBLISHED',
        genre: 'Fiction'
    });

    const fetchBooks = async () => {
        try {
            const response = await fetch('/api/books');
            const data = await response.json();
            setBooks(data);
        } catch (error) {
            console.error('Failed to fetch books', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const handleDeleteProduct = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/books/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                toast({ title: "Product Deleted", description: `Successfully deleted ${title}.` });
                fetchBooks(); // Refresh list
            } else {
                toast({ variant: "destructive", title: "Deletion Failed", description: "This product might be tied to existing orders." });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete product." });
        }
    };

    // Clean up preview URL
    useEffect(() => {
        return () => {
            if (extractedCoverPreview) {
                URL.revokeObjectURL(extractedCoverPreview);
            }
        };
    }, [extractedCoverPreview]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData({ ...formData, isFeatured: checked });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/epub+zip" && file.type !== "application/pdf" && !file.name.endsWith('.epub')) {
            toast({ variant: "destructive", title: "Invalid File", description: "Please upload a valid .epub or .pdf file." });
            return;
        }

        setSelectedFile(file);
        setExtractedCover(null);
        setExtractedCoverPreview(null);

        // Process EPUB
        if (file.name.endsWith('.epub') || file.type === "application/epub+zip") {
            setIsProcessingFile(true);
            try {
                const zip = await JSZip.loadAsync(file);

                // Find OPF
                const container = await zip.file("META-INF/container.xml")?.async("string");
                if (container) {
                    const parser = new DOMParser();
                    const containerDoc = parser.parseFromString(container, "text/xml");
                    const opfPath = containerDoc.querySelector("rootfile")?.getAttribute("full-path");

                    if (opfPath) {
                        const opfContent = await zip.file(opfPath)?.async("string");
                        if (opfContent) {
                            const opfDoc = parser.parseFromString(opfContent, "text/xml");
                            const title = opfDoc.querySelector("title")?.textContent || opfDoc.querySelector("dc\\:title")?.textContent || "";
                            const author = opfDoc.querySelector("creator")?.textContent || opfDoc.querySelector("dc\\:creator")?.textContent || "";
                            const description = opfDoc.querySelector("description")?.textContent || opfDoc.querySelector("dc\\:description")?.textContent || "";

                            // Extract Cover Logic
                            let coverHref = null;
                            const manifest = opfDoc.querySelector("manifest");
                            // 1. Try meta name="cover" content="item-id"
                            const metaCover = opfDoc.querySelector('meta[name="cover"]');
                            if (metaCover) {
                                const coverId = metaCover.getAttribute("content");
                                if (coverId) {
                                    const item = manifest?.querySelector(`item[id="${coverId}"]`);
                                    coverHref = item?.getAttribute("href");
                                }
                            }

                            // 2. Try item properties="cover-image"
                            if (!coverHref) {
                                const item = manifest?.querySelector('item[properties="cover-image"]');
                                coverHref = item?.getAttribute("href");
                            }

                            // 3. Fallback: search for id containing 'cover' and image mime type
                            if (!coverHref) {
                                const item = Array.from(manifest?.querySelectorAll("item") || []).find(it => {
                                    const id = it.getAttribute("id")?.toLowerCase() || "";
                                    const type = it.getAttribute("media-type") || "";
                                    return id.includes("cover") && type.startsWith("image/");
                                });
                                coverHref = item?.getAttribute("href");
                            }

                            if (coverHref) {
                                // Resolve path relative to OPF
                                // OPF might be in a folder e.g. OEBPS/content.opf. relative path logic:
                                const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
                                const fullCoverPath = opfDir + coverHref;

                                // Actually read the file
                                // Sometimes paths in href are already full paths or relative. JSZip needs exact matches usually.
                                // We might need to resolve simple relative paths (../) but usually EPUBs are flat-ish.
                                // Let's try direct concatenation first.

                                let imageBlob = await zip.file(fullCoverPath)?.async("blob");
                                if (!imageBlob && zip.file(coverHref)) {
                                    // Try without OPF dir prefix
                                    imageBlob = await zip.file(coverHref)?.async("blob");
                                }

                                if (imageBlob) {
                                    const coverFile = new File([imageBlob], "cover.jpg", { type: imageBlob.type });
                                    setExtractedCover(coverFile);
                                    setExtractedCoverPreview(URL.createObjectURL(imageBlob));
                                }
                            }

                            setFormData(prev => ({
                                ...prev,
                                title: title.trim() || prev.title,
                                authorName: author.trim() || prev.authorName,
                                description: description.trim() || prev.description,
                            }));
                            toast({ title: "Metadata Extracted", description: `Found info for: ${title}` });
                        }
                    }
                }
            } catch (error) {
                console.error("Metadata extraction failed", error);
            } finally {
                setIsProcessingFile(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const data = new FormData();

            data.append('title', formData.title);
            data.append('authorName', formData.authorName);
            data.append('price', formData.price);
            data.append('description', formData.description);
            // Only send text URL if we don't have a file, or if explicit override desired
            data.append('coverImageUrl', formData.coverImageUrl);
            data.append('isFeatured', String(formData.isFeatured));
            data.append('status', formData.status);
            data.append('genre', formData.genre);

            if (selectedFile) {
                data.append('bookFile', selectedFile);
            }

            if (extractedCover) {
                data.append('coverImage', extractedCover);
            }

            const response = await fetch('/api/books', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });

            if (response.ok) {
                toast({ title: "Success", description: "Product published successfully" });
                setIsDialogOpen(false);
                fetchBooks();
                // Reset form
                setFormData({
                    title: '', authorName: '', price: '0', description: '', coverImageUrl: '', isFeatured: false, status: 'PUBLISHED', genre: 'Fiction'
                });
                setSelectedFile(null);
                setExtractedCover(null);
                setExtractedCoverPreview(null);
            } else {
                throw new Error('Failed to create');
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to publish book" });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return 'bg-green-100 text-green-700 hover:bg-green-100/80';
            case 'DRAFT': return 'bg-gray-100 text-gray-700 hover:bg-gray-100/80';
            case 'ARCHIVED': return 'bg-red-100 text-red-700 hover:bg-red-100/80';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Digital Products</h2>
                    <p className="text-gray-500 mt-1">Manage your digital books catalogue (eBooks / PDF).</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-slate-900 hover:bg-slate-800">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Digital Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New Digital Book</DialogTitle>
                            <DialogDescription>
                                Upload your EPUB/PDF file. We'll extract metadata and cover image automatically.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex gap-4">
                            {/* File Upload Box */}
                            <div className="flex-1 p-6 bg-blue-50/50 border border-blue-100 border-dashed rounded-lg text-center cursor-pointer hover:bg-blue-50 transition-colors relative">
                                <Label htmlFor="epub-upload" className="cursor-pointer block h-full w-full">
                                    <div className="flex flex-col items-center justify-center h-full gap-2">
                                        <div className="p-3 bg-blue-100 rounded-full">
                                            <Upload className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <span className="text-sm font-semibold text-blue-700 mt-2">
                                            {isProcessingFile ? "Analyzing File..." : (selectedFile ? selectedFile.name : "Upload .EPUB / .PDF")}
                                        </span>
                                        <span className="text-xs text-slate-500">Auto-fills details & cover</span>
                                    </div>
                                </Label>
                                <Input
                                    id="epub-upload"
                                    type="file"
                                    accept=".epub,.pdf"
                                    onChange={handleFileUpload}
                                    disabled={isProcessingFile}
                                    className="hidden"
                                />
                            </div>

                            {/* Cover Preview Box */}
                            <div className="w-32 h-44 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden relative">
                                {extractedCoverPreview ? (
                                    <>
                                        <img src={extractedCoverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                                        <Badge className="absolute bottom-1 right-1 text-[10px] bg-green-600">Extracted</Badge>
                                    </>
                                ) : formData.coverImageUrl ? (
                                    <img src={formData.coverImageUrl} alt="URL Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center p-2">
                                        <ImageIcon className="h-8 w-8 text-slate-300 mx-auto mb-1" />
                                        <span className="text-[10px] text-slate-400">No Cover</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="title">Book Title</Label>
                                    <Input id="title" required value={formData.title} onChange={handleInputChange} placeholder="e.g. The Great Gatsby" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="authorName">Author Name</Label>
                                    <Input id="authorName" required value={formData.authorName} onChange={handleInputChange} placeholder="e.g. F. Scott Fitzgerald" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Input id="status" value={formData.status} disabled className="bg-gray-50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price ($)</Label>
                                    <Input id="price" type="number" step="0.01" required value={formData.price} onChange={handleInputChange} />
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="coverImageUrl">Cover Image URL (Optional override)</Label>
                                    <Input id="coverImageUrl" value={formData.coverImageUrl} onChange={handleInputChange} placeholder="https://..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="genre">Genre</Label>
                                    <select
                                        id="genre"
                                        value={formData.genre}
                                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="Fiction">Fiction</option>
                                        <option value="Non-Fiction">Non-Fiction</option>
                                        <option value="Mystery">Mystery</option>
                                        <option value="Thriller">Thriller</option>
                                        <option value="Romance">Romance</option>
                                        <option value="Science Fiction">Science Fiction</option>
                                        <option value="Fantasy">Fantasy</option>
                                        <option value="Historical Fiction">Historical Fiction</option>
                                        <option value="Biography">Biography</option>
                                        <option value="Self-Help">Self-Help</option>
                                        <option value="Business">Business</option>
                                        <option value="Children's">Children's</option>
                                        <option value="Young Adult">Young Adult</option>
                                        <option value="Horror">Horror</option>
                                        <option value="Poetry">Poetry</option>
                                    </select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" value={formData.description} onChange={handleInputChange} placeholder="Book summary..." className="min-h-[100px]" />
                                </div>
                                <div className="flex items-center gap-2 col-span-2 border p-4 rounded-md">
                                    <Switch id="isFeatured" checked={formData.isFeatured} onCheckedChange={handleSwitchChange} />
                                    <Label htmlFor="isFeatured">Feature this book on homepage</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={!selectedFile && !formData.title}>Publish Product</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-200">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input placeholder="Search books..." className="pl-10" />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead>Book</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Genre</TableHead>
                                <TableHead>File Type</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10">
                                        <div className="flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-gray-400" /></div>
                                    </TableCell>
                                </TableRow>
                            ) : books.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                                        No digital products found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                books.map((book) => (
                                    <TableRow key={book.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-8 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                                    {book.coverImageUrl ? (
                                                        <img src={book.coverImageUrl} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-300" />
                                                    )}
                                                </div>
                                                <span className="font-medium text-gray-900">{book.title}</span>
                                                {book.isFeatured && <Badge variant="secondary" className="text-[10px] ml-2">Featured</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell>{book.author?.name}</TableCell>
                                        <TableCell><Badge variant="outline" className={`border-0 ${getStatusColor(book.status)}`}>{book.status}</Badge></TableCell>
                                        <TableCell>${Number(book.price).toFixed(2)}</TableCell>
                                        <TableCell><Badge variant="outline">{book.genre}</Badge></TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-mono text-xs">
                                                {book.hasEbook ? 'EPUB/FILE' : 'NO FILE'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem className="cursor-pointer" onClick={() => toast({ title: "Coming Soon", description: "Edit functionality is under development." })}>
                                                        Edit Product
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={() => handleDeleteProduct(book.id, book.title)}>
                                                        Delete Product
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default AdminBooks;
