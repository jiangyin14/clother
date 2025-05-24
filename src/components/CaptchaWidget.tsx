
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Script from 'next/script';
import { cn } from '@/lib/utils';

interface CaptchaWidgetProps {
  onTokenChange: (token: string | null) => void;
  siteKey?: string;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact' | 'invisible';
  className?: string;
  resetTrigger?: number;
}

declare global {
  interface Window {
    hcaptcha?: {
      render: (
        container: string | HTMLElement,
        options: HCaptchaOptions
      ) => string; // Returns widgetID
      reset: (widgetID?: string) => void;
      getResponse: (widgetID?: string) => string; // Returns the token
      execute: (widgetID?: string) => void;
      remove: (widgetID: string) => void;
    };
    onHCaptchaApiLoad?: () => void;
  }

  interface HCaptchaOptions {
    sitekey: string;
    theme?: 'light' | 'dark';
    size?: 'normal' | 'compact' | 'invisible';
    callback?: (token: string) => void;
    'expired-callback'?: () => void;
    'chalexpired-callback'?: () => void;
    'error-callback'?: (error: string) => void;
  }
}

const CaptchaWidget: React.FC<CaptchaWidgetProps> = ({
  onTokenChange,
  siteKey,
  theme = 'light',
  size = 'normal',
  className,
  resetTrigger,
}) => {
  const captchaContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const isMountedRef = useRef(false); // To track if component is mounted

  const actualSiteKey = siteKey || process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  useEffect(() => {
    isMountedRef.current = true;
    window.onHCaptchaApiLoad = () => {
      if (isMountedRef.current) {
        setIsApiReady(true);
      }
    };
    return () => {
      isMountedRef.current = false;
      delete window.onHCaptchaApiLoad;
      // Ensure to remove widget if component unmounts while API is loading
      if (widgetIdRef.current && window.hcaptcha?.remove) {
        try {
          window.hcaptcha.remove(widgetIdRef.current);
        } catch (e) {
          // console.warn('hCaptcha: Failed to remove widget on unmount (during API load phase):', e);
        }
        widgetIdRef.current = null;
      }
    };
  }, []);

  const renderNewCaptchaInstance = useCallback(() => {
    if (!isApiReady || !captchaContainerRef.current || !window.hcaptcha || !actualSiteKey) {
      return;
    }

    // Always remove previous instance if it exists, managed by this component
    if (widgetIdRef.current) {
      try {
        window.hcaptcha.remove(widgetIdRef.current);
      } catch (e) {
        // console.warn(`CaptchaWidget: Failed to remove old widget ${widgetIdRef.current} before rendering new one.`, e);
      }
      widgetIdRef.current = null;
    }

    // Ensure the container is empty for hCaptcha to render into
    if (captchaContainerRef.current) {
        captchaContainerRef.current.innerHTML = '';
    }


    try {
      const newWidgetId = window.hcaptcha.render(captchaContainerRef.current, {
        sitekey: actualSiteKey,
        theme: theme,
        size: size,
        callback: (token: string) => {
          if (isMountedRef.current) onTokenChange(token);
        },
        'expired-callback': () => {
          if (isMountedRef.current) {
            onTokenChange(null);
            // Optionally try to reset the widget here if auto-reset is desired on expiry
            // if (widgetIdRef.current && window.hcaptcha?.reset) window.hcaptcha.reset(widgetIdRef.current);
          }
        },
        'chalexpired-callback': () => {
           if (isMountedRef.current) {
            onTokenChange(null);
            // if (widgetIdRef.current && window.hcaptcha?.reset) window.hcaptcha.reset(widgetIdRef.current);
          }
        },
        'error-callback': (err: string) => {
          // console.error('hCaptcha error:', err);
          if (isMountedRef.current) onTokenChange(null);
        },
      });
      widgetIdRef.current = newWidgetId;
    } catch (e) {
      // console.error('Error rendering hCaptcha:', e);
      if (isMountedRef.current) onTokenChange(null);
    }
  }, [isApiReady, actualSiteKey, theme, size, onTokenChange]);

  // Effect for initial render and prop changes that require full re-render
  useEffect(() => {
    if (isApiReady) {
      renderNewCaptchaInstance();
    }
  }, [isApiReady, actualSiteKey, theme, size, renderNewCaptchaInstance]);


  // Effect to handle external reset trigger
  useEffect(() => {
    if (resetTrigger === undefined || resetTrigger === 0) { // Ignore initial trigger value
      return;
    }

    if (isApiReady && window.hcaptcha) {
      if (widgetIdRef.current) {
        try {
          // console.log(`CaptchaWidget: Resetting widget ${widgetIdRef.current} due to resetTrigger.`);
          window.hcaptcha.reset(widgetIdRef.current);
          if (isMountedRef.current) {
            onTokenChange(null); // After reset, the old token is invalid.
          }
        } catch (e) {
          // console.warn(`CaptchaWidget: hcaptcha.reset failed for widget ${widgetIdRef.current}. Falling back to full re-render.`, e);
          renderNewCaptchaInstance(); // Fallback if reset fails
        }
      } else {
        // If no widget exists, but a reset is triggered, render a new one.
        // console.log("CaptchaWidget: resetTrigger fired but no widgetId. Rendering new instance.");
        renderNewCaptchaInstance();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTrigger, isApiReady]); // `renderNewCaptchaInstance` is not needed here as this effect handles reset/re-render explicitly.

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.hcaptcha?.remove) {
        try {
          window.hcaptcha.remove(widgetIdRef.current);
        } catch (e) {
          // console.warn(`CaptchaWidget: Failed to remove widget ${widgetIdRef.current} on unmount:`, e);
        }
        widgetIdRef.current = null;
      }
    };
  }, []);


  if (!actualSiteKey) {
    return (
      <div className={className} style={{ border: '1px dashed gray', padding: '10px', color: 'hsl(var(--destructive))', textAlign: 'center' }}>
        hCaptcha 站点密钥 (Site Key) 未配置。
      </div>
    );
  }

  return (
    <>
      <Script
        id="hcaptcha-api-script"
        src="https://js.hcaptcha.com/1/api.js?render=explicit&onload=onHCaptchaApiLoad"
        strategy="afterInteractive"
        async
        defer
        onError={() => {
          // console.error('hCaptcha: Failed to load script.');
          if (isMountedRef.current) {
            onTokenChange(null);
            setIsApiReady(false);
          }
        }}
      />
      <div className={cn("hcaptcha-widget-container", className)}>
        <div ref={captchaContainerRef} id={`hcaptcha-render-${React.useId()}`} />
      </div>
      {!isApiReady && <p className="text-xs text-muted-foreground text-center py-2">正在加载验证码...</p>}
    </>
  );
};

export default CaptchaWidget;
