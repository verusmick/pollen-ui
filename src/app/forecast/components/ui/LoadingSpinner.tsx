"use client";

import React from "react";

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

const LoadingSpinner = ({ size, color }: LoadingSpinnerProps) => {
  return (
    <div
      className={`border-4 ${color} border-t-transparent rounded-full animate-spin`}
      style={{ width: size, height: size }}
    />
  );
};

export default LoadingSpinner;
