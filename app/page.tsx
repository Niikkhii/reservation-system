"use client";

import { useEffect, useState } from "react";

import ProductCard from "./components/ProductCard";
import ReservationPanel from "./components/ReservationPanel";
import ReservationHistory from "./components/ReservationHistory";

export default function HomePage() {

  const [products, setProducts] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [reservation, setReservation] =
    useState<any>(null);

  const [reservations, setReservations] =
    useState<any[]>([]);

  async function fetchProducts() {

    try {

      const response = await fetch(
        "http://localhost:3000/api/products"
      );

      const data = await response.json();

      setProducts(data);

    } catch (error) {
      console.error(error);
    }
  }

  async function fetchReservations() {

    try {

      const response = await fetch(
        "http://localhost:3000/api/reservations"
      );

      const data = await response.json();

      setReservations(data.data || data);

    } catch (error) {
      console.error(error);
    }
  }

  async function reserveProduct(
    productId: string,
    warehouseId: string,
    productName: string
  ) {

    try {

      setLoading(true);

      const response = await fetch(
        "http://localhost:3000/api/reservations",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            productId,
            warehouseId,
            quantity: 1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }

      setReservation({
        ...data,
        productName,
      });

      fetchProducts();

      fetchReservations();

    } catch (error) {
      console.error(error);

    } finally {
      setLoading(false);
    }
  }

  async function confirmReservation() {

    if (!reservation) return;

    await fetch(
      `http://localhost:3000/api/reservations/${reservation.id}/confirm`,
      {
        method: "POST",
      }
    );

    setReservation(null);

    fetchProducts();

    fetchReservations();
  }

  async function releaseReservation() {

    if (!reservation) return;

    await fetch(
      `http://localhost:3000/api/reservations/${reservation.id}/release`,
      {
        method: "POST",
      }
    );

    setReservation(null);

    fetchProducts();

    fetchReservations();
  }

  useEffect(() => {

    fetchProducts();

    fetchReservations();

    const interval = setInterval(() => {

      fetchProducts();

      fetchReservations();

    }, 5000);

    return () => clearInterval(interval);

  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-10">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-6xl font-black text-slate-800 mb-3">
          Inventory Reservation System
        </h1>

        <p className="text-2xl text-slate-600 mb-12">
          Reserve inventory across warehouses instantly
        </p>

        {reservation && (
          <ReservationPanel
            reservation={reservation}
            onConfirm={confirmReservation}
            onRelease={releaseReservation}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              reserveProduct={reserveProduct}
              loading={loading}
            />
          ))}
        </div>

        <ReservationHistory
          reservations={reservations}
        />
      </div>
    </main>
  );
}