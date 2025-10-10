import DeviceVariantSync from '@/app/todo/_components/DeviceVariantSync.client'
import DoneTimelineLayout from './_components/DoneTimelineLayout.client'

export default async function DesktopTodoDonePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <>
      <DeviceVariantSync initialVariant="desktop" />
      <DoneTimelineLayout listId={id} />
    </>
  )
}
