import { cookies, headers } from 'next/headers'

import DesktopTodoDonePage from '../../../(desktop)/todo/[id]/done/DesktopTodoDonePage'
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
    // TODO: モバイル版のDoneタイムラインが用意できたら切り替える
    return <DesktopTodoDonePage {...props} />
  }

  return <DesktopTodoDonePage {...props} />
}
