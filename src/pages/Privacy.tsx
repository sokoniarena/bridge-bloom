import { Layout } from "@/components/layout/Layout";

export default function Privacy() {
  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground text-lg mb-8">
              Last updated: {new Date().toLocaleDateString('en-KE', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-4">
                Sokoni Arena ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our marketplace platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">2. Information We Collect</h2>
              <h3 className="font-semibold text-lg mb-2">Personal Information</h3>
              <p className="text-muted-foreground mb-4">
                When you register for an account, we collect:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Email address</li>
                <li>Phone number</li>
                <li>Username</li>
                <li>Location information (when you provide it)</li>
              </ul>
              
              <h3 className="font-semibold text-lg mb-2">Usage Information</h3>
              <p className="text-muted-foreground mb-4">
                We automatically collect:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Pages visited and features used</li>
                <li>Search queries and listing interactions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use your information to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Create and manage your account</li>
                <li>Enable you to post and manage listings</li>
                <li>Facilitate communication between buyers and sellers</li>
                <li>Improve our platform and user experience</li>
                <li>Send important updates and notifications</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">4. Information Sharing</h2>
              <p className="text-muted-foreground mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Other Users:</strong> Your public profile and listing information is visible to other users</li>
                <li><strong>Service Providers:</strong> Third parties who help us operate the platform</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">5. Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement industry-standard security measures to protect your information, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication mechanisms</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and employee training</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of marketing communications</li>
                <li>Export your data in a portable format</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">7. Cookies and Tracking</h2>
              <p className="text-muted-foreground mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Remember your preferences and login status</li>
                <li>Analyze platform usage and performance</li>
                <li>Personalize your experience</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                You can control cookies through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">8. Data Retention</h2>
              <p className="text-muted-foreground mb-4">
                We retain your information for as long as your account is active or as needed to provide services. We may retain certain information for legal, security, or fraud prevention purposes even after account deletion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground mb-4">
                Sokoni Arena is not intended for users under 18 years of age. We do not knowingly collect information from children.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">10. Changes to This Policy</h2>
              <p className="text-muted-foreground mb-4">
                We may update this Privacy Policy periodically. We will notify you of significant changes through the platform or via email.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">11. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                For privacy-related questions or to exercise your rights, contact us at:
              </p>
              <p className="text-muted-foreground">
                Email: privacy@sokoniarena.co.ke<br />
                Address: Nairobi, Kenya
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
