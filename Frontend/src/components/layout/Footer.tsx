import { Link } from "react-router-dom";
import { Zap, Github, Twitter, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Footer = () => {
  const { t } = useTranslation();
  const navigationLinks = [
    { to: "/", label: t('nav.home') },
    { to: "/docs", label: t('nav.docs') },
    { to: "/playground", label: t('nav.playground') },
    { to: "/status", label: t('nav.status') },
  ];

  const resourceLinks = [
    { to: "/examples", label: t('nav.examples') },
    { to: "/pricing", label: t('nav.pricing') },
    { href: "https://github.com", label: t('footer.github') },
  ];

  const socialLinks = [
    {
      icon: Github,
      href: "https://github.com",
      label: t('footer.github'),
    },
    {
      icon: Twitter,
      href: "https://twitter.com",
      label: t('footer.twitter', { defaultValue: 'Twitter' }),
    },
    {
      icon: Mail,
      href: `mailto:${t('footer.contactEmail')}`,
      label: t('footer.contactEmail'),
    },
  ];
  
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto safe-px py-10 sm:py-12 space-y-8 sm:space-y-10">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5 sm:gap-2 font-bold text-xl sm:text-2xl">
            <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
            <span>{t('footer.brand')}</span>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            {t('home.hero.subtitle')}
          </p>
        </div>

        <div className="md:hidden">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="nav" className="border-b border-border">
              <AccordionTrigger className="text-base font-semibold py-3 hover:no-underline">
                {t('footer.navigation')}
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <ul className="space-y-2 text-sm">
                  {navigationLinks.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="flex items-center justify-between rounded-lg px-2 py-2.5 text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground min-h-[44px]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="resources" className="border-b border-border">
              <AccordionTrigger className="text-base font-semibold py-3 hover:no-underline">
                {t('footer.resources')}
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <ul className="space-y-2 text-sm">
                  {resourceLinks.map((item) => (
                    <li key={item.label}>
                      {"href" in item ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-lg px-2 py-2.5 text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground min-h-[44px]"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          to={item.to}
                          className="flex items-center justify-between rounded-lg px-2 py-2.5 text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground min-h-[44px]"
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contact" className="border-b-0">
              <AccordionTrigger className="text-base font-semibold py-3 hover:no-underline">
                {t('footer.contact')}
              </AccordionTrigger>
              <AccordionContent className="pt-3 pb-1">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {socialLinks.map(({ icon: Icon, href, label }) => (
                    <a
                      key={href}
                      href={href}
                      target={href.startsWith('mailto:') ? undefined : '_blank'}
                      rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
                      className="touch-target inline-flex items-center justify-center rounded-full border border-border px-3 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                      aria-label={label}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </a>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="hidden md:grid md:grid-cols-4 gap-6 lg:gap-8">
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-base sm:text-lg">{t('footer.navigation')}</h3>
            <ul className="space-y-2 text-sm">
              {navigationLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-muted-foreground transition-colors hover:text-foreground inline-block py-1"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-base sm:text-lg">{t('footer.resources')}</h3>
            <ul className="space-y-2 text-sm">
              {resourceLinks.map((item) => (
                <li key={item.label}>
                  {"href" in item ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground transition-colors hover:text-foreground inline-block py-1"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.to}
                      className="text-muted-foreground transition-colors hover:text-foreground inline-block py-1"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 sm:space-y-4 md:col-span-2">
            <h3 className="font-semibold text-base sm:text-lg">{t('footer.contact')}</h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={href}
                  href={href}
                  target={href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
                  className="touch-target inline-flex items-center justify-center rounded-full border border-border px-3 sm:px-4 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-5 sm:pt-6 text-center text-xs sm:text-sm text-muted-foreground">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};
