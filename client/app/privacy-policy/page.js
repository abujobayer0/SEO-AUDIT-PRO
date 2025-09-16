import Link from "next/link";
import { BRAND } from "@/lib/brand";

export const metadata = {
  title: `${BRAND.name} – Privacy Policy`,
  description: `Privacy Policy for ${BRAND.name}`,
};

export default function PrivacyPolicyPage() {
  return (
    <div className='min-h-screen bg-black text-white'>
      <div className='max-w-3xl mx-auto px-6 py-12'>
        <h1 className='text-3xl font-bold mb-4'>Privacy Policy</h1>
        <p className='text-white/80 mb-10'>Last updated: {new Date().toLocaleDateString()}</p>

        <div className='space-y-8 text-white/90'>
          <section>
            <h2 className='text-xl font-semibold mb-2'>Introduction</h2>
            <p>
              This Privacy Policy explains how {BRAND.name} ("we", "us", or "our") collects, uses, and safeguards your information when you
              use our website and services.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-semibold mb-2'>Information We Collect</h2>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Account information such as name, email, and password.</li>
              <li>Usage data including pages visited and interactions.</li>
              <li>Content you provide, like site URLs for audits and settings.</li>
            </ul>
          </section>

          <section>
            <h2 className='text-xl font-semibold mb-2'>How We Use Information</h2>
            <ul className='list-disc pl-6 space-y-2'>
              <li>To provide, maintain, and improve our services.</li>
              <li>To personalize your experience and save preferences.</li>
              <li>To communicate updates, security alerts, and support.</li>
            </ul>
          </section>

          <section>
            <h2 className='text-xl font-semibold mb-2'>Data Security</h2>
            <p>
              We implement reasonable administrative, technical, and physical safeguards to protect your information. However, no method of
              transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-semibold mb-2'>Your Choices</h2>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Access, update, or delete your account information.</li>
              <li>Unsubscribe from non-essential communications at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className='text-xl font-semibold mb-2'>Contact Us</h2>
            <p>
              If you have questions about this policy, email us at{" "}
              <a href='mailto:zubayer.munna.dev@gmail.com' className='underline underline-offset-4 hover:text-white'>
                zubayer.munna.dev@gmail.com
              </a>{" "}
              or visit {BRAND.url}.
            </p>
          </section>
        </div>

        <div className='mt-10'>
          <Link href='/' className='text-white hover:text-white/80 underline underline-offset-4'>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
