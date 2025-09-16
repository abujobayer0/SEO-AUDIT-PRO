import { BRAND } from "@/lib/brand";

export const metadata = {
  title: `Create account – ${BRAND.name}`,
  description: `Create your ${BRAND.name} account to start running audits in minutes.`,
  openGraph: {
    title: `Create account – ${BRAND.name}`,
    description: "Start auditing in minutes. No credit card required.",
    type: "website",
    images: [
      {
        url: BRAND.ogImage,
        width: 1200,
        height: 630,
        alt: `Create account – ${BRAND.name}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Create account – ${BRAND.name}`,
    description: "Start auditing in minutes. No credit card required.",
    images: [BRAND.ogImage],
    site: BRAND.social?.twitter,
  },
};

export default function RegisterLayout({ children }) {
  return <>{children}</>;
}
