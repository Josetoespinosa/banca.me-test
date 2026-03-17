import Script from "next/script";

const trackingEnabled = process.env.NEXT_PUBLIC_ENABLE_TRACKING === "true";
const framerEventsFid = process.env.NEXT_PUBLIC_FRAMER_EVENTS_FID;
const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
const tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

const tiktokPixelScript = tiktokPixelId
  ? `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods="page track identify instances debug on off once ready alias group enableCookie disableCookie holdConsent revokeConsent grantConsent".split(" ");ttq.setAndDefer=function(o,n){o[n]=function(){o.push([n].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(o){var n=ttq._i[o]||[];for(var e=0;e<ttq.methods.length;e++)ttq.setAndDefer(n,ttq.methods[e]);return n};ttq.load=function(o,n){var e="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[o]=[];ttq._i[o]._u=e;ttq._o=ttq._o||{};ttq._o[o]=n||{};var r=document.createElement("script");r.type="text/javascript";r.async=!0;r.src=e+"?sdkid="+o+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(r,a)};ttq.load("${tiktokPixelId}");ttq.page()}(window,document,"ttq");`
  : "";

export function TrackingScripts() {
  if (!trackingEnabled) {
    return null;
  }

  return (
    <>
      {framerEventsFid ? (
        <Script
          src="https://events.framer.com/script?v=2"
          strategy="afterInteractive"
          data-fid={framerEventsFid}
          data-no-nt=""
        />
      ) : null}
      {tiktokPixelId ? (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {tiktokPixelScript}
        </Script>
      ) : null}
      {gtmId ? (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
      ) : null}
    </>
  );
}
