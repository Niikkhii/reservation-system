import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReservationStatus } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const reservation = await prisma.reservation.findUnique({
      where: {
        id,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
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

      await tx.reservation.update({
        where: {
          id,
        },
        data: {
          status: ReservationStatus.RELEASED,
        },
      });
    });

    return NextResponse.json({
      message: "Reservation released successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Release failed" },
      { status: 500 }
    );
  }
}