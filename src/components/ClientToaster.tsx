
'use client';

import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/toaster';

/**
 * A client-side only component to render the Toaster.
 * This prevents hydration errors by ensuring the Toaster is only mounted
 * on the client after the initial render.
 */
export default function ClientToaster() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <Toaster />;
}
