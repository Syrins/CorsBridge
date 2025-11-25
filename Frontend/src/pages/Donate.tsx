import { Check, Heart, Coffee, Gift, Sparkles, ArrowRight } from "lucide-react";
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
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto safe-px py-12 sm:py-16 lg:py-20 relative">
          <div className="text-center mb-12 sm:mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge className="text-xs sm:text-sm" variant="secondary">
                <Sparkles className="h-3 w-3 mr-1" />
                {t('donate.badge')}
              </Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('donate.title')}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('donate.subtitle')}
            </p>
          </div>

          {/* Donation Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto mb-16 sm:mb-20">
            {donationOptions.map((option) => {
              const Icon = option.icon;

              return (
                <div key={option.name} className={option.highlighted ? "lg:scale-105" : ""}>
                  <Card
                    className={`h-full p-6 flex flex-col transition-all duration-300 hover:shadow-lg ${
                      option.highlighted
                        ? "border-2 border-primary bg-gradient-to-br from-primary/5 to-transparent"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {option.highlighted && (
                      <div className="flex items-center gap-2 mb-6">
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          {t('donate.popular')}
                        </Badge>
                      </div>
                    )}

                    <div className="mb-8">
                      <div className={`inline-flex p-3 rounded-lg mb-4 ${
                        option.highlighted
                          ? "bg-primary/10"
                          : "bg-muted"
                      }`}>
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{option.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>

                    <div className="mb-8">
                      <div className={`text-4xl font-bold ${option.highlighted ? "text-primary" : ""}`}>
                        {option.amount}
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {option.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full group"
                      variant={option.highlighted ? "default" : "outline"}
                      size="lg"
                    >
                      {option.cta}
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Benefits Section */}
          <div className="max-w-4xl mx-auto mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              {t('donate.faq.title')}
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {[
                { title: t('donate.faq.q1Title'), desc: t('donate.faq.a1') },
                { title: t('donate.faq.q2Title'), desc: t('donate.faq.a2') },
                { title: t('donate.faq.q3Title'), desc: t('donate.faq.a3') },
                { title: t('donate.faq.q4Title'), desc: t('donate.faq.a4') },
              ].map((item, idx) => (
                <Card
                  key={idx}
                  className="p-6 border-border hover:border-primary/50 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex gap-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                      <span className="text-sm font-bold text-primary">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="max-w-3xl mx-auto">
            <Card className="p-8 sm:p-12 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border-primary/30">
              <div className="text-center">
                <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t('donate.cta.title')}</h2>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                  {t('donate.cta.description')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="min-h-[48px] group">
                    {t('donate.cta.githubSponsors')}
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button size="lg" variant="outline" className="min-h-[48px] group">
                    {t('donate.cta.buyMeCoffee')}
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
