import Layout from './_components/Layout'

export default async function TodoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <Layout listId={id} />
}
