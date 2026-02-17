type AlertLevel = 'red' | 'yellow' | 'green';
type AlertStatus = 'open' | 'resolved';

interface AlertCardProps {
  level: AlertLevel;
  title: string;
  value: string;
  rule: string;
  time: string;
  status: AlertStatus;
  correctionApplied?: boolean;
}

export function AlertCard({
  level,
  title,
  value,
  rule,
  time,
  status,
  correctionApplied,
}: AlertCardProps) {
  const levelColor = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-400',
    green: 'bg-green-500',
  }[level];

  const statusColor =
    status === 'resolved' ? 'text-green-500' : 'text-foreground';

  return (
    <div className="flex items-stretch rounded-xl border border-border bg-card shadow-sm hover:border-primary transition-colors">
      {/* Left Color Indicator */}
      <div className={`w-2 rounded-l-xl ${levelColor}`} />

      {/* Content */}
      <div className="flex flex-1 justify-between p-4">
        {/* Left side */}
        <div className="space-y-1 text-sm">
          <div className="font-medium">{title}</div>
          <div className="text-muted-foreground">{value}</div>
          <div className="text-muted-foreground">Triggered by rule: {rule}</div>
          <div className="text-xs text-muted-foreground">{time}</div>
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end gap-2 text-sm">
          {correctionApplied && (
            <span className="text-xs text-muted-foreground">
              Correction Applied
            </span>
          )}

          <span className={`font-medium ${statusColor}`}>
            Status: {status === 'resolved' ? 'Resolved' : 'Open'}
          </span>

          <button className="text-primary text-xs hover:underline">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}


