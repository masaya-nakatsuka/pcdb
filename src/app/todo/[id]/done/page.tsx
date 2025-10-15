import { cookies, headers } from 'next/headers'

import DesktopTodoDonePage from '../../../(desktop)/todo/[id]/done/DesktopTodoDonePage'
import MobileTodoDonePage from '../../../(mobile)/todo/[id]/done/MobileTodoDonePage'
import {
  DEVICE_VARIANT_COOKIE,
  DEVICE_VARIANT_HEADER,
  normalizeDeviceVariant,
} from '../../device-constants'

type DetailPageProps = Parameters<typeof DesktopTodoDonePage>[0]

export default async function TodoDoneEntryPage(props: DetailPageProps) {
  const headerList = await headers()
  const cookieStore = await cookies()
  const headerVariant = normalizeDeviceVariant(headerList.get(DEVICE_VARIANT_HEADER))
  const cookieVariant = normalizeDeviceVariant(cookieStore.get(DEVICE_VARIANT_COOKIE)?.value)
  const deviceVariant = headerVariant ?? cookieVariant

  if (deviceVariant === 'mobile') {
    return <MobileTodoDonePage {...props} />
  }

  return <DesktopTodoDonePage {...props} />
}
