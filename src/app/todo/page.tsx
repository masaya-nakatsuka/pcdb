import { headers } from 'next/headers';

import DesktopTodoPage from '../(desktop)/todo/DesktopTodoPage';
import MobileTodoPage from '../(mobile)/todo/MobileTodoPage';
import { DEVICE_VARIANT_HEADER } from './device-constants';

export default async function TodoEntryPage() {
  const headerList = await headers();
  const deviceVariant = headerList.get(DEVICE_VARIANT_HEADER);

  if (deviceVariant === 'mobile') {
    return <MobileTodoPage />;
  }

  return <DesktopTodoPage />;
}
