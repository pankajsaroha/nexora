import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: "parent@nexora.demo" }, { roleCode: "PARENT" }],
    },
  });

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol.replace(":", "") || "http";
  const redirectUrl = `${proto}://${host}/dashboard`;

  const response = NextResponse.redirect(redirectUrl);

  if (user) {
    response.cookies.set("nexora_session_user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }

  return response;
}
