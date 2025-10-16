interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay = ({ message }: LoadingOverlayProps) => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-card backdrop-blur-sm">
      <p className="text-xl mb-4">{message}</p>

      <div className="relative w-40 h-4 rounded-full overflow-hidden">
        <span className="absolute top-0 left-0 w-4 h-4 bg-white rounded-full animate-ball"></span>
      </div>

      <style jsx>{`
        @keyframes ballMove {
          0%,
          100% {
            left: 0;
          }
          50% {
            left: calc(100% - 1rem);
          }
        }
        .animate-ball {
          animation: ballMove 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
