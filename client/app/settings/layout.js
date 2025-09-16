import { BRAND } from "@/lib/brand";

export const metadata = {
  title: `Settings – ${BRAND.name}`,
  description: "Manage your account settings, branding, and subscription.",
  openGraph: {
    title: `Settings – ${BRAND.name}`,
    description: "Manage your account settings, branding, and subscription.",
    type: "website",
    images: [
      {
        url: BRAND.ogImage,
        width: 1200,
        height: 630,
        alt: `Settings – ${BRAND.name}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Settings – ${BRAND.name}`,
    description: "Manage your account settings, branding, and subscription.",
    images: [BRAND.ogImage],
    site: BRAND.social?.twitter,
  },
};

export default function SettingsLayout({ children }) {
  return <>{children}</>;
}
