import { LandingNav } from '@/components/landing/landing-nav';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { PlansSection } from '@/components/landing/plans-section';
import { AboutSection } from '@/components/landing/about-section';
import { FaqSection } from '@/components/landing/faq-section';
import { ContactSection } from '@/components/landing/contact-section';
import { CtaSection } from '@/components/landing/cta-section';
import { FooterSection } from '@/components/landing/footer-section';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <PlansSection />
        <AboutSection />
        <FaqSection />
        <ContactSection />
        <CtaSection />
      </main>
      <FooterSection />
    </div>
  );
}
