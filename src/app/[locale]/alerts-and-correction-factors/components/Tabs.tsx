export function Tabs() {
  return (
    <div className="flex border-b border-border px-4 pt-4">
      <button className="px-4 py-2 text-sm font-medium border-b-2 border-primary text-foreground">
        Alerts
      </button>

      <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        Correction Factors
      </button>
    </div>
  );
}

