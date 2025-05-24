
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

interface TurnstileWidgetProps {
  onTokenChange: (token: string | null) => void;
  siteKey?: string; // Optional: primarily for testing or multiple sites
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

declare global {
  interface Window {
    turnstile: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          // Add other Turnstile options as needed
        }
      ) => string | undefined; // render returns widgetId or undefined
      reset: (widgetId?: string) => void;
      // Add other Turnstile functions as needed
    };
  }
}

const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onTokenChange,
  siteKey,
  theme = 'auto',
  className,
}) => {
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string | undefined>(undefined);
  const actualSiteKey = siteKey || process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!actualSiteKey) {
      console.error('Cloudflare Turnstile site key is not configured.');
      onTokenChange(null); // Communicate failure
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;
    const intervalTime = 500; // ms

    const tryRenderWidget = () => {
      if (window.turnstile && turnstileContainerRef.current) {
        const newWidgetId = window.turnstile.render(turnstileContainerRef.current, {
          sitekey: actualSiteKey,
          callback: (token: string) => {
            onTokenChange(token);
          },
          'error-callback': () => {
            console.error('Turnstile error callback triggered.');
            onTokenChange(null);
          },
          'expired-callback': () => {
            console.warn('Turnstile token expired. Resetting widget.');
            onTokenChange(null);
            if (widgetId) {
              window.turnstile.reset(widgetId);
            }
          },
          theme: theme,
        });
        setWidgetId(newWidgetId);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryRenderWidget, intervalTime);
      } else {
        console.error('Failed to render Turnstile widget after multiple attempts. Is the script loaded?');
        onTokenChange(null);
      }
    };

    if (typeof window !== 'undefined') {
      // If script is already loaded (e.g. by another instance), try rendering directly
      if (window.turnstile) {
        tryRenderWidget();
      } else {
        // Wait for script to load via next/script, then render
        // The Script component's onLoad will handle this, but we need a fallback.
        // This explicit call is more for cases where the script might load but onLoad isn't immediately fired or state changes.
        const scriptElement = document.querySelector('script[src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"]');
        if (scriptElement) {
          scriptElement.addEventListener('load', tryRenderWidget);
          return () => scriptElement.removeEventListener('load', tryRenderWidget);
        } else {
          // If script isn't even in DOM yet, next/script should handle it.
          // This branch is less likely if next/script is used correctly.
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualSiteKey, onTokenChange, theme]); // Removed widgetId from dependencies to avoid re-rendering loop if widgetId changes

  const handleScriptLoad = () => {
    if (window.turnstile && turnstileContainerRef.current && !widgetId && actualSiteKey) {
       const newWidgetId = window.turnstile.render(turnstileContainerRef.current, {
        sitekey: actualSiteKey,
        callback: (token: string) => onTokenChange(token),
        'error-callback': () => onTokenChange(null),
        'expired-callback': () => {
            onTokenChange(null);
            if (newWidgetId) window.turnstile.reset(newWidgetId);
        },
        theme: theme,
      });
      setWidgetId(newWidgetId);
    }
  };


  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        async
        defer
        onLoad={handleScriptLoad}
        onError={() => {
          console.error('Failed to load Cloudflare Turnstile script.');
          onTokenChange(null);
        }}
      />
      <div ref={turnstileContainerRef} className={className} data-testid="cf-turnstile-widget"></div>
    </>
  );
};

export default TurnstileWidget;
