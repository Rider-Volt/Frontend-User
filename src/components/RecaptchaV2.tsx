import { useEffect, useRef, useState } from "react";

type Props = {
  theme?: "light" | "dark";
  onVerify?: (token: string | null) => void;
};

const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

type Grecaptcha = {
  render: (
    container: HTMLElement,
    parameters: {
      sitekey: string;
      theme?: "light" | "dark";
      size?: "normal" | "compact" | "invisible";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    }
  ) => number;
  reset: (widgetId?: number) => void;
  ready: (cb: () => void) => void;
};

const SCRIPT_ID = "recaptcha-v2-script";
let recaptchaLoader: Promise<Grecaptcha> | null = null;

function loadRecaptchaV2(): Promise<Grecaptcha> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("reCAPTCHA requires a browser environment"));
  }

  const existing = (window as typeof window & { grecaptcha?: Grecaptcha }).grecaptcha;
  if (existing && typeof existing.render === "function") {
    return Promise.resolve(existing);
  }

  if (recaptchaLoader) {
    return recaptchaLoader;
  }

  recaptchaLoader = new Promise<Grecaptcha>((resolve, reject) => {
    let settled = false;
    const resolveOnce = (gc: Grecaptcha) => {
      if (settled) return;
      settled = true;
      resolve(gc);
    };
    const rejectOnce = (err: Error) => {
      if (settled) return;
      settled = true;
      reject(err);
    };

    const waitForGrecaptcha = () => {
      const start = Date.now();
      const poll = () => {
        const gc = (window as typeof window & { grecaptcha?: Grecaptcha }).grecaptcha;
        if (gc && typeof gc.render === "function") {
          resolveOnce(gc);
          return;
        }
        if (Date.now() - start > 10_000) {
          rejectOnce(new Error("Timed out loading reCAPTCHA"));
          return;
        }
        window.setTimeout(poll, 50);
      };
      poll();
    };

    const attachLoadListeners = (script: HTMLScriptElement) => {
      script.addEventListener(
        "load",
        () => {
          script.setAttribute("data-loaded", "true");
          waitForGrecaptcha();
        },
        { once: true }
      );
      script.addEventListener(
        "error",
        () => rejectOnce(new Error("Không thể tải reCAPTCHA")),
        { once: true }
      );
    };

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      if (existing) {
        resolveOnce(existing);
        return;
      }
      attachLoadListeners(existingScript);
      if (existingScript.dataset.loaded === "true") {
        waitForGrecaptcha();
      }
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
  script.src = "https://www.google.com/recaptcha/api.js?render=explicit&hl=vi";
    script.async = true;
    script.defer = true;
    attachLoadListeners(script);
    document.head.appendChild(script);
    if (script.dataset.loaded === "true") {
      waitForGrecaptcha();
    }
  }).catch((err) => {
    recaptchaLoader = null;
    throw err;
  });

  return recaptchaLoader;
}

export default function RecaptchaV2({ theme = "light", onVerify }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const onVerifyRef = useRef<Props["onVerify"]>();
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  onVerifyRef.current = onVerify;

  if (!siteKey) {
    if ((import.meta as any).env?.DEV) {
      return (
        <div className="text-xs text-red-600 text-center">
          Missing VITE_RECAPTCHA_SITE_KEY – reCAPTCHA is not configured.
        </div>
      );
    }
    return null;
  }

  useEffect(() => {
    let isMounted = true;
    setError(null);
    setIsReady(false);
    onVerifyRef.current?.(null);

    loadRecaptchaV2()
      .then((gc) => {
        if (!isMounted) return;

        const mount = () => {
          if (!isMounted || !containerRef.current) {
            return;
          }

          if (widgetIdRef.current !== null) {
            try {
              gc.reset(widgetIdRef.current);
            } catch (_err) {
              // ignore reset failures
            }
            containerRef.current.innerHTML = "";
            widgetIdRef.current = null;
          }

          widgetIdRef.current = gc.render(containerRef.current, {
            sitekey: siteKey,
            theme,
            size: "normal",
            callback: (token: string) => {
              if (!isMounted) return;
              onVerifyRef.current?.(token);
            },
            "expired-callback": () => {
              if (!isMounted) return;
              onVerifyRef.current?.(null);
            },
            "error-callback": () => {
              if (!isMounted) return;
              setError("reCAPTCHA gặp lỗi. Vui lòng thử lại.");
              onVerifyRef.current?.(null);
            },
          });
          setIsReady(true);
        };

        try {
          gc.ready(mount);
        } catch (_err) {
          mount();
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("reCAPTCHA load error:", err);
        setError("Không thể tải reCAPTCHA. Vui lòng thử lại sau.");
      });

    return () => {
      isMounted = false;
      const gc = (window as typeof window & { grecaptcha?: Grecaptcha }).grecaptcha;
      if (widgetIdRef.current !== null && gc?.reset) {
        try {
          gc.reset(widgetIdRef.current);
        } catch (_err) {
          // ignore reset failures
        }
      }
      widgetIdRef.current = null;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [theme]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={containerRef} />
      {!isReady && !error && (
        <span className="text-xs text-muted-foreground">Đang tải reCAPTCHA…</span>
      )}
      {error && <span className="text-xs text-red-600 text-center">{error}</span>}
    </div>
  );
}
