import { headers } from 'next/headers';

import DesktopTodoDetailPage from '../../(desktop)/todo/[id]/DesktopTodoDetailPage';
import MobileTodoDetailPage from '../../(mobile)/todo/[id]/MobileTodoDetailPage';
import { DEVICE_VARIANT_HEADER } from '../device-constants';

type DetailPageProps = Parameters<typeof DesktopTodoDetailPage>[0];

export default async function TodoDetailEntryPage(props: DetailPageProps) {
  const headerList = await headers();
  const deviceVariant = headerList.get(DEVICE_VARIANT_HEADER);

  if (!(deviceVariant === 'mobile')) {
    return <MobileTodoDetailPage {...props} />;
  }

  return <DesktopTodoDetailPage {...props} />;
}
