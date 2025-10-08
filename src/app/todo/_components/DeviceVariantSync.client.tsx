"use client";

import { useEffect, useRef } from 'react';

import {
  DEVICE_VARIANT_BREAKPOINT,
  DEVICE_VARIANT_COOKIE,
  DEVICE_VARIANT_COOKIE_MAX_AGE,
  type DeviceVariant,
} from '../device-constants';

const RESIZE_DEBOUNCE_MS = 150;

function persistVariant(variant: DeviceVariant) {
  document.cookie = `${DEVICE_VARIANT_COOKIE}=${variant}; path=/; max-age=${DEVICE_VARIANT_COOKIE_MAX_AGE}`;
}

function detectVariant(): DeviceVariant {
  if (typeof window === 'undefined') return 'desktop';
  return window.innerWidth <= DEVICE_VARIANT_BREAKPOINT ? 'mobile' : 'desktop';
}

export default function DeviceVariantSync({
  initialVariant,
}: {
  initialVariant: DeviceVariant;
}) {
  const lastVariantRef = useRef<DeviceVariant>(initialVariant);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    const syncVariant = (forceReload: boolean) => {
      const detected = detectVariant();
      const changed = detected !== lastVariantRef.current;
      persistVariant(detected);
      lastVariantRef.current = detected;

      if (forceReload && changed) {
        window.location.replace(window.location.href);
      }
    };

    syncVariant(true);

    const handleResize = () => {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
      resizeTimer = setTimeout(() => {
        syncVariant(true);
      }, RESIZE_DEBOUNCE_MS);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
    };
  }, []);

  return null;
}
