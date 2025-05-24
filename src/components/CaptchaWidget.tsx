
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Script from 'next/script';
import { cn } from '@/lib/utils'; // Added this import

interface CaptchaWidgetProps {
  onTokenChange: (token: string | null) => void;
  siteKey?: string;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact' | 'invisible';
  className?: string; // For the outer container, allowing responsive scaling
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
    onHCaptchaApiLoad?: () => void; // Callback for script load
  }

  interface HCaptchaOptions {
    sitekey: string;
    theme?: 'light' | 'dark';
    size?: 'normal' | 'compact' | 'invisible';
    callback?: (token: string) => void;
    'expired-callback'?: () => void;
    'chalexpired-callback'?: () => void; // Note: specific for challenge expiration
    'error-callback'?: (error: string) => void;
    // Add other hCaptcha options if needed: tabindex, shortlang, etc.
  }
}

const CaptchaWidget: React.FC<CaptchaWidgetProps> = ({
  onTokenChange,
  siteKey,
  theme = 'light', // hCaptcha default is light
  size = 'normal',
  className,
}) => {
  const captchaContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isApiReady, setIsApiReady] = useState(false);

  const actualSiteKey = siteKey || process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  useEffect(() => {
    // Define the global callback function for hCaptcha script
    window.onHCaptchaApiLoad = () => {
      setIsApiReady(true);
    };
    // Load the script
    setIsScriptLoaded(true); // Trigger Script component loading

    return () => {
      // Clean up the global callback
      delete window.onHCaptchaApiLoad;
    };
  }, []);

  const renderCaptcha = useCallback(() => {
    if (!isApiReady || !window.hcaptcha || !captchaContainerRef.current || !actualSiteKey) {
      return;
    }

    if (widgetIdRef.current && window.hcaptcha.remove) {
      try {
        window.hcaptcha.remove(widgetIdRef.current);
      } catch (e) {
        // console.warn('hCaptcha: Failed to remove previous widget:', e);
      }
      widgetIdRef.current = null;
    }
    
    // Ensure container is empty (hCaptcha might not always clean up perfectly on its own)
    if(captchaContainerRef.current.innerHTML !== '') {
        // captchaContainerRef.current.innerHTML = ''; // Be cautious
    }

    try {
      const newWidgetId = window.hcaptcha.render(captchaContainerRef.current, {
        sitekey: actualSiteKey,
        theme: theme,
        size: size,
        callback: (token: string) => {
          onTokenChange(token);
        },
        'expired-callback': () => {
          // console.warn('hCaptcha: Token expired.');
          onTokenChange(null);
          if (widgetIdRef.current && window.hcaptcha?.reset) {
            window.hcaptcha.reset(widgetIdRef.current);
          }
        },
        'chalexpired-callback': () => { // hCaptcha specific
            // console.warn('hCaptcha: Challenge expired.');
            onTokenChange(null);
            if (widgetIdRef.current && window.hcaptcha?.reset) {
              window.hcaptcha.reset(widgetIdRef.current);
            }
        },
        'error-callback': (error: string) => {
          // console.error('hCaptcha: Error callback triggered.', error);
          onTokenChange(null);
        },
      });
      widgetIdRef.current = newWidgetId;
    } catch (e) {
      // console.error('hCaptcha: Error calling window.hcaptcha.render:', e);
      onTokenChange(null);
    }
  }, [isApiReady, actualSiteKey, theme, size, onTokenChange]);

  useEffect(() => {
    if (isApiReady) {
      renderCaptcha();
    }
    return () => {
      if (widgetIdRef.current && window.hcaptcha?.remove) {
        try {
          window.hcaptcha.remove(widgetIdRef.current);
        } catch (e) {
          // console.warn('hCaptcha: Failed to remove widget on cleanup:', e);
        }
        widgetIdRef.current = null;
      }
    };
  }, [isApiReady, renderCaptcha]);

  if (!actualSiteKey) {
    return (
      <div className={className} style={{ border: '1px dashed gray', padding: '10px', color: 'hsl(var(--destructive))', textAlign: 'center' }}>
        hCaptcha 站点密钥 (Site Key) 未配置。
      </div>
    );
  }

  return (
    <>
      {isScriptLoaded && ( // Only load script if component is mounted
        <Script
          id="hcaptcha-api-script"
          src="https://js.hcaptcha.com/1/api.js?render=explicit&onload=onHCaptchaApiLoad"
          strategy="afterInteractive" // or "lazyOnload"
          async
          defer
          onError={() => {
            // console.error('hCaptcha: Failed to load script.');
            onTokenChange(null); 
            setIsApiReady(false); // Mark API as not ready
          }}
        />
      )}
      {/* Container for scaling and centering */}
      <div className={cn("hcaptcha-widget-container", className)}>
        {/* Actual hCaptcha render target */}
        <div ref={captchaContainerRef} id={`hcaptcha-render-${React.useId()}`} />
      </div>
       {!isApiReady && isScriptLoaded && <p className="text-xs text-muted-foreground text-center py-2">正在加载验证码...</p>}
    </>
  );
};

export default CaptchaWidget;
