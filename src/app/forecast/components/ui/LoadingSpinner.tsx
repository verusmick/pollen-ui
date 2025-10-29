"use client";

import React from "react";
import { usePartialLoadingStore } from "@/app/forecast/stores";
interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

const LoadingSpinner = ({ size = 40, color = "border-blue-500" }: LoadingSpinnerProps) => {
  const isLoading = usePartialLoadingStore((state) => state.isLoading);

  if (!isLoading) return null;

  return (
    <div
      className={`border-4 ${color} border-t-transparent rounded-full animate-spin`}
      style={{ width: size, height: size }}
    />
  );
};

export default LoadingSpinner;
