import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import ClickSpark from "../components/ClickSpark";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SEO Audit Tool - White Label Solution",
  description: "Professional SEO audit tool for agencies with white-label reporting",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "SEO Audit Tool - White Label Solution",
    description: "Professional SEO audit tool for agencies with white-label reporting",
    type: "website",
    images: [
      {
        url: "https://og-playground.vercel.app/api/card?title=SEO%20Audit%20Pro&subtitle=White‑Label%20SEO%20Reports",
        width: 1200,
        height: 630,
        alt: "SEO Audit Pro - White‑Label SEO Reports",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Audit Tool - White Label Solution",
    description: "Professional SEO audit tool for agencies with white-label reporting",
    images: [
      "https://og-playground.vercel.app/api/card?title=SEO%20Audit%20Pro&subtitle=White‑Label%20SEO%20Reports",
    ],
  },
};

export default function RootLayout({ children }) {
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
