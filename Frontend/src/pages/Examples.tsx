import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { Code, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Examples = () => {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const examples = [
    // React
    {
      title: t('examples.codesExamples.reactSimple.title'),
      description: t('examples.codesExamples.reactSimple.description'),
      tags: ["React", "Hooks"],
      code: `import { useEffect, useState } from 'react';

export default function UserFeed() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("https://api.cors.syrins.tech/?url=https://api.github.com/users/github")
      .then(r => r.json())
      .then(d => setData(d));
  }, []);

  return <div>{data?.name}</div>;
}`,
    },
    {
      title: t('examples.codesExamples.reactDetailed.title'),
      description: t('examples.codesExamples.reactDetailed.description'),
      tags: ["React", "Advanced"],
      code: `import { useEffect, useState } from 'react';

export default function UserProfile({ userId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    
    fetch(\`https://api.cors.syrins.tech/?url=https://api.github.com/users/\${userId}\`,
      { signal: controller.signal }
    )
      .then(r => r.json())
      .then(d => setData(d))
      .catch(e => setError(e.message));

    return () => controller.abort();
  }, [userId]);

  if (error) return <div>Error: {error}</div>;
  return data ? <div><h2>{data.name}</h2></div> : <div>Loading...</div>;
}`,
    },

    // JavaScript
    {
      title: t('examples.codesExamples.jsSimple.title'),
      description: t('examples.codesExamples.jsSimple.description'),
      tags: ["JavaScript", "Fetch"],
      code: `async function loadData() {
  const response = await fetch(
    'https://api.cors.syrins.tech/?url=https://api.example.com/data'
  );
  const data = await response.json();
  console.log(data);
}

loadData();`,
    },
    {
      title: t('examples.codesExamples.jsDetailed.title'),
      description: t('examples.codesExamples.jsDetailed.description'),
      tags: ["JavaScript", "Advanced"],
      code: `async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
      return await response.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

fetchWithRetry('https://api.cors.syrins.tech/?url=https://api.example.com/users')
  .then(data => console.log(data))
  .catch(e => console.error('Failed:', e));`,
    },

    // TypeScript
    {
      title: t('examples.codesExamples.tsSimple.title'),
      description: t('examples.codesExamples.tsSimple.description'),
      tags: ["TypeScript", "Types"],
      code: `interface User {
  id: number;
  name: string;
}

async function getUser(id: number): Promise<User> {
  const res = await fetch(
    \`https://api.cors.syrins.tech/?url=https://api.example.com/users/\${id}\`
  );
  return res.json();
}

const user = await getUser(1);`,
    },
    {
      title: t('examples.codesExamples.tsDetailed.title'),
      description: t('examples.codesExamples.tsDetailed.description'),
      tags: ["TypeScript", "Generics"],
      code: `interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  async request<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(
        \`https://api.cors.syrins.tech/?url=\${encodeURIComponent(url)}\`
      );
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      return { success: true, data: await res.json() };
    } catch (e) {
      return { 
        success: false, 
        error: e instanceof Error ? e.message : 'Unknown' 
      };
    }
  }
}

interface User { id: number; name: string; }
const client = new ApiClient();
const result = await client.request<User>('https://api.example.com/users/1');`,
    },

    // Python
    {
      title: t('examples.codesExamples.pythonSimple.title'),
      description: t('examples.codesExamples.pythonSimple.description'),
      tags: ["Python", "Requests"],
      code: `import requests

url = 'https://api.cors.syrins.tech/?url=https://api.example.com/users'
response = requests.get(url)
print(response.json())`,
    },
    {
      title: t('examples.codesExamples.pythonDetailed.title'),
      description: t('examples.codesExamples.pythonDetailed.description'),
      tags: ["Python", "Advanced"],
      code: `import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

session = requests.Session()
retry = Retry(total=3, backoff_factor=1, 
              status_forcelist=[429, 500, 502, 503])
adapter = HTTPAdapter(max_retries=retry)
session.mount('https://', adapter)

try:
  url = 'https://api.cors.syrins.tech/?url=https://api.example.com/users'
  response = session.get(url, timeout=5)
  response.raise_for_status()
  print(response.json())
except requests.RequestException as e:
  print(f'Error: {e}')`,
    },

    // cURL
    {
      title: t('examples.codesExamples.curlSimple.title'),
      description: t('examples.codesExamples.curlSimple.description'),
      tags: ["cURL", "CLI"],
      code: `curl "https://api.cors.syrins.tech/?url=https://api.example.com/users"`,
    },
    {
      title: t('examples.codesExamples.curlDetailed.title'),
      description: t('examples.codesExamples.curlDetailed.description'),
      tags: ["cURL", "Advanced"],
      code: `curl -X GET "https://api.cors.syrins.tech/?url=https://api.example.com/users/1" \\
  -H "Authorization: Bearer TOKEN" \\
  -H "Content-Type: application/json" \\
  -w "\\nStatus: %{http_code}\\n" \\
  --connect-timeout 5 \\
  --max-time 10 \\
  -v`,
    },
  ];

  const selectedExample = examples[selectedIndex];

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: hsl(var(--primary));
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.8);
        }
        
        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          ::-webkit-scrollbar-thumb {
            background: hsl(var(--primary) / 0.7);
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: hsl(var(--primary) / 0.9);
          }
        }
        
        /* Light mode */
        @media (prefers-color-scheme: light) {
          ::-webkit-scrollbar-thumb {
            background: hsl(var(--primary) / 0.5);
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: hsl(var(--primary) / 0.7);
          }
        }
      `}</style>
      
      <div className="container mx-auto safe-px py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Code className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">{t('examples.pageTitle')}</h1>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
            {t('examples.pageSubtitle')}
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Left: Examples List */}
          <div className="lg:col-span-1">
            <div className="space-y-2 sticky top-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                    selectedIndex === index
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-card border border-border hover:border-primary/50 hover:shadow-sm"
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">{example.title}</div>
                  <div className={`text-xs ${selectedIndex === index ? "opacity-90" : "text-muted-foreground"}`}>
                    {example.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Code Display */}
          <div className="lg:col-span-2">
            <Card className="p-6 h-full flex flex-col">
              <div className="mb-6 pb-6 border-b border-border">
                <h2 className="text-2xl font-bold mb-2">{selectedExample.title}</h2>
                <p className="text-sm text-muted-foreground mb-4">{selectedExample.description}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedExample.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <CodeBlock code={selectedExample.code} language="typescript" className="text-xs sm:text-sm" />
              </div>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border-primary/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">{t('examples.cta.title')}</h2>
                <p className="text-sm text-muted-foreground">{t('examples.cta.description')}</p>
              </div>
              <div className="flex gap-2">
                <a
                  href="/playground"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 shrink-0"
                >
                  {t('examples.cta.tryPlayground')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Examples;
