import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const superAdminEmail = 'willianbarata@gmail.com'
    const superAdminPasswordStr = 'Will#2026'

    console.log(`Start seeding Super Admin for ${superAdminEmail}...`)

    const existingSuperAdmin = await prisma.user.findUnique({
        where: { email: superAdminEmail },
    })

    if (existingSuperAdmin) {
        console.log(`Super Admin already exists with email: ${superAdminEmail}`)
        return
    }

    const salt = 10
    const hashedPassword = await bcrypt.hash(superAdminPasswordStr, salt)

    const superAdmin = await prisma.user.create({
        data: {
            email: superAdminEmail,
            name: 'Willian Barata',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
        },
    })

    console.log(`Seeding finished. Super Admin created with ID: ${superAdmin.id}`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
