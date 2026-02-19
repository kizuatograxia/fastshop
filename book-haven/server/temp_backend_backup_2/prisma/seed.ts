import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Hash the password
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Create admin user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@test.com' },
        update: {},
        create: {
            email: 'admin@test.com',
            passwordHash,
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
            emailVerified: true,
            status: 'ACTIVE'
        }
    });

    // Create Categories/Genres
    const fiction = await prisma.genre.upsert({
        where: { slug: 'fiction' },
        update: {},
        create: { name: 'Fiction', slug: 'fiction', description: 'Imaginary storytelling' }
    });
    const business = await prisma.genre.upsert({
        where: { slug: 'business' },
        update: {},
        create: { name: 'Business', slug: 'business', description: 'Corporate strategies and economics' }
    });
    const selfHelp = await prisma.genre.upsert({
        where: { slug: 'self-help' },
        update: {},
        create: { name: 'Self Help', slug: 'self-help', description: 'Personal improvement' }
    });

    // Create Author
    const johnDoe = await prisma.author.upsert({
        where: { slug: 'john-doe' },
        update: {},
        create: { name: 'John Doe', slug: 'john-doe', bio: 'Best selling author' }
    });

    // Create Books
    await prisma.book.create({
        data: {
            title: 'Digital Marketing Secrets',
            slug: 'digital-marketing-secrets-' + Date.now(),
            price: 29.99,
            description: 'Master the art of online sales.',
            status: 'PUBLISHED',
            coverImageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&q=80',
            primaryGenreId: business.id,
            authorId: johnDoe.id,
            stockStatus: 'UNLIMITED',
            stockQuantity: 9999,
            hasEbook: true
        }
    });

    await prisma.book.create({
        data: {
            title: 'The Calm Mind',
            slug: 'the-calm-mind-' + Date.now(),
            price: 19.99,
            description: 'Achieve peace in a chaotic world.',
            status: 'PUBLISHED',
            coverImageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80',
            primaryGenreId: selfHelp.id,
            authorId: johnDoe.id,
            stockStatus: 'UNLIMITED',
            stockQuantity: 9999,
            hasEbook: true
        }
    });

    console.log('✅ Sample data seeded!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
