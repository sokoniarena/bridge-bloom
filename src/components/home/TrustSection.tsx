import { Shield, Users, MapPin, BadgeCheck, MessageCircle, Lock } from "lucide-react";

const trustFeatures = [
  {
    icon: BadgeCheck,
    title: "Verified Sellers",
    description: "Every seller goes through email verification to ensure authenticity",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Your data is protected with enterprise-grade security measures",
  },
  {
    icon: MapPin,
    title: "Local Community",
    description: "Connect with buyers and sellers in your neighborhood",
  },
  {
    icon: MessageCircle,
    title: "Direct Communication",
    description: "Chat directly with sellers to negotiate and ask questions",
  },
  {
    icon: Users,
    title: "Trusted Community",
    description: "Join thousands of satisfied users across Kenya",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "Your personal information is never shared without consent",
  },
];

export function TrustSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-brand-light text-primary text-sm font-medium mb-4">
            <Shield className="h-4 w-4" />
            Trust & Safety
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            A Marketplace You Can Trust
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We've built Sokoni Arena with safety and trust at its core. 
            Here's how we keep our community secure.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
