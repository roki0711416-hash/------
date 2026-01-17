"use client";

/* eslint-disable @next/next/no-img-element */

import Script from "next/script";

export default function GmoSiteSeal() {
  return (
    <div className="mt-4 flex justify-center">
      <span
        id="csi_siteseal_tag"
        onContextMenu={(e) => {
          e.preventDefault();
        }}
      >
        <a id="csi_siteseal_profile_link">
          <img
            alt="dark_typeA_130x66.png"
            id="csi_siteseal_image"
            width={130}
            height={66}
            style={{ display: "none" }}
          />
        </a>
      </span>

      <Script id="gmo-siteseal-loader" strategy="afterInteractive">
        {`window.addEventListener('load', () => {
  let s = document.createElement("script");
  s.src = "https://gmo-cybersecurity.com/siteseal/siteseal.js";
  document.body.appendChild(s);
});`}
      </Script>
    </div>
  );
}
