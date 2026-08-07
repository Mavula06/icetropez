import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const bank = await prisma.companyBank.findFirst();

  if (!bank) {
    await prisma.companyBank.create({
      data: {
        companyName: "Icetropez.Vest",
        bankName: "Absa",
        accountNumber: "9391763831",
        branchCode: "632005",
        accountType: "Cheque",
        isActive: true,
      },
    });
  }
}

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());
