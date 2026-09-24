import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LibraryClient } from "@/components/library/library-client";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const books = await prisma.book.findMany({
    where: { institutionId: user.institutionId },
    orderBy: { title: "asc" },
  });

  const formatted = books.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    isbn: b.isbn,
    category: b.category,
    totalCopies: b.totalCopies,
    availableCopies: b.availableCopies,
    rackLocation: b.rackLocation,
  }));

  return <LibraryClient books={formatted} />;
}
