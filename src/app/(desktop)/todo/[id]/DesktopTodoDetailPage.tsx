import DeviceVariantSync from '../../../todo/_components/DeviceVariantSync.client'
import Layout from './_components/Layout'

export default async function TodoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <>
      <DeviceVariantSync initialVariant="desktop" />
      <Layout listId={id} />
    </>
  )
}
