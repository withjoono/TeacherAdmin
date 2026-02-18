
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const arenaCount = await prisma.arena.count();
        const memberCount = await prisma.arenaMember.count();
        console.log('Arena count:', arenaCount);
        console.log('ArenaMember count:', memberCount);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
