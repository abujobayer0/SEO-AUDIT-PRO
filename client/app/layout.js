import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import ClickSpark from "../components/ClickSpark";
import { Analytics } from "@vercel/analytics/next";
import { BRAND } from "@/lib/brand";
const inter = Inter({ subsets: ["latin"] });
import LogRocket from "logrocket";
import { useEffect } from "react";
export const metadata = {
  title: `${BRAND.name} – ${BRAND.tagline}`,
  description: BRAND.tagline,
  metadataBase: new URL(BRAND.url),
  openGraph: {
    title: `${BRAND.name} – ${BRAND.tagline}`,
    description: BRAND.tagline,
    type: "website",
    images: [
      {
        url: BRAND.ogImage,
        width: 1200,
        height: 630,
        alt: `${BRAND.name} – ${BRAND.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} – ${BRAND.tagline}`,
    description: BRAND.tagline,
    images: [BRAND.ogImage],
    site: BRAND.social?.twitter,
  },
};

export default function RootLayout({ children }) {
  useEffect(() => {
    LogRocket.init("uibfxx/seo-inspect-pro");
  }, []);
  return (
    <html lang='en' className='dark'>
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <ClickSpark
          sparkColor='rgba(255, 255, 255, 0.8)'
          sparkSize={12}
          sparkRadius={20}
          sparkCount={10}
          duration={500}
          easing='ease-out'
          extraScale={1.2}
        >
          {children}
          <Analytics />
          <Toaster
            position='top-right'
            toastOptions={{
              style: {
                background: "rgba(0,0,0,0.8)",
                color: "#fff",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)",
              },
            }}
          />
        </ClickSpark>
      </body>
    </html>
  );
}
