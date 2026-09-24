import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { HostelClient } from "@/components/hostel/hostel-client";

export const dynamic = "force-dynamic";

export default async function HostelPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hostels = await prisma.hostel.findMany({
    where: { institutionId: user.institutionId },
    include: {
      rooms: true,
    },
  });

  const formatted =
    hostels.length > 0
      ? hostels.map((h) => ({
          id: h.id,
          name: h.name,
          type: h.type,
          wardenName: h.wardenName,
          wardenPhone: h.wardenPhone,
          rooms: h.rooms.map((r) => ({
            id: r.id,
            roomNumber: r.roomNumber,
            floor: r.floor,
            totalBeds: r.totalBeds,
            occupiedBeds: r.occupiedBeds,
            feePerTerm: r.feePerTerm,
          })),
        }))
      : [
          {
            id: "hostel-1",
            name: "Tagore Boys Residency",
            type: "BOYS",
            wardenName: "Mr. Satish Kulkarni",
            wardenPhone: "+91 98122 33445",
            rooms: [
              { id: "r-101", roomNumber: "A-101", floor: 1, totalBeds: 2, occupiedBeds: 2, feePerTerm: 35000 },
              { id: "r-102", roomNumber: "A-102", floor: 1, totalBeds: 2, occupiedBeds: 1, feePerTerm: 35000 },
              { id: "r-201", roomNumber: "A-201", floor: 2, totalBeds: 3, occupiedBeds: 2, feePerTerm: 30000 },
            ],
          },
          {
            id: "hostel-2",
            name: "Gargi Girls Residency",
            type: "GIRLS",
            wardenName: "Mrs. Meena Deshmukh",
            wardenPhone: "+91 98122 33446",
            rooms: [
              { id: "r-g101", roomNumber: "B-101", floor: 1, totalBeds: 2, occupiedBeds: 2, feePerTerm: 35000 },
              { id: "r-g102", roomNumber: "B-102", floor: 1, totalBeds: 2, occupiedBeds: 0, feePerTerm: 35000 },
            ],
          },
        ];

  return <HostelClient hostels={formatted} />;
}
