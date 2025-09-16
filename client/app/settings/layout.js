export const metadata = {
  title: "Settings – SEO Audit Pro",
  description: "Manage your account settings, branding, and subscription.",
  openGraph: {
    title: "Settings – SEO Audit Pro",
    description: "Manage your account settings, branding, and subscription.",
    type: "website",
    images: [
      {
        url: "https://og-playground.vercel.app/api/card?title=Settings&subtitle=Branding%20and%20preferences",
        width: 1200,
        height: 630,
        alt: "Settings – SEO Audit Pro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Settings – SEO Audit Pro",
    description: "Manage your account settings, branding, and subscription.",
    images: ["https://og-playground.vercel.app/api/card?title=Settings&subtitle=Branding%20and%20preferences"],
  },
};

export default function SettingsLayout({ children }) {
  return <>{children}</>;
}
