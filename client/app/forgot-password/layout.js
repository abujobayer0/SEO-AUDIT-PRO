import { BRAND } from "@/lib/brand";

export const metadata = {
  title: `Forgot password – ${BRAND.name}`,
  description: `Receive password reset instructions for your ${BRAND.name} account.`,
  openGraph: {
    title: `Forgot password – ${BRAND.name}`,
    description: "Receive password reset instructions for your account.",
    type: "website",
    images: [
      {
        url: BRAND.ogImage,
        width: 1200,
        height: 630,
        alt: `Forgot password – ${BRAND.name}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Forgot password – ${BRAND.name}`,
    description: "Receive password reset instructions for your account.",
    images: [BRAND.ogImage],
    site: BRAND.social?.twitter,
  },
};

export default function ForgotPasswordLayout({ children }) {
  return <>{children}</>;
}
