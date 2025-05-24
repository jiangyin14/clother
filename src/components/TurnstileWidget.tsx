'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Script from 'next/script';

interface TurnstileWidgetProps {
  onTokenChange: (token: string | null) => void;
  siteKey?: string;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: TurnstileOptions
      ) => string | undefined;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void; // widgetId is not optional for remove
    };
  }
  interface TurnstileOptions {
    sitekey: string;
    callback?: (token: string) => void;
    'error-callback'?: () => void;
    'expired-callback'?: () => void;
    theme?: 'light' | 'dark' | 'auto';
    action?: string;
    cData?: string;
    // Add other Turnstile options if needed
  }
}

const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onTokenChange,
  siteKey,
  theme = 'auto',
  className,
}) => {
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const actualSiteKey = siteKey || process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;

  const renderWidget = useCallback(() => {
    if (!isScriptLoaded || !window.turnstile || !turnstileContainerRef.current || !actualSiteKey) {
      return;
    }


    let attempts = 0;
    const maxAttempts = 10;
    const intervalTime = 500; // ms

    const tryRenderWidget = () => {
      if (window.turnstile && turnstileContainerRef.current) {
        // or if a widget was rendered by other means.
        if (turnstileContainerRef.current.innerHTML !== '') {
          turnstileContainerRef.current.innerHTML = ''; // Be cautious with this, might interfere
        }
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
      widgetIdRef.current = null;
    }
    
    // Explicitly clear the container in case Turnstile's remove doesn't immediately update DOM
    // or if a widget was rendered by other means.
    if (turnstileContainerRef.current.innerHTML !== '') {
        // turnstileContainerRef.current.innerHTML = ''; // Be cautious with this, might interfere
    }


    try {
      const newWidgetId = window.turnstile.render(turnstileContainerRef.current, {
        sitekey: actualSiteKey,
        callback: (token: string) => {
          onTokenChange(token);
        },
        'error-callback': () => {
          // console.error('Turnstile: Error callback triggered.');
          onTokenChange(null);
        },
        'expired-callback': () => {
          // console.warn('Turnstile: Token expired.');
          onTokenChange(null);
          // Turnstile widget should reset itself. If explicit reset is needed:
          if (widgetIdRef.current && window.turnstile) {
             window.turnstile.reset(widgetIdRef.current);
          }
        },
        theme: theme,
      });

      if (newWidgetId) {
        widgetIdRef.current = newWidgetId;
      } else {
        // console.warn('Turnstile: window.turnstile.render did not return a widget ID. Container might be hidden.');
      }
    } catch (e) {
        // console.error('Turnstile: Error calling window.turnstile.render:', e);
        onTokenChange(null);
    }
  }, [isScriptLoaded, actualSiteKey, theme, onTokenChange]);

  useEffect(() => {
    // This effect runs when script is loaded or key props change.
    if (isScriptLoaded) {
      renderWidget();
    }

    // Cleanup function: remove the widget when the component unmounts
    // or before the effect re-runs due to dependency changes.
    return () => {
      if (widgetIdRef.current && window.turnstile?.remove) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // console.warn('Turnstile: Failed to remove widget on cleanup:', e);
        }
        widgetIdRef.current = null;
      }
    };
  }, [isScriptLoaded, renderWidget]); // renderWidget is memoized

  if (!actualSiteKey) {
    return <div className={className} style={{ minHeight: '65px', border:'1px dashed gray', padding: '10px', display:'flex', alignItems:'center', justifyContent:'center', color: 'hsl(var(--destructive))' }}>Turnstile 站点密钥未配置。</div>;
  }

  return (
    <>
      <Script
        id="cf-turnstile-script" // Static ID for the script tag
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.turnstile) {
            setIsScriptLoaded(true);
          } else {
            // console.error("Turnstile script loaded but window.turnstile is not defined.");
            // This can happen in rare race conditions or if the script fails to initialize window.turnstile
          }
        }}
        onError={() => {
          // console.error('Turnstile: Failed to load script.');
          onTokenChange(null); 
        }}
      />
      <div ref={turnstileContainerRef} className={className} />
    </>
  );
};

export default TurnstileWidget;
