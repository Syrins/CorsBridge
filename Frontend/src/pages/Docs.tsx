import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, BookOpen, Code, Zap, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CodeBlock } from "@/components/ui/code-block";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Docs = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const sections = [
    {
      title: t('docs.gettingStarted'),
      items: [
        { id: "what-is", label: t('docs.whatIs') },
        { id: "quick-start", label: t('docs.quickStart') },
      ],
    },
    {
      title: t('docs.coreConcepts'),
      items: [
        { id: "url-format", label: t('docs.proxyFormat') },
        { id: "query-params", label: t('docs.queryParams') },
        { id: "methods", label: t('docs.httpMethods') },
        { id: "errors", label: t('docs.errorHandling') },
      ],
    },
    {
      title: t('docs.browserExamples'),
      items: [
        { id: "fetch", label: t('docs.fetchApi') },
        { id: "axios", label: t('docs.axios') },
        { id: "vanilla", label: t('docs.vanillaJs') },
      ],
    },
    {
      title: t('docs.frameworkGuides'),
      items: [
        { id: "react", label: t('docs.react') },
        { id: "nextjs", label: t('docs.nextjs') },
        { id: "vue", label: t('docs.vue') },
      ],
    },
    {
      title: t('docs.advanced'),
      items: [
        { id: "headers", label: t('docs.headers') },
        { id: "response", label: t('docs.responseFormat') },
      ],
    },
    { title: t('docs.faq'), items: [{ id: "faq", label: t('docs.faq') }] },
  ];

  const [activeSection, setActiveSection] = useState("what-is");

  const flatSectionList = sections.flatMap((section) => section.items);

  const handleSectionChange = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto safe-px py-8 sm:py-12 lg:py-16">
        <div className="flex flex-col gap-6 sm:gap-8 lg:grid lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('docs.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 min-h-[44px]"
              />
            </div>

            <div className="lg:hidden">
              <Select value={activeSection} onValueChange={handleSectionChange}>
                <SelectTrigger aria-label={t('docs.search')} className="min-h-[44px]">
                  <SelectValue placeholder={t('docs.search')} />
                </SelectTrigger>
                <SelectContent className="max-h-[50vh]">
                  {flatSectionList.map((item) => (
                    <SelectItem key={item.id} value={item.id} className="min-h-[44px]">
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="hidden lg:block">
              <ScrollArea className="h-[calc(100vh-240px)]" type="always">
                <nav className="space-y-6 pr-4">
                  {sections.map((section) => (
                    <div key={section.title}>
                      <h3 className="font-semibold mb-2 text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
                        {section.title}
                      </h3>
                      <ul className="space-y-1">
                        {section.items.map((item) => (
                          <li key={item.id}>
                            <button
                              onClick={() => handleSectionChange(item.id)}
                              className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors min-h-[44px] flex items-center ${
                                activeSection === item.id
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                              }`}
                            >
                              {item.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </nav>
              </ScrollArea>
            </div>
          </aside>

          {/* Main Content */}
          <main className="space-y-10 sm:space-y-12">
            {/* What is CorsBridge */}
            <section id="what-is" className="space-y-4 sm:space-y-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
                  <BookOpen className="h-7 w-7 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                  <span>{t('docs.content.whatIsTitle')}</span>
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  {t('docs.content.whatIsContent')}
                </p>
              </div>

              <Card className="p-4 sm:p-6 border-l-4 border-l-primary">
                <p className="text-sm sm:text-base">
                  <strong>CORS Neden Gerekli?</strong> {t('docs.content.whyCors')}
                </p>
              </Card>
            </section>

            {/* Quick Start */}
            <section id="quick-start" className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
                  <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
                  <span>{t('docs.content.quickStartTitle')}</span>
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                  {t('docs.content.quickStartContent')}
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold">{t('docs.content.basicUsage')}</h3>
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <CodeBlock
                    code={`// Replace your API URL with the proxied version
const response = await fetch(
  "https://api.cors.syrins.tech/?url=https://api.example.com/data"
);
const data = await response.json();`}
                    language="typescript"
                    className="text-[11px] sm:text-xs lg:text-sm"
                  />
                </div>
              </div>

              <Alert className="overflow-hidden">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <AlertDescription className="text-sm">
                  {t('docs.content.simplyPrepend')} <code className="px-1.5 py-0.5 rounded bg-secondary text-xs sm:text-sm break-all inline-block max-w-full">https://api.cors.syrins.tech/?url=</code>
                </AlertDescription>
              </Alert>
            </section>

            {/* URL Format */}
            <section id="url-format" className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{t('docs.content.proxyFormatTitle')}</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('docs.content.urlStructure')}
                </p>
              </div>

              <Card className="p-4 sm:p-6 bg-secondary/50 overflow-hidden">
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <pre className="text-xs sm:text-sm">
                    <code className="whitespace-nowrap">
                      https://api.cors.syrins.tech/?url=<span className="text-primary">TARGET_URL</span>
                    </code>
                  </pre>
                </div>
              </Card>

              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold">{t('docs.content.example')}</h3>
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <CodeBlock
                    code={`// ${t('docs.content.targetUrl')}
https://api.github.com/users/github

// ${t('docs.content.proxiedUrl')}
https://api.cors.syrins.tech/?url=https://api.github.com/users/github`}
                    className="text-[11px] sm:text-xs lg:text-sm"
                  />
                </div>
              </div>
            </section>

            {/* HTTP Methods */}
            <section id="methods" className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{t('docs.content.httpMethodsTitle')}</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('docs.content.httpMethodsSupport')}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4 overflow-hidden">
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">{t('docs.content.getRequest')}</h4>
                  <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                    <CodeBlock
                      code={`fetch("https://api.cors.syrins.tech/?url=https://api.example.com/data")`}
                      className="text-[11px] sm:text-xs lg:text-sm"
                    />
                  </div>
                </Card>

                <Card className="p-4 overflow-hidden">
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">{t('docs.content.postRequest')}</h4>
                  <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                    <CodeBlock
                      code={`fetch("https://api.cors.syrins.tech/?url=https://api.example.com/data", {
  method: "POST",
  body: JSON.stringify({ key: "value" })
})`}
                      className="text-[11px] sm:text-xs lg:text-sm"
                    />
                  </div>
                </Card>
              </div>
            </section>

            {/* Fetch API */}
            <section id="fetch" className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{t('docs.content.fetchTitle')}</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('docs.content.nativeBrowserFetch')}
                </p>
              </div>

              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <CodeBlock
                  code={`async function getData() {
  try {
    const response = await fetch(
      "https://api.cors.syrins.tech/?url=https://api.example.com/data"
    );
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

getData();`}
                  language="typescript"
                  className="text-[11px] sm:text-xs lg:text-sm"
                />
              </div>
            </section>

            {/* Axios */}
            <section id="axios" className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{t('docs.content.axiosTitle')}</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('docs.content.axiosZeroConfig')}
                </p>
              </div>

              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <CodeBlock
                  code={`import axios from 'axios';

async function getData() {
  try {
    const { data } = await axios.get(
      "https://api.cors.syrins.tech/?url=https://api.example.com/data"
    );
    console.log(data);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

getData();`}
                  language="typescript"
                  className="text-[11px] sm:text-xs lg:text-sm"
                />
              </div>
            </section>

            {/* React */}
            <section id="react" className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{t('docs.content.reactTitle')}</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('docs.content.reactHooks')}
                </p>
              </div>

              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <CodeBlock
                  code={`import { useEffect, useState } from 'react';

function DataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          "https://api.cors.syrins.tech/?url=https://api.example.com/data"
        );
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  
  return <div>{JSON.stringify(data)}</div>;
}`}
                  language="tsx"
                  className="text-[11px] sm:text-xs lg:text-sm"
                />
              </div>
            </section>

            {/* Custom Headers */}
            <section id="headers" className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{t('docs.content.headersTitle')}</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('docs.content.passCustomHeaders')}
                </p>
              </div>

              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <CodeBlock
                  code={`fetch("https://api.cors.syrins.tech/?url=https://api.example.com/data", {
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_TOKEN",
    "X-Custom-Header": "value"
  }
})`}
                  language="typescript"
                  className="text-[11px] sm:text-xs lg:text-sm"
                />
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{t('docs.content.faqTitle')}</h2>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <Card className="p-4 sm:p-6">
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">{t('docs.content.faqQ1Title')}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('docs.content.faqReallyFree')}
                  </p>
                </Card>

                <Card className="p-4 sm:p-6">
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">
                    {t('docs.content.faqQ2Title')}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('docs.content.faqNoApiKey')}
                  </p>
                </Card>

                <Card className="p-4 sm:p-6">
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">
                    {t('docs.content.faqQ3Title')}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('docs.content.faqProduction')}
                  </p>
                </Card>

                <Card className="p-4 sm:p-6">
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">
                    {t('docs.content.faqQ4Title')}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('docs.content.faqPrivacy')}
                  </p>
                </Card>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Docs;
