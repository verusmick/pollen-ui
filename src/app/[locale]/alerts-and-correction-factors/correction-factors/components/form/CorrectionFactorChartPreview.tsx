'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslations } from 'next-intl';

import type {
  CorrectionFactorPreviewSeries,
  CorrectionFactorPreviewStatus,
} from '../../types';

interface CorrectionFactorChartPreviewProps {
  status: CorrectionFactorPreviewStatus;
  series: CorrectionFactorPreviewSeries | null;
  errorMessage?: string | null;
}

function formatValue(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2);
}

export function CorrectionFactorChartPreview({
  status,
  series,
  errorMessage = null,
}: CorrectionFactorChartPreviewProps) {
  const t = useTranslations('correctionFactorsPage.form.preview');

  return (
    <section className="min-w-0 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t('title')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('description')}
          </p>
        </div>
      </div>

      {status === 'loading' ? (
        <div className="mt-4 flex min-h-[340px] items-center justify-center rounded-lg border border-dashed border-border bg-background px-6 text-center text-sm text-muted-foreground">
          {t('loading')}
        </div>
      ) : null}

      {status === 'idle' ? (
        <div className="mt-4 flex min-h-[340px] items-center justify-center rounded-lg border border-dashed border-border bg-background px-6 text-center text-sm text-muted-foreground">
          {t('idle')}
        </div>
      ) : null}

      {status === 'empty' ? (
        <div className="mt-4 flex min-h-[340px] items-center justify-center rounded-lg border border-dashed border-border bg-background px-6 text-center text-sm text-muted-foreground">
          {t('empty')}
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="mt-4 flex min-h-[340px] items-center justify-center rounded-lg border border-red-200 bg-red-50 px-6 text-center text-sm text-red-700">
          {errorMessage ?? t('error')}
        </div>
      ) : null}

      {status === 'ready' && series ? (
        <div className="mt-4 h-[340px] min-w-0 rounded-lg border border-border bg-background p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series.points}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                minTickGap={24}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={formatValue}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatValue(value),
                  name,
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="originalValue"
                name={t('series.original')}
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="correctedValue"
                name={t('series.corrected')}
                stroke="#ea580c"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </section>
  );
}
