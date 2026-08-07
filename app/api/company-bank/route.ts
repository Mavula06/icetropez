import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const bank = await prisma.companyBank.findFirst({
      where: {
        isActive: true,
      },
      select: {
        companyName: true,
        bankName: true,
        accountNumber: true,
        branchCode: true,
        accountType: true,
      },
    });

    if (!bank) {
      return NextResponse.json(
        { message: "Company bank details not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(bank);
  } catch (error) {
    console.error("Company bank error:", error);

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
