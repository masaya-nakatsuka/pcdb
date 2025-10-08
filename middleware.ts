import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  DEVICE_VARIANT_BREAKPOINT,
  DEVICE_VARIANT_COOKIE,
  DEVICE_VARIANT_COOKIE_MAX_AGE,
  DEVICE_VARIANT_HEADER,
  normalizeDeviceVariant,
  type DeviceVariant,
} from './src/app/todo/device-constants';

const MOBILE_USER_AGENT =
  /Android.+Mobile|iPhone|iPad|iPod|Mobile|Windows Phone|webOS|BlackBerry/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/todo')) {
    return NextResponse.next();
  }

  const cookieVariant = request.cookies.get(DEVICE_VARIANT_COOKIE)?.value;
  const userAgent = request.headers.get('user-agent') ?? '';
  const viewportWidthHeader =
    request.headers.get('sec-ch-viewport-width') ??
    request.headers.get('viewport-width');
  const viewportWidth = viewportWidthHeader ? Number.parseInt(viewportWidthHeader, 10) : NaN;
  const hasViewportWidth = Number.isFinite(viewportWidth);
  const viewportSaysMobile =
    hasViewportWidth && viewportWidth > 0 ? viewportWidth <= DEVICE_VARIANT_BREAKPOINT : null;
  const uaSaysMobile = MOBILE_USER_AGENT.test(userAgent);
  const normalizedCookieVariant = normalizeDeviceVariant(cookieVariant);
  const viewportVariant: DeviceVariant | null =
    viewportSaysMobile === null ? null : viewportSaysMobile ? 'mobile' : 'desktop';
  const inferredVariant: DeviceVariant =
    viewportVariant ?? (uaSaysMobile ? 'mobile' : 'desktop');
  const nextVariant = normalizedCookieVariant ?? inferredVariant;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(DEVICE_VARIANT_HEADER, nextVariant);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (normalizedCookieVariant !== nextVariant) {
    response.cookies.set({
      name: DEVICE_VARIANT_COOKIE,
      value: nextVariant,
      maxAge: DEVICE_VARIANT_COOKIE_MAX_AGE,
      path: '/',
    });
  }

  response.headers.set('Accept-CH', 'Viewport-Width');
  response.headers.set('Critical-CH', 'Viewport-Width');
  const varyHeader = response.headers.get('Vary');
  response.headers.set(
    'Vary',
    varyHeader ? `${varyHeader}, Sec-CH-Viewport-Width, Viewport-Width` : 'Sec-CH-Viewport-Width, Viewport-Width',
  );

  return response;
}

export const config = {
  matcher: ['/todo/:path*'],
};
