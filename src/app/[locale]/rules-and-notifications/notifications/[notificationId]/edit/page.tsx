import { NotificationFormContainer } from '../../../components';

interface EditNotificationPageProps {
  params: Promise<{
    notificationId: string;
  }>;
}

export default async function EditNotificationPage({
  params,
}: EditNotificationPageProps) {
  const { notificationId } = await params;

  return (
    <NotificationFormContainer
      key={notificationId}
      mode="edit"
      notificationId={notificationId}
    />
  );
}
