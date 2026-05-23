"use client";

import CountdownTimer from "./CountdownTimer";

type Props = {
  reservation: any;
  onConfirm: () => void;
  onRelease: () => void;
};

export default function ReservationPanel({
  reservation,
  onConfirm,
  onRelease,
}: Props) {

  return (
    <div className="bg-white rounded-2xl shadow-lg border-l-4 border-green-500 p-8 mb-8">

      <h2 className="text-3xl font-bold text-green-700 mb-6">
        Active Reservation
      </h2>

      <div className="space-y-3 text-lg">

        <p>
          <span className="font-semibold">
            Product:
          </span>{" "}
          {reservation.productName}
        </p>

        <p>
          <span className="font-semibold">
            Reservation ID:
          </span>{" "}
          {reservation.id}
        </p>

        <p>
          <span className="font-semibold">
            Quantity:
          </span>{" "}
          {reservation.quantity}
        </p>

        <p>
          <span className="font-semibold">
            Status:
          </span>{" "}
          <span className="text-blue-600 font-bold">
            {reservation.status}
          </span>
        </p>

        <p>
          <span className="font-semibold">
            Expires In:
          </span>{" "}
          <CountdownTimer
            expiresAt={reservation.expiresAt}
          />
        </p>
      </div>

      <div className="flex gap-4 mt-8">

        <button
          onClick={onConfirm}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition"
        >
          Confirm
        </button>

        <button
          onClick={onRelease}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition"
        >
          Release
        </button>
      </div>
    </div>
  );
}