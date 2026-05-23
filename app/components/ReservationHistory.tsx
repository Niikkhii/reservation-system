"use client";

type Props = {
  reservations: any[];
};

export default function ReservationHistory({
  reservations,
}: Props) {

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 mt-12">

      <h2 className="text-4xl font-bold text-slate-800 mb-8">
        Reservation History
      </h2>

      <div className="space-y-4">

        {reservations.map((reservation) => (

          <div
            key={reservation.id}
            className="border rounded-2xl p-5 flex justify-between items-center"
          >

            <div>

              <p className="font-bold text-lg">
                {reservation.productName}
              </p>

              <p className="text-slate-500">
                Quantity:
                {" "}
                {reservation.quantity}
              </p>

            </div>

            <div className="text-right">

              <span
                className={`px-4 py-2 rounded-full text-white font-semibold
                ${
                  reservation.status === "CONFIRMED"
                    ? "bg-green-500"
                    : reservation.status === "RELEASED"
                    ? "bg-orange-500"
                    : reservation.status === "EXPIRED"
                    ? "bg-red-500"
                    : "bg-blue-500"
                }`}
              >
                {reservation.status}
              </span>

              <p className="text-sm text-slate-400 mt-2">
                {new Date(
                  reservation.createdAt
                ).toLocaleString()}
              </p>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}