interface MapZoomControlsProps {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  onZoomChange: (newZoom: number) => void;
}

export default function MapZoomControls({
  zoom,
  minZoom,
  maxZoom,
  onZoomChange,
}: MapZoomControlsProps) {
  const handleZoomIn = () => onZoomChange(Math.min(zoom + 1, maxZoom));
  const handleZoomOut = () => onZoomChange(Math.max(zoom - 1, minZoom));

  return (
    <div className="absolute bottom-10 right-8 z-50">
      <div className="bg-card backdrop-blur-md rounded-xl shadow-lg flex flex-col">
        <button
          onClick={handleZoomIn}
          className="px-4 py-2 text-lg font-bold hover:bg-neutral-900 rounded-t-xl cursor-pointer"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="px-4 py-2 text-lg font-bold hover:bg-neutral-900 rounded-b-xl cursor-pointer"
        >
          -
        </button>
      </div>
    </div>
  );
}
