"use client";
interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export const LoadingSpinner = ({ size, color }: LoadingSpinnerProps) => {
  return (
    <div
      className={`border-4 ${color} border-t-transparent rounded-full animate-spin`}
      style={{ width: size, height: size }}
    />
  );
};


