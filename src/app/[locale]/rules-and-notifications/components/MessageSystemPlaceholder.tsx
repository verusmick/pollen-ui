import { getTranslations } from 'next-intl/server';

type MessageSystemPlaceholderModule =
  | 'notifications'
  | 'rules'
  | 'notificationMessages';

interface MessageSystemPlaceholderProps {
  module: MessageSystemPlaceholderModule;
}

export async function MessageSystemPlaceholder({
  module,
}: MessageSystemPlaceholderProps) {
  const t = await getTranslations('messageSystemPage');

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 pb-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">
          {t(`placeholders.${module}.title`)}
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {t(`placeholders.${module}.description`)}
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        {t(`placeholders.${module}.pending`)}
      </section>
    </main>
  );
}
