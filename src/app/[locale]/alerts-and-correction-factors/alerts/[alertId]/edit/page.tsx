import { AlertFormContainer } from '../../components';

interface EditAlertPageProps {
  params: Promise<{
    alertId: string;
  }>;
}

export default async function EditAlertPage({ params }: EditAlertPageProps) {
  const { alertId } = await params;

  return <AlertFormContainer key={alertId} mode="edit" alertId={alertId} />;
}
