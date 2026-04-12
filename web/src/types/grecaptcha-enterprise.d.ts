export {};

declare global {
  interface Window {
    grecaptcha?: {
      enterprise?: {
        ready: (cb: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
        render: (
          container: HTMLElement,
          parameters: {
            sitekey: string;
            action?: string;
            theme?: "light" | "dark";
            size?: "compact" | "normal";
            callback?: (token: string) => void;
            "error-callback"?: () => void;
            "expired-callback"?: () => void;
          },
        ) => number;
        getResponse: (widgetId?: number) => string;
        reset: (widgetId?: number) => void;
      };
    };
  }
}
