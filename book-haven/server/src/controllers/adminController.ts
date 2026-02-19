import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// --- Data Persistence (JSON) ---
const DATA_FILE = path.join(__dirname, '../../data/books.json');

const loadBooks = (): any[] => {
    try {
        if (!fs.existsSync(DATA_FILE)) return [];
        let data = fs.readFileSync(DATA_FILE, 'utf-8');

        // Strip Byte Order Mark (BOM) if it exists (common Windows issue)
        if (data.charCodeAt(0) === 0xFEFF || data.charCodeAt(0) === 0xFFFD) {
            data = data.substring(1);
        }

        // Final fallback: remove anything before the first '['
        const firstBracket = data.indexOf('[');
        if (firstBracket !== -1) {
            data = data.substring(firstBracket);
        }

        return JSON.parse(data.trim());
    } catch (error) {
        console.error("Error loading books:", error);
        return [];
    }
};

const saveBooks = (books: any[]) => {
    try {
        // Ensure directory exists
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2));
    } catch (error) {
        console.error("Error saving books:", error);
    }
};

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';
        if (file.fieldname === 'coverImage') {
            uploadPath += 'covers/';
        } else if (file.fieldname === 'bookFile') {
            uploadPath += 'books/';
        }

        // Ensure dir exists
        const fullPath = path.join(__dirname, '../../', uploadPath);
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

// --- Controllers ---

export const getBooks = (req: Request, res: Response) => {
    const books = loadBooks();
    res.json(books);
};

export const createBook = (req: Request, res: Response) => {
    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const body = req.body;

        const newBook = {
            id: Date.now().toString(),
            title: body.title,
            author: { name: body.authorName || 'Unknown' }, // Match frontend expectation
            price: parseFloat(body.price) || 0,
            description: body.description,
            coverImageUrl: body.coverImageUrl || '',
            isFeatured: body.isFeatured === 'true',
            status: body.status || 'DRAFT',
            hasEbook: false,
            bookFilePath: '',
            createdAt: new Date().toISOString()
        };

        // Handle uploaded files
        if (files) {
            if (files.coverImage && files.coverImage[0]) {
                // Construct URL based on static serve Config
                // server.ts serves /uploads -> uploads/
                newBook.coverImageUrl = `http://localhost:3000/uploads/covers/${files.coverImage[0].filename}`;
            }

            if (files.bookFile && files.bookFile[0]) {
                newBook.hasEbook = true;
                newBook.bookFilePath = `http://localhost:3000/uploads/books/${files.bookFile[0].filename}`;
            }
        }

        const books = loadBooks();
        books.push(newBook);
        saveBooks(books);

        res.status(201).json(newBook);
    } catch (error) {
        console.error("Create Book Error:", error);
        res.status(500).json({ error: "Failed to create book" });
    }
};
