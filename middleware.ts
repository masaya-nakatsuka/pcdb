import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { DEVICE_VARIANT_HEADER } from './src/app/todo/device-constants';

const MOBILE_USER_AGENT =
  /Android.+Mobile|iPhone|iPad|iPod|Mobile|Windows Phone|webOS|BlackBerry/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/todo')) {
    return NextResponse.next();
  }

  if (request.headers.get(DEVICE_VARIANT_HEADER)) {
    return NextResponse.next();
  }

  const userAgent = request.headers.get('user-agent') ?? '';
  const isMobile = MOBILE_USER_AGENT.test(userAgent);

  const restPath = pathname.slice('/todo'.length);
  const url = request.nextUrl.clone();
  url.pathname = `/todo${restPath}`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(DEVICE_VARIANT_HEADER, isMobile ? 'mobile' : 'desktop');

  return NextResponse.rewrite(url, {
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/todo/:path*'],
};
