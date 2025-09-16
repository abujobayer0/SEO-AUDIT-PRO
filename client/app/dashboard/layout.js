import { BRAND } from "@/lib/brand";

export const metadata = {
  title: `Dashboard – ${BRAND.name}`,
  description: "Run audits, view reports, and manage your SEO intelligence.",
  openGraph: {
    title: `Dashboard – ${BRAND.name}`,
    description: "Run audits, view reports, and manage your SEO intelligence.",
    type: "website",
    images: [
      {
        url: BRAND.ogImage,
        width: 1200,
        height: 630,
        alt: `Dashboard – ${BRAND.name}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Dashboard – ${BRAND.name}`,
    description: "Run audits, view reports, and manage your SEO intelligence.",
    images: [BRAND.ogImage],
    site: BRAND.social?.twitter,
  },
};

export default function DashboardLayout({ children }) {
  return <>{children}</>;
}
