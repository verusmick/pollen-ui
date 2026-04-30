import { NotificationMessageFormContainer } from '../../../components';

interface EditNotificationMessagePageProps {
  params: Promise<{
    notificationMessageId: string;
  }>;
}

export default async function EditNotificationMessagePage({
  params,
}: EditNotificationMessagePageProps) {
  const { notificationMessageId } = await params;

  return (
    <NotificationMessageFormContainer
      key={notificationMessageId}
      mode="edit"
      notificationMessageId={notificationMessageId}
    />
  );
}
