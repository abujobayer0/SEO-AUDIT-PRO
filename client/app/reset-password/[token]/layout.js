import { BRAND } from "@/lib/brand";

export const metadata = {
  title: `Reset password – ${BRAND.name}`,
  description: `Set a new password for your ${BRAND.name} account.`,
  openGraph: {
    title: `Reset password – ${BRAND.name}`,
    description: "Set a new password for your account.",
    type: "website",
    images: [
      {
        url: BRAND.ogImage,
        width: 1200,
        height: 630,
        alt: `Reset password – ${BRAND.name}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Reset password – ${BRAND.name}`,
    description: "Set a new password for your account.",
    images: [BRAND.ogImage],
    site: BRAND.social?.twitter,
  },
};

export default function ResetPasswordLayout({ children }) {
  return <>{children}</>;
}
