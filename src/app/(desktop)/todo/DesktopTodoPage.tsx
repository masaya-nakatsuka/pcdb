import DeviceVariantSync from '../../todo/_components/DeviceVariantSync.client'
import ListShell from './_components/ListShell'

export default function TodoPage() {
  return (
    <>
      <DeviceVariantSync initialVariant="desktop" />
      <ListShell />
    </>
  )
}
