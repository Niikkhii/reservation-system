"use client";

type Props = {
  inventory: any;
  onReserve: () => void;
  loading: boolean;
};

export default function WarehouseCard({
  inventory,
  onReserve,
  loading,
}: Props) {

  const availableStock =
    inventory.totalStock -
    inventory.reservedStock;

  return (
    <div className="border rounded-2xl p-5 bg-gray-50">

      <div className="flex justify-between items-start">

        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            {inventory.warehouse.name}
          </h3>

          <p className="text-gray-500 mt-1">
            📍 {inventory.warehouse.location}
          </p>
        </div>

        <div className="text-right">
          <p className="text-gray-500">
            Available Stock
          </p>

          <p className="text-4xl font-bold text-green-600">
            {availableStock}
          </p>
        </div>
      </div>

      <button
        onClick={onReserve}
        disabled={availableStock <= 0 || loading}
        className={`mt-6 w-full py-3 rounded-xl text-white font-semibold transition
        ${
          availableStock <= 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {availableStock <= 0
          ? "Out Of Stock"
          : loading
          ? "Reserving..."
          : "Reserve Product"}
      </button>
    </div>
  );
}