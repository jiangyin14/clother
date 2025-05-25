
'use client';

import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';

export default function ClientSideToaster() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <Toaster />;
}
