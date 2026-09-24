import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TransportClient } from "@/components/transport/transport-client";

export const dynamic = "force-dynamic";

export default async function TransportPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const routes = await prisma.route.findMany({
    where: { institutionId: user.institutionId },
    include: {
      vehicle: true,
      stops: { orderBy: { stopOrder: "asc" } },
    },
  });

  const formatted = routes.map((r) => ({
    id: r.id,
    routeName: r.routeName,
    vehicleNumber: r.vehicle?.vehicleNumber || "UP-16-BT-4091",
    driverName: r.vehicle?.driverName || "Mr. Gurpreet Singh",
    driverPhone: r.vehicle?.driverPhone || "+91 98111 22334",
    capacity: r.vehicle?.capacity || 45,
    stops: r.stops.map((s) => ({
      id: s.id,
      stopName: s.stopName,
      stopOrder: s.stopOrder,
      pickupTime: s.pickupTime,
      dropTime: s.dropTime,
      feeAmount: s.feeAmount,
    })),
  }));

  return <TransportClient routes={formatted} />;
}
