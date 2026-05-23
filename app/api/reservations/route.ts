import { NextRequest, NextResponse } from "next/server";
import { ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// GET ALL RESERVATIONS
export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 5;

    const skip = (page - 1) * limit;

    const reservations = await prisma.reservation.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      page,
      limit,
      data: reservations,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

// CREATE RESERVATION
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      productId,
      warehouseId,
      quantity,
    } = body;

    if (!productId || !warehouseId || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {

      // Get inventory row
      const inventory = await tx.inventory.findFirst({
        where: {
          productId,
          warehouseId,
        },
      });

      if (!inventory) {
        throw new Error("Inventory not found");
      }

      const availableStock =
        inventory.totalStock - inventory.reservedStock;

      // Proper insufficient stock handling
      if (availableStock < quantity) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      // Atomic reservation update
      await tx.inventory.update({
        where: {
          id: inventory.id,
        },
        data: {
          reservedStock: {
            increment: quantity,
          },
        },
      });

      // Create reservation
      const reservation = await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,

          status: ReservationStatus.PENDING,

          expiresAt: new Date(
            Date.now() + 2 * 60 * 1000
          ),
        },
      });

      return reservation;
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error(error);

    // Proper 409 response
    if (
      error instanceof Error &&
      error.message === "INSUFFICIENT_STOCK"
    ) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Reservation failed",
      },
      {
        status: 500,
      }
    );
  }
}