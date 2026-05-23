import { NextResponse } from "next/server";
import { ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const expiredReservations = await prisma.reservation.findMany({
      where: {
        status: ReservationStatus.PENDING,
        expiresAt: {
          lte: new Date(),
        },
      },
    });

    for (const reservation of expiredReservations) {
      await prisma.$transaction(async (tx) => {
        // Release reserved stock
        await tx.inventory.updateMany({
          where: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId,
          },
          data: {
            reservedStock: {
              decrement: reservation.quantity,
            },
          },
        });

        // Mark reservation as expired
        await tx.reservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: ReservationStatus.RELEASED,
          },
        });
      });
    }

    return NextResponse.json({
      message: "Cleanup completed",
      expiredReservations,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}