import DetailShell from './_components/DetailShell';

export default async function TodoMobileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DetailShell listId={id} />;
}
