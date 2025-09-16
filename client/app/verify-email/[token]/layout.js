import { BRAND } from "@/lib/brand";

export const metadata = {
  title: `Verify email – ${BRAND.name}`,
  description: `Confirm your email to activate your ${BRAND.name} account.`,
  openGraph: {
    title: `Verify email – ${BRAND.name}`,
    description: "Confirm your email to activate your account.",
    type: "website",
    images: [
      {
        url: BRAND.ogImage,
        width: 1200,
        height: 630,
        alt: `Verify email – ${BRAND.name}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Verify email – ${BRAND.name}`,
    description: "Confirm your email to activate your account.",
    images: [BRAND.ogImage],
    site: BRAND.social?.twitter,
  },
};

export default function VerifyEmailLayout({ children }) {
  return <>{children}</>;
}
