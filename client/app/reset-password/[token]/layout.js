export const metadata = {
  title: "Reset password – SEO Audit Pro",
  description: "Set a new password for your SEO Audit Pro account.",
  openGraph: {
    title: "Reset password – SEO Audit Pro",
    description: "Set a new password for your account.",
    type: "website",
    images: [
      {
        url: "https://og-playground.vercel.app/api/card?title=Reset%20password&subtitle=Secure%20your%20account",
        width: 1200,
        height: 630,
        alt: "Reset password – SEO Audit Pro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reset password – SEO Audit Pro",
    description: "Set a new password for your account.",
    images: ["https://og-playground.vercel.app/api/card?title=Reset%20password&subtitle=Secure%20your%20account"],
  },
};

export default function ResetPasswordLayout({ children }) {
  return <>{children}</>;
}
