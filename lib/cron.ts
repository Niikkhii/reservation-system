import cron from "node-cron";
import { prisma } from "@/lib/prisma";
import { ReservationStatus } from "@prisma/client";

cron.schedule("* * * * *", async () => {

  console.log("Running reservation cleanup...");

  try {

    const expiredReservations =
      await prisma.reservation.findMany({
        where: {
          status: ReservationStatus.PENDING,

          expiresAt: {
            lte: new Date(),
          },
        },
      });

    for (const reservation of expiredReservations) {

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
            id: reservation.id,
          },
          data: {
            status: ReservationStatus.RELEASED,
          },
        });
      });

      console.log(
        `Expired reservation cleaned: ${reservation.id}`
      );
    }

  } catch (error) {
    console.error("Cron cleanup failed:", error);
  }
});