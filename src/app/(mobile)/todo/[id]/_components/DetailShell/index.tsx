import DetailShellClient from './parts/DetailShell.client';

type DetailShellProps = {
  listId: string;
};

export default function DetailShell(props: DetailShellProps) {
  return <DetailShellClient {...props} />;
}
