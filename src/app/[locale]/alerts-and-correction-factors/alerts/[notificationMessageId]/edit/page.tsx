import { AlertFormContainer } from '../../components';

interface EditAlertPageProps {
  params: Promise<{
    notificationMessageId: string;
  }>;
}

export default async function EditAlertPage({ params }: EditAlertPageProps) {
  const { notificationMessageId } = await params;

  return (
    <AlertFormContainer
      key={notificationMessageId}
      notificationMessageId={notificationMessageId}
    />
  );
}
