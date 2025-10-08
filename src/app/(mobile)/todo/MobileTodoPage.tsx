import DeviceVariantSync from '../../todo/_components/DeviceVariantSync.client';
import ListShell from './_components/ListShell';

export default function TodoMobilePage() {
  return (
    <>
      <DeviceVariantSync initialVariant="mobile" />
      <ListShell />
    </>
  );
}
