import { NextRequest, NextResponse } from "next/server";
import { ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await params;

    const reservation =
      await prisma.reservation.findUnique({
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

    if (
      reservation.status !==
      ReservationStatus.PENDING
    ) {
      return NextResponse.json(
        { error: "Reservation is not pending" },
        { status: 400 }
      );
    }

    // PROPER 410 HANDLING
    if (reservation.expiresAt < new Date()) {

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

        // Mark reservation released/expired
        await tx.reservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: ReservationStatus.RELEASED,
          },
        });
      });

      return NextResponse.json(
        { error: "Reservation expired" },
        { status: 410 }
      );
    }

    // CONFIRM RESERVATION
    await prisma.$transaction(async (tx) => {

      await tx.inventory.updateMany({
        where: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
        data: {
          totalStock: {
            decrement: reservation.quantity,
          },

          reservedStock: {
            decrement: reservation.quantity,
          },
        },
      });

      await tx.reservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          status: ReservationStatus.CONFIRMED,
        },
      });
    });

    return NextResponse.json({
      message:
        "Reservation confirmed successfully",
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Confirmation failed" },
      { status: 500 }
    );
  }
}