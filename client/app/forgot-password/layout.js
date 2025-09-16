export const metadata = {
  title: "Forgot password – SEO Audit Pro",
  description: "Receive password reset instructions for your SEO Audit Pro account.",
  openGraph: {
    title: "Forgot password – SEO Audit Pro",
    description: "Receive password reset instructions for your account.",
    type: "website",
    images: [
      {
        url: "https://og-playground.vercel.app/api/card?title=Forgot%20password&subtitle=Reset%20your%20access",
        width: 1200,
        height: 630,
        alt: "Forgot password – SEO Audit Pro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Forgot password – SEO Audit Pro",
    description: "Receive password reset instructions for your account.",
    images: ["https://og-playground.vercel.app/api/card?title=Forgot%20password&subtitle=Reset%20your%20access"],
  },
};

export default function ForgotPasswordLayout({ children }) {
  return <>{children}</>;
}
