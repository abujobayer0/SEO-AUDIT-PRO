import { BRAND } from "@/lib/brand";

export const metadata = {
  title: `Community – ${BRAND.name}`,
  description: "Share ideas, report issues, and collaborate with other makers.",
  openGraph: {
    title: `Community – ${BRAND.name}`,
    description: "Share ideas, report issues, and collaborate with other makers.",
    type: "website",
    images: [
      {
        url: BRAND.ogImage,
        width: 1200,
        height: 630,
        alt: `Community – ${BRAND.name}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Community – ${BRAND.name}`,
    description: "Share ideas, report issues, and collaborate with other makers.",
    images: [BRAND.ogImage],
    site: BRAND.social?.twitter,
  },
};

export default function CommunityLayout({ children }) {
  return <>{children}</>;
}
