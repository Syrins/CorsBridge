import { Copy, Check, Zap, Shield, Globe, Code, Rocket, Lock } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/ui/code-block";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const Home = () => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();
  const baseUrl = "https://api.cors.syrins.tech";

  const copyBaseUrl = () => {
    navigator.clipboard.writeText(baseUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const withoutCorsExample = `// ❌ This will fail with CORS error
const res = await fetch(
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
);
// Error: CORS policy blocked!
// No 'Access-Control-Allow-Origin' header`;

  const withCorsExample = `// ✅ This works! CORS bypassed
const res = await fetch(
  "https://api.cors.syrins.tech/?url=https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
);
const data = await res.json();
console.log(data); // { bitcoin: { usd: 98000 } }`;
  const useCaseKeys = ["spa", "prototypes", "hackathons", "internal"] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto safe-px py-12 sm:py-16 lg:py-20">
        <div className="grid gap-8 lg:gap-16 md:grid-cols-2 items-center">
          <div className="space-y-5 sm:space-y-6">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-sm">
              {t('home.hero.badge')}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] sm:leading-tight">
              {t('home.hero.title')} {" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t('home.hero.titleHighlight')}
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button size="lg" onClick={copyBaseUrl} className="gap-2 w-full sm:w-auto min-h-[48px] text-sm sm:text-base px-4 sm:px-6">
                {copied ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : <Copy className="h-4 w-4 sm:h-5 sm:w-5" />}
                <span className="truncate">{copied ? t('home.hero.copied') : t('home.hero.copyUrl')}</span>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto min-h-[48px] text-sm sm:text-base px-4 sm:px-6">
                <Link to="/docs" className="truncate">{t('home.hero.viewDocs')}</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('home.hero.freeNote')}
            </p>
          </div>

          <Card className="p-3 sm:p-4 lg:p-6 border border-border/80 shadow-glow overflow-hidden">
            <Tabs defaultValue="without">
              <TabsList className="w-full grid grid-cols-2 h-auto">
                <TabsTrigger value="without" className="text-xs sm:text-sm px-2 py-2 sm:px-4">❌ Without Proxy</TabsTrigger>
                <TabsTrigger value="with" className="text-xs sm:text-sm px-2 py-2 sm:px-4">✅ With CorsBridge</TabsTrigger>
              </TabsList>
              <TabsContent value="without" className="mt-3 sm:mt-4 overflow-hidden">
                <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                  <CodeBlock code={withoutCorsExample} language="typescript" className="max-h-[200px] sm:max-h-[260px] text-[11px] sm:text-xs lg:text-sm" />
                </div>
              </TabsContent>
              <TabsContent value="with" className="mt-3 sm:mt-4 overflow-hidden">
                <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                  <CodeBlock code={withCorsExample} language="typescript" className="max-h-[200px] sm:max-h-[260px] text-[11px] sm:text-xs lg:text-sm" />
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-secondary/30">
        <div className="container mx-auto safe-px py-12 sm:py-16 lg:py-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            <Card className="p-5 sm:p-6 h-full hover:border-primary/50 transition-colors">
              <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{t('home.features.free.title')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('home.features.free.description')}
              </p>
            </Card>

            <Card className="p-5 sm:p-6 h-full hover:border-primary/50 transition-colors">
              <Globe className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{t('home.features.global.title')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('home.features.global.description')}
              </p>
            </Card>

            <Card className="p-5 sm:p-6 h-full hover:border-primary/50 transition-colors">
              <Code className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{t('home.features.developer.title')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('home.features.developer.description')}
              </p>
            </Card>

            <Card className="p-5 sm:p-6 h-full hover:border-primary/50 transition-colors">
              <Rocket className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{t('home.features.methods.title')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('home.features.methods.description')}
              </p>
            </Card>

            <Card className="p-5 sm:p-6 h-full hover:border-primary/50 transition-colors">
              <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{t('home.features.reliable.title')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('home.features.reliable.description')}
              </p>
            </Card>

            <Card className="p-5 sm:p-6 h-full hover:border-primary/50 transition-colors">
              <Lock className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{t('home.features.secure.title')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('home.features.secure.description')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto safe-px py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">{t('home.howItWorks.title')}</h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            {t('home.howItWorks.subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((step) => (
            <div key={step} className="text-center space-y-3 sm:space-y-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-xl sm:text-2xl font-bold text-primary">{step}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold px-2">
                {t(`home.howItWorks.step${step}.title`)}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground px-2">
                {t(`home.howItWorks.step${step}.description`)}
              </p>
              <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
                <code className="block text-xs sm:text-sm bg-secondary p-2 sm:p-3 rounded whitespace-nowrap">
                  {step === 1
                    ? "?url=https://api.example.com"
                    : step === 2
                      ? t('home.howItWorks.proxyHandles')
                      : "const data = await res.json()"}
                </code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Playground Preview */}
      <section className="border-t border-border bg-secondary/30">
        <div className="container mx-auto safe-px py-12 sm:py-16 lg:py-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              {t('home.tryLive.title')}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              {t('home.tryLive.subtitle')}
            </p>
          </div>

          <Card className="max-w-4xl mx-auto p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('home.tryLive.targetUrl')}
                </label>
                <Input
                  placeholder="https://api.example.com/data"
                  defaultValue="https://api.github.com/users/github"
                  className="font-mono text-xs sm:text-sm w-full"
                  style={{ maxWidth: '100%' }}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1 min-h-[44px]" asChild size="lg">
                  <Link to="/playground">{t('home.tryLive.openPlayground')}</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto safe-px py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">{t('home.useCases.title')}</h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            {t('home.useCases.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {useCaseKeys.map((useCase) => (
            <Card key={useCase} className="p-4 sm:p-5 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-2">{t(`home.useCases.${useCase}.title`)}</h3>
              <p className="text-sm text-muted-foreground">
                {t(`home.useCases.${useCase}.description`)}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto safe-px py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-full">
            <Button size="lg" asChild className="w-full sm:w-auto sm:min-w-[200px] min-h-[44px] px-4">
              <Link to="/docs" className="truncate">{t('home.cta.readDocs')}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto sm:min-w-[200px] min-h-[44px] px-4">
              <Link to="/examples" className="truncate">{t('home.cta.viewExamples')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
