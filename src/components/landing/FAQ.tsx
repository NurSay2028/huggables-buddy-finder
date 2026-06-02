import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanding } from "@/lib/landing-content";

export function FAQ() {
  const c = useLanding();
  return (
    <section id="faq" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {c.faq.title}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">{c.faq.subtitle}</p>
        </div>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl shadow-card">
            <img
              src={c.faq.image}
              alt="Stomatologiya davolash jarayoni"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>

          <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
            {c.faq.items.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="mb-3 rounded-2xl border border-border bg-card px-5 shadow-sm"
              >
                <AccordionTrigger className="text-left text-sm font-semibold text-card-foreground hover:no-underline sm:text-base">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
