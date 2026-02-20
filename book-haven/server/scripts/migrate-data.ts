import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const DATA_DIR = path.join(__dirname, '../../data');

async function main() {
    console.log('Starting migration from JSON to PostgreSQL...');

    // 1. Migrate Users
    const usersPath = path.join(DATA_DIR, 'users.json');
    if (fs.existsSync(usersPath)) {
        const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        console.log(`Found ${users.length} users to migrate.`);

        for (const user of users) {
            const exists = await prisma.user.findUnique({ where: { email: user.email } });
            if (!exists) {
                await prisma.user.create({
                    data: {
                        id: user.id,
                        email: user.email,
                        password: user.password,
                        name: user.name,
                        role: user.role,
                        createdAt: user.createdAt ? new Date(user.createdAt) : new Date()
                    }
                });
                console.log(`Migrated user: ${user.email}`);
            }
        }
    }

    // 2. Migrate Books (requires Author and Publisher creation)
    const booksPath = path.join(DATA_DIR, 'books.json');
    if (fs.existsSync(booksPath)) {
        let booksData = fs.readFileSync(booksPath, 'utf8');

        // Strip Byte Order Mark (BOM) if it exists
        if (booksData.charCodeAt(0) === 0xFEFF || booksData.charCodeAt(0) === 0xFFFD) {
            booksData = booksData.substring(1);
        }
        const firstBracket = booksData.indexOf('[');
        if (firstBracket !== -1) {
            booksData = booksData.substring(firstBracket);
        }

        const books = JSON.parse(booksData.trim());
        console.log(`Found ${books.length} books to migrate.`);

        for (const book of books) {
            // Upsert Author
            let authorSlug = book.author?.slug || 'unknown-author';
            let authorName = book.author?.name || 'Unknown Author';

            const author = await prisma.author.upsert({
                where: { slug: authorSlug },
                update: {},
                create: {
                    name: authorName,
                    slug: authorSlug,
                    photo: book.author?.photo || null,
                    bio: book.author?.bio || null,
                    genres: book.author?.genres || [],
                }
            });

            // Upsert Publisher
            let pubSlug = book.publisher?.slug || 'unknown-publisher';
            let pubName = book.publisher?.name || 'Unknown Publisher';

            const publisher = await prisma.publisher.upsert({
                where: { slug: pubSlug },
                update: {},
                create: {
                    name: pubName,
                    slug: pubSlug,
                    logo: book.publisher?.logo || null
                }
            });

            // Insert Book
            const bookExists = await prisma.book.findUnique({ where: { slug: book.slug } });
            if (!bookExists) {
                await prisma.book.create({
                    data: {
                        id: book.id,
                        title: book.title,
                        slug: book.slug,
                        authorId: author.id,
                        publisherId: publisher.id,
                        price: book.price || 0,
                        description: book.description,
                        shortDescription: book.shortDescription,
                        coverImage: book.coverImage,
                        rating: book.rating || 0,
                        reviewCount: book.reviewCount || 0,
                        format: book.format || ['ebook'],
                        genre: book.genre || 'Fiction',
                        releaseDate: book.releaseDate ? new Date(book.releaseDate) : new Date(),
                        language: book.language || 'English',
                        isbn: book.isbn,
                        status: book.status || 'available',
                        isFeatured: book.isFeatured || false,
                        totalSales: book.totalSales || 0,
                        weeklySales: book.weeklySales || 0,
                        hasEbook: book.hasEbook || false,
                        bookFilePath: book.bookFilePath || null,
                        createdAt: book.createdAt ? new Date(book.createdAt) : new Date()
                    }
                });
                console.log(`Migrated book: ${book.title}`);
            }
        }
    }

    console.log('Migration complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
