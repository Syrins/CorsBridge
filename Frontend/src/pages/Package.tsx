import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Package as PackageIcon, Download, Code, Zap, CheckCircle, ArrowRight, Terminal, Github, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Package = () => {
  const { t } = useTranslation();
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedCommand(command);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const installCommands = {
    npm: "npm install corsbridge",
    yarn: "yarn add corsbridge",
    pnpm: "pnpm add corsbridge"
  };

  const basicExample = `import { corsFetch } from 'corsbridge';

// Simple GET request
const data = await corsFetch('https://api.github.com/users/github');
console.log(data);`;

  const advancedExample = `import { corsFetch, ValidationError, RateLimitError } from 'corsbridge';

// Advanced usage with error handling
try {
  const response = await corsFetch('https://api.example.com/data', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: { name: 'John Doe' },
    params: { page: 1 },
    timeout: 10000
  });
  console.log(response);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation error:', error.message);
    console.error('Request ID:', error.requestId);
  } else if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded');
  }
}`;

  const reactExample = `import { useEffect, useState } from 'react';
import { corsFetch } from 'corsbridge';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    corsFetch('https://api.github.com/users/github')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{JSON.stringify(data)}</div>;
}`;

  const vueExample = `<script setup>
import { ref, onMounted } from 'vue';
import { corsFetch } from 'corsbridge';

const data = ref(null);

onMounted(async () => {
  data.value = await corsFetch('https://api.github.com/users/github');
});
</script>

<template>
  <div>{{ data }}</div>
</template>`;

  const features = [
    { icon: Zap, title: t('package.features.zeroConfig.title'), desc: t('package.features.zeroConfig.description') },
    { icon: Code, title: t('package.features.typeSafe.title'), desc: t('package.features.typeSafe.description') },
    { icon: CheckCircle, title: t('package.features.secure.title'), desc: t('package.features.secure.description') },
    { icon: Download, title: t('package.features.lightweight.title'), desc: t('package.features.lightweight.description') }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto safe-px py-12 sm:py-16 lg:py-20">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-sm">
            {t('package.hero.badge')}
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            {t('package.hero.title')}
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('package.hero.titleHighlight')}
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('package.hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild className="gap-2">
              <a href="https://www.npmjs.com/package/corsbridge" target="_blank" rel="noopener noreferrer">
                <PackageIcon className="h-5 w-5" />
                {t('package.hero.viewNpm')}
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="gap-2">
              <a href="https://github.com/syrins/cors-bridge" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5" />
                {t('package.hero.viewGithub')}
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 justify-center pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">7.3 KB</div>
              <div className="text-sm text-muted-foreground">{t('package.hero.stats.size')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">v1.0.0</div>
              <div className="text-sm text-muted-foreground">{t('package.hero.stats.version')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">MIT</div>
              <div className="text-sm text-muted-foreground">{t('package.hero.stats.license')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Installation */}
      <section className="border-t border-border bg-secondary/30">
        <div className="container mx-auto safe-px py-12 sm:py-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('package.installation.title')}</h2>
            <p className="text-muted-foreground text-lg">{t('package.installation.subtitle')}</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="npm" className="w-full">
              <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
                <TabsTrigger value="npm">npm</TabsTrigger>
                <TabsTrigger value="yarn">yarn</TabsTrigger>
                <TabsTrigger value="pnpm">pnpm</TabsTrigger>
              </TabsList>

              {Object.entries(installCommands).map(([manager, command]) => (
                <TabsContent key={manager} value={manager} className="mt-6">
                  <Card className="p-6 relative">
                    <div className="flex items-center gap-3 mb-3">
                      <Terminal className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">{t('package.installation.terminal')}</span>
                    </div>
                    <div className="relative">
                      <code className="block bg-secondary/50 p-4 rounded-lg font-mono text-sm sm:text-base">
                        {command}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-2 top-2"
                        onClick={() => copyCommand(command)}
                      >
                        {copiedCommand === command ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Code className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto safe-px py-12 sm:py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('package.features.title')}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('package.features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6 hover:border-primary/50 transition-colors">
              <feature.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Code Examples */}
      <section className="border-t border-border bg-secondary/30">
        <div className="container mx-auto safe-px py-12 sm:py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('package.examples.title')}</h2>
            <p className="text-muted-foreground text-lg">{t('package.examples.subtitle')}</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full">
                <TabsTrigger value="basic">{t('package.examples.basic')}</TabsTrigger>
                <TabsTrigger value="advanced">{t('package.examples.advanced')}</TabsTrigger>
                <TabsTrigger value="react">{t('package.examples.react')}</TabsTrigger>
                <TabsTrigger value="vue">{t('package.examples.vue')}</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-6">
                <CodeBlock code={basicExample} language="typescript" />
              </TabsContent>

              <TabsContent value="advanced" className="mt-6">
                <CodeBlock code={advancedExample} language="typescript" />
              </TabsContent>

              <TabsContent value="react" className="mt-6">
                <CodeBlock code={reactExample} language="tsx" />
              </TabsContent>

              <TabsContent value="vue" className="mt-6">
                <CodeBlock code={vueExample} language="vue" />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section className="container mx-auto safe-px py-12 sm:py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('package.api.title')}</h2>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">{t('package.api.corsFetch.title')}</h3>
            <p className="text-muted-foreground mb-4">{t('package.api.corsFetch.description')}</p>
            <CodeBlock 
              code={`interface CorsFetchOptions {
  method?: string;                    // HTTP method
  headers?: Record<string, string>;   // Request headers
  body?: any;                         // Request body
  params?: Record<string, any>;       // Query parameters
  timeout?: number;                   // Request timeout (ms)
  responseType?: 'json' | 'text' | 'arrayBuffer' | 'blob';
}`}
              language="typescript"
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">{t('package.api.convenience.title')}</h3>
            <p className="text-muted-foreground mb-4">{t('package.api.convenience.description')}</p>
            <CodeBlock 
              code={`import { corsGet, corsPost, corsPut, corsPatch, corsDelete } from 'corsbridge';

// GET
await corsGet('https://api.example.com/users');

// POST
await corsPost('https://api.example.com/users', { name: 'John' });

// PUT
await corsPut('https://api.example.com/users/1', { name: 'Jane' });

// PATCH
await corsPatch('https://api.example.com/users/1', { email: 'jane@example.com' });

// DELETE
await corsDelete('https://api.example.com/users/1');`}
              language="typescript"
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">{t('package.api.errors.title')}</h3>
            <p className="text-muted-foreground mb-4">{t('package.api.errors.description')}</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">ValidationError</Badge>
                <span className="text-sm">400, 403, 414 - {t('package.api.errors.validation')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">RateLimitError</Badge>
                <span className="text-sm">429 - {t('package.api.errors.rateLimit')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">GatewayTimeoutError</Badge>
                <span className="text-sm">504 - {t('package.api.errors.timeout')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">BadGatewayError</Badge>
                <span className="text-sm">502 - {t('package.api.errors.gateway')}</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto safe-px py-12 sm:py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('package.cta.title')}</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            {t('package.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="gap-2">
              <a href="https://www.npmjs.com/package/corsbridge" target="_blank" rel="noopener noreferrer">
                <Download className="h-5 w-5" />
                {t('package.cta.install')}
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/docs">{t('package.cta.docs')}</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Package;

