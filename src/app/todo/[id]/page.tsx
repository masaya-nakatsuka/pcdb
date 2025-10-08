import { cookies, headers } from 'next/headers';

import DesktopTodoDetailPage from '../../(desktop)/todo/[id]/DesktopTodoDetailPage';
import MobileTodoDetailPage from '../../(mobile)/todo/[id]/MobileTodoDetailPage';
import {
  DEVICE_VARIANT_COOKIE,
  DEVICE_VARIANT_HEADER,
  normalizeDeviceVariant,
} from '../device-constants';

type DetailPageProps = Parameters<typeof DesktopTodoDetailPage>[0];

export default async function TodoDetailEntryPage(props: DetailPageProps) {
  const headerList = await headers();
  const cookieStore = await cookies();
  const headerVariant = normalizeDeviceVariant(headerList.get(DEVICE_VARIANT_HEADER));
  const cookieVariant = normalizeDeviceVariant(
    cookieStore.get(DEVICE_VARIANT_COOKIE)?.value,
  );
  const deviceVariant = headerVariant ?? cookieVariant;

  if (deviceVariant === 'mobile') {
    return <MobileTodoDetailPage {...props} />;
  }

  return <DesktopTodoDetailPage {...props} />;
}
