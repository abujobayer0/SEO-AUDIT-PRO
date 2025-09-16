import { BRAND } from "@/lib/brand";

export const metadata = {
  title: `Sign in – ${BRAND.name}`,
  description: "Sign in to access your SEO audits, reports, and branding settings.",
  openGraph: {
    title: `Sign in – ${BRAND.name}`,
    description: "Access your SEO audits, reports, and branding settings.",
    type: "website",
    images: [
      {
        url: BRAND.ogImage,
        width: 1200,
        height: 630,
        alt: `Sign in – ${BRAND.name}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Sign in – ${BRAND.name}`,
    description: "Access your SEO audits, reports, and branding settings.",
    images: [BRAND.ogImage],
    site: BRAND.social?.twitter,
  },
};

export default function LoginLayout({ children }) {
  return <>{children}</>;
}
