import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Services } from "@/components/landing/Services";
import { About } from "@/components/landing/About";
import { Doctor } from "@/components/landing/Doctor";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { EmergencyCTA } from "@/components/landing/EmergencyCTA";
import { Footer } from "@/components/landing/Footer";
import { BookingDialog } from "@/components/landing/BookingDialog";
import { LandingContentProvider } from "@/lib/landing-content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Djoni Dentist — Nukusdagi stomatologiya | 24/7" },
      {
        name: "description",
        content:
          "Djoni Dentist — Nukus shahridagi zamonaviy stomatologiya. Tish davolash, breket, protezlash va oqartirish. 24/7 yordam. Tel: 91 380 86 67",
      },
      { property: "og:title", content: "Djoni Dentist — Nukusdagi stomatologiya" },
      {
        property: "og:description",
        content:
          "Ishonchli stomatologiya: davolash, breket, protezlash. Nukus, Aeroport hududi. 24/7 yordam.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <LandingContentProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <Services />
          <About />
          <Doctor />
          <Testimonials />
          <FAQ />
          <EmergencyCTA />
        </main>
        <Footer />
        <BookingDialog />
      </div>
    </LandingContentProvider>
  );
}
