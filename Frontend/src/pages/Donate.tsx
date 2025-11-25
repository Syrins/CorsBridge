import { Check, Heart, Coffee, Gift } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Donate = () => {
  const { t } = useTranslation();

  const donationOptions = [
    {
      name: t('donate.oneTime.name'),
      icon: Coffee,
      amount: t('donate.oneTime.amount'),
      description: t('donate.oneTime.description'),
      features: t('donate.oneTime.features', { returnObjects: true }) as string[],
      highlighted: false,
      cta: t('donate.oneTime.cta'),
    },
    {
      name: t('donate.supporter.name'),
      icon: Heart,
      amount: t('donate.supporter.amount'),
      description: t('donate.supporter.description'),
      features: t('donate.supporter.features', { returnObjects: true }) as string[],
      highlighted: true,
      cta: t('donate.supporter.cta'),
    },
    {
      name: t('donate.sponsor.name'),
      icon: Gift,
      amount: t('donate.sponsor.amount'),
      description: t('donate.sponsor.description'),
      features: t('donate.sponsor.features', { returnObjects: true }) as string[],
      highlighted: false,
      cta: t('donate.sponsor.cta'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto safe-px py-10 sm:py-14 lg:py-16">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <Badge className="mb-3 sm:mb-4 text-xs sm:text-sm" variant="secondary">
            {t('donate.badge')}
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            {t('donate.title')}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8">
            {t('donate.subtitle')}
          </p>
        </div>

        {/* Donation Cards */}
        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto mb-12 sm:mb-16">
          {donationOptions.map((option) => {
            const Icon = option.icon;

            return (
              <Card
                key={option.name}
                className={`p-5 sm:p-6 flex flex-col ${
                  option.highlighted
                    ? "border-2 border-primary shadow-lg sm:scale-105"
                    : ""
                }`}
              >
                {option.highlighted && (
                  <Badge className="self-start mb-3 sm:mb-4 bg-primary text-xs sm:text-sm">
                    {t('donate.popular')}
                  </Badge>
                )}

                <div className="mb-4 sm:mb-6">
                  <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-2 sm:mb-3" />
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">{option.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>

                <div className="mb-4 sm:mb-6">
                  <div className="text-3xl sm:text-4xl font-bold">{option.amount}</div>
                </div>

                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 flex-1">
                  {option.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-success shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full min-h-[44px] text-sm sm:text-base"
                  variant={option.highlighted ? "default" : "outline"}
                >
                  {option.cta}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
            {t('donate.faq.title')}
          </h2>

          <div className="space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">
                {t('donate.faq.q1Title')}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('donate.faq.a1')}
              </p>
            </Card>

            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">
                {t('donate.faq.q2Title')}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('donate.faq.a2')}
              </p>
            </Card>

            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">
                {t('donate.faq.q3Title')}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('donate.faq.a3')}
              </p>
            </Card>

            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">
                {t('donate.faq.q4Title')}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('donate.faq.a4')}
              </p>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <Card className="p-6 sm:p-8 max-w-3xl mx-auto bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{t('donate.cta.title')}</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              {t('donate.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="min-w-[180px] sm:min-w-[200px] min-h-[44px]">
                {t('donate.cta.githubSponsors')}
              </Button>
              <Button size="lg" variant="outline" className="min-w-[180px] sm:min-w-[200px] min-h-[44px]">
                {t('donate.cta.buyMeCoffee')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Donate;
