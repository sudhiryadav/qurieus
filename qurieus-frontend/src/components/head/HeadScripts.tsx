"use client";

import { THEME_STORAGE_KEY } from "@/lib/app-theme";

/**
 * React 19 does not allow `<script>` in client-rendered trees. These components
 * render scripts only during SSR (`window` is undefined) and return null on the
 * client, matching the next-themes pattern for blocking theme bootstrap.
 *
 * @see https://github.com/pacocoursey/next-themes/issues/385
 */

const THEME_BOOTSTRAP_JS = `(function(){try{var k='${THEME_STORAGE_KEY}';var s=localStorage.getItem(k);var m=s==='dark'||s==='light'?s:'light';var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(m);}catch(e){document.documentElement.classList.add('light');}})();`;

export function ThemeBootstrapScript() {
  if (typeof window !== "undefined") {
    return null;
  }

  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_JS }}
    />
  );
}

export function StructuredDataScript({ jsonLd }: { jsonLd: string }) {
  if (typeof window !== "undefined") {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}
