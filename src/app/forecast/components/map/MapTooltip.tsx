interface MapTooltipProps {
  hoverInfo: {
    object: any;
    x: number;
    y: number;
  } | null;
}

export default function MapTooltip({ hoverInfo }: MapTooltipProps) {
  if (!hoverInfo || !hoverInfo.object) return null;

  const { object, x, y } = hoverInfo;
  const intensity = object.intensity;

  // Convert intensity to pollen level text
  const pollenLevel =
    intensity <= 0.2
      ? "Very Low"
      : intensity <= 0.4
      ? "Low"
      : intensity <= 0.6
      ? "Medium"
      : intensity <= 0.8
      ? "High"
      : "Very High";

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{ left: x, top: y, transform: "translate(-50%, -100%)" }}
    >
      <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg max-w-xs">
        <div className="font-semibold">Pollen Information</div>
        <div>Level: {pollenLevel}</div>
        <div>Lat: {object.position[1].toFixed(4)}</div>
        <div>Lon: {object.position[0].toFixed(4)}</div>
      </div>
      {/* Tooltip arrow */}
      <div
        className="absolute top-full left-1/2 transform -translate-x-1/2 
                    border-8 border-transparent border-t-gray-800"
      />
    </div>
  );
}
