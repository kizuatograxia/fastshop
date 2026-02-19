import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';

// Schema modified for Multer (everything comes as string)
const bookSchema = z.object({
    title: z.string().min(1),
    authorName: z.string().min(1),
    description: z.string().optional(),
    genre: z.string().optional(),
    price: z.string().transform((val) => parseFloat(val)),
    stock: z.string().transform((val) => parseInt(val)).optional().default('0'), // Keep for backward compat but effectively ignored for digital
    status: z.enum(['PUBLISHED', 'DRAFT', 'ARCHIVED']).default('DRAFT'),
    isFeatured: z.string().transform((val) => val === 'true').optional(),
    coverImageUrl: z.string().optional(),
});

// Public: Only Published
export const getBooks = async (req: Request, res: Response) => {
    try {
        const { featured, limit } = req.query;

        const where: any = {
            status: 'PUBLISHED'
        };

        if (featured === 'true') {
            where.isFeatured = true;
        }

        const books = await prisma.book.findMany({
            where,
            take: limit ? Number(limit) : undefined,
            orderBy: { createdAt: 'desc' },
            include: { author: true }
        });

        res.json(books);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch books' });
    }
};

// Admin: All Books
export const getAllBooks = async (req: Request, res: Response) => {
    try {
        const books = await prisma.book.findMany({
            orderBy: { createdAt: 'desc' },
            include: { author: true }
        });
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch all books' });
    }
};

export const getBook = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const book = await prisma.book.findUnique({
            where: { id: id as string },
            include: { author: true }
        });

        if (!book) return res.status(404).json({ error: 'Book not found' });

        res.json(book);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch book' });
    }
};

export const createBook = async (req: Request, res: Response) => {
    try {
        // Handle files (Multer fields)
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const bookFile = files['bookFile']?.[0];
        const coverImage = files['coverImage']?.[0];

        // URLs
        const ebookFileUrl = bookFile ? `http://localhost:3000/uploads/books/${bookFile.filename}` : undefined;

        // If cover image is uploaded, use it. Otherwise fall back to the URL string if provided is valid (though our middleware handles saving file updates primarily)
        let coverUrlStr = undefined;
        if (coverImage) {
            coverUrlStr = `http://localhost:3000/uploads/books/${coverImage.filename}`;
        }

        const data = bookSchema.parse(req.body);

        // Use uploaded cover URL if available, else user provided string
        const finalCoverUrl = coverUrlStr || data.coverImageUrl;

        let author = await prisma.author.findFirst({ where: { name: data.authorName } });
        if (!author) {
            author = await prisma.author.create({
                data: {
                    name: data.authorName,
                    slug: data.authorName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
                }
            });
        }

        const slug = data.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

        const book = await prisma.book.create({
            data: {
                title: data.title,
                slug,
                description: data.description,
                genre: data.genre,
                price: data.price,
                coverImageUrl: finalCoverUrl,
                hasEbook: !!ebookFileUrl,
                ebookFileUrl: ebookFileUrl,
                // Force unlimited stock for digital goods
                stockStatus: 'UNLIMITED',
                stockQuantity: 999999,
                status: data.status as any,
                isFeatured: data.isFeatured || false,
                authorId: author.id
            }
        });

        res.status(201).json(book);
    } catch (error: any) {
        console.error("❌ Create Book Error:", error);
        console.error("Error details:", error.message);
        console.error("Stack:", error.stack);
        res.status(500).json({ error: 'Failed to create book', details: error.message });
    }
};

export const updateBook = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = bookSchema.partial().parse(req.body);

        const book = await prisma.book.update({
            where: { id: id as string },
            data: {
                ...data,
                status: data.status as any
            }
        });

        res.json(book);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update book' });
    }
};

export const deleteBook = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.book.delete({ where: { id: id as string } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete book' });
    }
};
