import { db } from "@/db";
import { leads } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const allLeads = await db.select().from(leads).orderBy(leads.id);
    return NextResponse.json(allLeads);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, company, message } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "이름과 이메일은 필수입니다." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "유효하지 않은 이메일 형식입니다." },
        { status: 400 }
      );
    }

    const [newLead] = await db
      .insert(leads)
      .values({ name, email, phone, company, message })
      .returning();

    return NextResponse.json(newLead, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      return NextResponse.json(
        { error: "이미 등록된 이메일입니다." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
}
