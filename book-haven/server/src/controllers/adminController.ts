import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../lib/db';

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';
        if (file.fieldname === 'coverImage') {
            uploadPath += 'covers/';
        } else if (file.fieldname === 'bookFile') {
            uploadPath += 'books/';
        }

        // Map natively to the Railway Mount Volume if on production
        let fullPath = process.env.RAILWAY_ENVIRONMENT
            ? path.join('/app', uploadPath)
            : path.join(__dirname, '../../', uploadPath);

        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
        cb(null, fullPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({ storage: storage });

// --- Helper: serialize DB book to frontend-compatible format ---
const serializeBook = (book: any) => ({
    ...book,
    author: book.author || { name: 'Unknown', slug: 'unknown' },
    publisher: book.publisher || null,
    releaseDate: book.releaseDate ? book.releaseDate.toISOString().split('T')[0] : null,
    createdAt: book.createdAt ? book.createdAt.toISOString() : null,
});

// --- Controllers ---

export const getBooks = async (req: Request, res: Response) => {
    try {
        const featured = req.query.featured as string | undefined;
        const genre = req.query.genre as string | undefined;
        const limit = req.query.limit as string | undefined;
        const sort = req.query.sort as string | undefined;

        const where: any = {};
        if (featured === 'true') where.isFeatured = true;
        if (genre) where.genre = genre;

        const orderBy: any = {};
        if (sort === 'newest') orderBy.createdAt = 'desc';

        const books = await db.book.findMany({
            where,
            orderBy: Object.keys(orderBy).length > 0 ? orderBy : { createdAt: 'desc' },
            take: limit ? parseInt(limit as string) : undefined,
            include: {
                author: true,
                publisher: true,
            }
        });

        return res.json(books.map(serializeBook));
    } catch (error) {
        console.error('getBooks error:', error);
        return res.status(500).json({ error: 'Failed to fetch books' });
    }
};

export const getBookBySlug = async (req: Request, res: Response) => {
    try {
        const slug = req.params.slug as string;
        const book = await db.book.findUnique({
            where: { slug: slug },
            include: { author: true, publisher: true }
        });

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        return res.json(serializeBook(book));
    } catch (error) {
        console.error('getBookBySlug error:', error);
        return res.status(500).json({ error: 'Failed to fetch book details' });
    }
};

export const createBook = async (req: Request, res: Response) => {
    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const body = req.body;

        const authorSlug = (body.authorName || 'unknown').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const author = await db.author.upsert({
            where: { slug: authorSlug },
            update: {},
            create: {
                name: body.authorName || 'Unknown',
                slug: authorSlug,
                photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
                bio: 'Author bio coming soon.',
                genres: ['Fiction'],
            }
        });

        const pubSlug = 'bookvault-publishing';
        const publisher = await db.publisher.upsert({
            where: { slug: pubSlug },
            update: {},
            create: {
                name: 'BookVault Publishing',
                slug: pubSlug,
                logo: ''
            }
        });

        let coverImage = body.coverImageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400';
        let bookFilePath = '';
        let hasEbook = false;

        if (files) {
            if (files.coverImage && files.coverImage[0]) {
                coverImage = `/uploads/covers/${files.coverImage[0].filename}`;
            }
            if (files.bookFile && files.bookFile[0]) {
                hasEbook = true;
                bookFilePath = `/uploads/books/${files.bookFile[0].filename}`;
            }
        }

        const slug = (body.title || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8);

        const newBook = await db.book.create({
            data: {
                title: body.title,
                slug,
                authorId: author.id,
                publisherId: publisher.id,
                price: parseFloat(body.price) || 0,
                description: body.description,
                shortDescription: body.description ? body.description.substring(0, 100) : '',
                coverImage,
                rating: 5,
                reviewCount: 0,
                format: ['ebook'],
                genre: body.genre || 'Fiction',
                releaseDate: new Date(),
                language: 'English',
                isbn: '978-' + Math.floor(Math.random() * 10000000000),
                status: 'available',
                isFeatured: body.isFeatured === 'true',
                totalSales: 0,
                weeklySales: 0,
                hasEbook,
                bookFilePath,
            },
            include: { author: true, publisher: true }
        });

        return res.status(201).json(serializeBook(newBook));
    } catch (error: any) {
        console.error('Create Book Error:', error);
        return res.status(500).json({ error: error.message || 'Failed to create book' });
    }
};

export const deleteBook = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await db.book.delete({
            where: { id: id }
        });
        return res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('deleteBook error:', error);
        return res.status(500).json({ error: 'Failed to delete book. It may be linked to existing orders.' });
    }
};
