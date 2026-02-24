export function FiltersBar() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        placeholder="Rule Name"
        className="h-9 px-3 rounded-md border border-border bg-card text-sm"
      />

      <select className="h-9 px-3 rounded-md border border-border bg-card text-sm">
        <option>Pollen type</option>
      </select>

      <select className="h-9 px-3 rounded-md border border-border bg-card text-sm">
        <option>Station</option>
      </select>

      <select className="h-9 px-3 rounded-md border border-border bg-card text-sm">
        <option>Status</option>
      </select>

      <button className="h-9 px-4 rounded-md bg-primary text-background text-sm font-medium">
        Reset Filters
      </button>
    </div>
  );
}


