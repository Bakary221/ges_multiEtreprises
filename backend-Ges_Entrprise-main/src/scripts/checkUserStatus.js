const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { id: 41 },
      select: { id: true, email: true, status: true, companyId: true }
    });
    console.log(user);
  } catch (error) {
    console.error('Error querying user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
