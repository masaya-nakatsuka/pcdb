import { cookies, headers } from 'next/headers';

import DesktopTodoPage from '../(desktop)/todo/DesktopTodoPage';
import MobileTodoPage from '../(mobile)/todo/MobileTodoPage';
import {
  DEVICE_VARIANT_COOKIE,
  DEVICE_VARIANT_HEADER,
  normalizeDeviceVariant,
} from './device-constants';

export default async function TodoEntryPage() {
  const headerList = await headers();
  const cookieStore = await cookies();
  const headerVariant = normalizeDeviceVariant(headerList.get(DEVICE_VARIANT_HEADER));
  const cookieVariant = normalizeDeviceVariant(
    cookieStore.get(DEVICE_VARIANT_COOKIE)?.value,
  );
  const deviceVariant = headerVariant ?? cookieVariant;

  if (deviceVariant === 'mobile') {
    return <MobileTodoPage />;
  }

  return <DesktopTodoPage />;
}
