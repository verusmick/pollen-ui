import { redirect } from 'next/navigation';

interface EditNotificationMessagePageProps {
  params: Promise<{
    notificationMessageId: string;
  }>;
}

export default async function EditNotificationMessagePage({
  params,
}: EditNotificationMessagePageProps) {
  const { notificationMessageId } = await params;

  redirect(`/alerts-and-correction-factors/alerts/${notificationMessageId}/edit`);
}
