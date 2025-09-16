export const metadata = {
  title: "Sign in – SEO Audit Pro",
  description: "Sign in to access your SEO audits, reports, and branding settings.",
  openGraph: {
    title: "Sign in – SEO Audit Pro",
    description: "Access your SEO audits, reports, and branding settings.",
    type: "website",
    images: [
      {
        url: "https://og-playground.vercel.app/api/card?title=Sign%20in&subtitle=Access%20SEO%20Audit%20Pro",
        width: 1200,
        height: 630,
        alt: "Sign in – SEO Audit Pro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign in – SEO Audit Pro",
    description: "Access your SEO audits, reports, and branding settings.",
    images: ["https://og-playground.vercel.app/api/card?title=Sign%20in&subtitle=Access%20SEO%20Audit%20Pro"],
  },
};

export default function LoginLayout({ children }) {
  return <>{children}</>;
}
