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

    console.log('✅ Admin user created:', admin.email);
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Password: admin123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
