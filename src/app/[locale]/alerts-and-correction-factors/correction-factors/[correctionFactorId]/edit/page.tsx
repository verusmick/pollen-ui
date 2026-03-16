import { CorrectionFactorFormContainer } from '../../components';

interface EditCorrectionFactorPageProps {
  params: Promise<{
    correctionFactorId: string;
  }>;
}

export default async function EditCorrectionFactorPage({
  params,
}: EditCorrectionFactorPageProps) {
  const { correctionFactorId } = await params;

  return (
    <CorrectionFactorFormContainer
      mode="edit"
      correctionFactorId={correctionFactorId}
    />
  );
}
