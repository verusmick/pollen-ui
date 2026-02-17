import {AlertCard} from "./AlertCard";

export function AlertsList() {
  return (
    <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-2">
      <AlertCard
        level="red"
        title="Red alert · Birch"
        value="247 pollen/m³ · Hof"
        rule="Birch Season Monitoring"
        time="2h ago"
        status="resolved"
        correctionApplied
      />

      <AlertCard
        level="yellow"
        title="Yellow alert · Grass"
        value="132 pollen/m³ · Feucht"
        rule="Grass Peak Season Monitoring"
        time="6h ago"
        status="open"
      />
    </div>
  );
}

