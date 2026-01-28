import { Layout } from "@/components/layout/Layout";

export default function Terms() {
  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">
            Terms & Conditions
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground text-lg mb-8">
              Last updated: {new Date().toLocaleDateString('en-KE', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-4">
                By accessing and using Sokoni Arena ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">2. User Registration</h2>
              <p className="text-muted-foreground mb-4">
                To post listings on Sokoni Arena, you must:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Be at least 18 years of age</li>
                <li>Provide accurate and complete registration information</li>
                <li>Verify your email address</li>
                <li>Maintain the security of your account credentials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">3. Listing Guidelines</h2>
              <p className="text-muted-foreground mb-4">
                When creating listings, you agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide accurate descriptions and images of products/services</li>
                <li>Set fair and honest prices</li>
                <li>Not list prohibited or illegal items</li>
                <li>Respond to inquiries in a timely manner</li>
                <li>Fulfill transactions as agreed with buyers</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">4. Prohibited Items</h2>
              <p className="text-muted-foreground mb-4">
                The following items and services are prohibited on Sokoni Arena:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Illegal substances and drugs</li>
                <li>Weapons and explosives</li>
                <li>Counterfeit or stolen goods</li>
                <li>Adult content or services</li>
                <li>Endangered species or products</li>
                <li>Fraudulent schemes or scams</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">5. Transactions</h2>
              <p className="text-muted-foreground mb-4">
                Sokoni Arena is a marketplace platform that connects buyers and sellers. We do not:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Guarantee the quality or legality of listed items</li>
                <li>Process payments between users directly</li>
                <li>Handle shipping or delivery of goods</li>
                <li>Provide warranties for transactions</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                All transactions are conducted directly between buyers and sellers at their own risk.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">6. Content Moderation</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Remove any listing that violates our guidelines</li>
                <li>Suspend or terminate accounts for policy violations</li>
                <li>Investigate suspicious activities</li>
                <li>Cooperate with law enforcement when required</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                Sokoni Arena is provided "as is" without warranties of any kind. We are not liable for:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Disputes between buyers and sellers</li>
                <li>Loss or damage resulting from transactions</li>
                <li>Accuracy of listing information</li>
                <li>Service interruptions or technical issues</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">8. Changes to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We may update these terms from time to time. Continued use of the Platform after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">9. Governing Law</h2>
              <p className="text-muted-foreground mb-4">
                These terms are governed by the laws of the Republic of Kenya. Any disputes shall be subject to the exclusive jurisdiction of Kenyan courts.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">10. Contact</h2>
              <p className="text-muted-foreground mb-4">
                For questions about these Terms & Conditions, contact us at:
              </p>
              <p className="text-muted-foreground">
                Email: legal@sokoniarena.co.ke<br />
                Address: Nairobi, Kenya
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
