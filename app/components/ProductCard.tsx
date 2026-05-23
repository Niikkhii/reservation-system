"use client";

import WarehouseCard from "./WarehouseCard";

type Props = {
  product: any;
  reserveProduct: (
    productId: string,
    warehouseId: string,
    productName: string
  ) => void;
  loading: boolean;
};

export default function ProductCard({
  product,
  reserveProduct,
  loading,
}: Props) {

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">

      <h2 className="text-5xl font-bold text-gray-800">
        {product.name}
      </h2>

      <p className="text-gray-500 mt-2 mb-8 text-lg">
        {product.description}
      </p>

      <div className="space-y-5">

        {product.inventories.map(
          (inventory: any) => (
            <WarehouseCard
              key={inventory.id}
              inventory={inventory}
              loading={loading}
              onReserve={() =>
                reserveProduct(
                  product.id,
                  inventory.warehouse.id,
                  product.name
                )
              }
            />
          )
        )}
      </div>
    </div>
  );
}