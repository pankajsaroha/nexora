import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  cookies().delete("nexora_session_user_id");
  return NextResponse.json({ success: true });
}
