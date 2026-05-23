"use client";

import { useEffect, useState } from "react";

type Props = {
  expiresAt: string;
};

export default function CountdownTimer({
  expiresAt,
}: Props) {

  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {

    const interval = setInterval(() => {

      const now = new Date().getTime();

      const expiry =
        new Date(expiresAt).getTime();

      const difference = expiry - now;

      if (difference <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
        return;
      }

      const minutes =
        Math.floor(difference / 1000 / 60);

      const seconds =
        Math.floor((difference / 1000) % 60);

      setTimeLeft(
        `${minutes}m ${seconds}s`
      );

    }, 1000);

    return () => clearInterval(interval);

  }, [expiresAt]);

  return (
    <span className="text-red-600 font-semibold">
      {timeLeft}
    </span>
  );
}