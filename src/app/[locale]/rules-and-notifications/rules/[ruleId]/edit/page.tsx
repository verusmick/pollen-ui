import { RuleFormContainer } from '../../../components';

interface EditRulePageProps {
  params: Promise<{
    ruleId: string;
  }>;
}

export default async function EditRulePage({ params }: EditRulePageProps) {
  const { ruleId } = await params;

  return <RuleFormContainer key={ruleId} mode="edit" ruleId={ruleId} />;
}
