// src/lib/recaptcha.ts
// Lightweight loader for Google reCAPTCHA v3. Requires VITE_RECAPTCHA_SITE_KEY in env.

let grecaptchaPromise: Promise<typeof grecaptcha> | null = null;

function injectScript(siteKey: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById("recaptcha-script")) return resolve();
    const script = document.createElement("script");
    script.id = "recaptcha-script";
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load reCAPTCHA"));
    document.head.appendChild(script);
  });
}

export async function getRecaptcha() {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
  if (!siteKey) throw new Error("Missing VITE_RECAPTCHA_SITE_KEY");
  if (!grecaptchaPromise) {
    grecaptchaPromise = (async () => {
      await injectScript(siteKey);
      // Wait for grecaptcha to be available
      await new Promise<void>((resolve) => {
        const check = () => {
          if ((window as any).grecaptcha?.ready) return resolve();
          setTimeout(check, 50);
        };
        check();
      });
      return (window as any).grecaptcha as typeof grecaptcha;
    })();
  }
  return grecaptchaPromise;
}

export async function recaptchaExecute(action: string): Promise<string> {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
  if (!siteKey) throw new Error("Missing VITE_RECAPTCHA_SITE_KEY");
  const gc = await getRecaptcha();
  return new Promise<string>((resolve, reject) => {
    try {
      gc.ready(() => {
        gc.execute(siteKey, { action })
          .then((token: string) => resolve(token))
          .catch(reject);
      });
    } catch (e) {
      reject(e);
    }
  });
}

declare global {
  // minimal grecaptcha types
  const grecaptcha: {
    ready(cb: () => void): void;
    execute(siteKey: string, opts: { action: string }): Promise<string>;
  };
}
