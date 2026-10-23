import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error: "Demo role switching has been permanently disabled for production security and tenant isolation. Please sign in with authorized institutional credentials.",
    },
    { status: 403 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Demo role switching has been permanently disabled for production security and tenant isolation. Please sign in with authorized institutional credentials.",
    },
    { status: 403 }
  );
}
