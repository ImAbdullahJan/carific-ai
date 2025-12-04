import {
  Header,
  Hero,
  Features,
  HowItWorks,
  Roadmap,
  Contribute,
  Footer,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Roadmap />
      <Contribute />
      <Footer />
    </div>
  );
}
