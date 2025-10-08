import DeviceVariantSync from '../../../todo/_components/DeviceVariantSync.client';
import DetailShell from './_components/DetailShell';

export default async function TodoMobileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <DeviceVariantSync initialVariant="mobile" />
      <DetailShell listId={id} />
    </>
  );
}
