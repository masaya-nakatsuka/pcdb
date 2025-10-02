import LayoutClient from './parts/Layout.client'

type LayoutProps = {
  listId: string
}

export default function Layout(props: LayoutProps) {
  return <LayoutClient {...props} />
}
