'use client';

import { useEffect } from 'react';

interface CustomCodeProps {
  customCss?: string | null;
  customJs?: string | null;
}

export function CustomCode({ customCss, customJs }: CustomCodeProps) {
  useEffect(() => {
    // Handle custom CSS
    if (customCss) {
      const styleId = 'custom-business-css';
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;
      
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }

      // Check if the CSS includes <style> tags
      if (customCss.includes('<style>')) {
        // Extract content between <style> tags
        const match = customCss.match(/<style>([\s\S]*?)<\/style>/i);
        if (match && match[1]) {
          styleElement.textContent = match[1];
        }
      } else {
        // Use CSS as is
        styleElement.textContent = customCss;
      }
    }

    // Handle custom JavaScript
    if (customJs) {
      const scriptId = 'custom-business-js';
      let scriptElement = document.getElementById(scriptId) as HTMLScriptElement;
      
      // Remove existing script if present
      if (scriptElement) {
        scriptElement.remove();
      }

      scriptElement = document.createElement('script');
      scriptElement.id = scriptId;
      scriptElement.type = 'text/javascript';
      
      // Check if the JS includes <script> tags
      if (customJs.includes('<script>')) {
        // Extract content between <script> tags
        const match = customJs.match(/<script>([\s\S]*?)<\/script>/i);
        if (match && match[1]) {
          scriptElement.textContent = match[1];
        }
      } else {
        // Use JS as is
        scriptElement.textContent = customJs;
      }
      
      document.head.appendChild(scriptElement);
    }

    // Cleanup function
    return () => {
      // We don't remove the elements on unmount to avoid flickering
      // They will be updated on the next render if needed
    };
  }, [customCss, customJs]);

  return null; // This component doesn't render anything
}

