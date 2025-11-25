import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { Code } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Examples = () => {
  const { t } = useTranslation();
  const examples = [
    {
      title: t('examples.reactFetch.title'),
      description: t('examples.reactFetch.description'),
      tags: t('examples.reactFetch.tags', { returnObjects: true }) as string[],
      code: `import { useEffect, useState } from 'react';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.cors.syrins.tech/?url=https://api.github.com/users/github")
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <p>Loading...</p>;
  return <div>{user?.name}</div>;
}`,
    },
    {
      title: t('examples.axiosPost.title'),
      description: t('examples.axiosPost.description'),
      tags: t('examples.axiosPost.tags', { returnObjects: true }) as string[],
      code: `import axios from 'axios';

async function createUser() {
  try {
    const response = await axios.post(
      "https://api.cors.syrins.tech/?url=https://api.example.com/users",
      {
        name: "John Doe",
        email: "john@example.com"
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    
    console.log("User created:", response.data);
  } catch (error) {
    console.error("Error:", error.message);
  }
}`,
    },
    {
      title: t('examples.vanilla.title'),
      description: t('examples.vanilla.description'),
      tags: t('examples.vanilla.tags', { returnObjects: true }) as string[],
      code: `document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('data-container');
  
  try {
    const response = await fetch(
      'https://api.cors.syrins.tech/?url=https://api.example.com/data'
    );
    const data = await response.json();
    
    container.innerHTML = \`
      <h2>\${data.title}</h2>
      <p>\${data.description}</p>
    \`;
  } catch (error) {
    container.innerHTML = '<p>Error loading data</p>';
    console.error('Fetch error:', error);
  }
});`,
    },
    {
      title: t('examples.nextjs.title'),
      description: t('examples.nextjs.description'),
      tags: t('examples.nextjs.tags', { returnObjects: true }) as string[],
      code: `// pages/api/proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url } = req.query;
  
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL required' });
  }

  try {
    const response = await fetch(
      \`https://api.cors.syrins.tech/?url=\${encodeURIComponent(url)}\`
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy failed' });
  }
}`,
    },
    {
      title: t('examples.vue.title'),
      description: t('examples.vue.description'),
      tags: t('examples.vue.tags', { returnObjects: true }) as string[],
      code: `<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface User {
  id: number;
  name: string;
  email: string;
}

const users = ref<User[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await fetch(
      'https://api.cors.syrins.tech/?url=https://api.example.com/users'
    );
    users.value = await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-if="loading">Loading...</div>
  <ul v-else>
    <li v-for="user in users" :key="user.id">
      {{ user.name }}
    </li>
  </ul>
</template>`,
    },
    {
      title: t('examples.customHeaders.title'),
      description: t('examples.customHeaders.description'),
      tags: t('examples.customHeaders.tags', { returnObjects: true }) as string[],
      code: `async function fetchWithAuth() {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(
    'https://api.cors.syrins.tech/?url=https://api.example.com/protected',
    {
      method: 'GET',
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json',
        'X-Custom-Header': 'custom-value'
      }
    }
  );

  if (response.status === 401) {
    console.error('Unauthorized');
    return null;
  }

  return await response.json();
}`,
    },
    {
      title: t('examples.errorHandling.title'),
      description: t('examples.errorHandling.description'),
      tags: t('examples.errorHandling.tags', { returnObjects: true }) as string[],
      code: `async function robustFetch<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(
      \`https://api.cors.syrins.tech/?url=\${encodeURIComponent(url)}\`
    );

    // Check if response is ok (status 200-299)
    if (!response.ok) {
      throw new Error(
        \`HTTP error! status: \${response.status}\`
      );
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error('Response is not JSON');
    }

    const data = await response.json();
    return data as T;
    
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('Network error:', error);
    } else if (error instanceof Error) {
      console.error('Fetch error:', error.message);
    }
    return null;
  }
}

// Usage
const data = await robustFetch<User>('https://api.example.com/user');`,
    },
    {
      title: t('examples.reactQuery.title'),
      description: t('examples.reactQuery.description'),
      tags: t('examples.reactQuery.tags', { returnObjects: true }) as string[],
      code: `import { useQuery } from '@tanstack/react-query';

function useGitHubUser(username: string) {
  return useQuery({
    queryKey: ['github-user', username],
    queryFn: async () => {
      const response = await fetch(
        \`https://api.cors.syrins.tech/?url=https://api.github.com/users/\${username}\`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Usage in component
function UserCard({ username }: { username: string }) {
  const { data, isLoading, error } = useGitHubUser(username);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user</div>;

  return (
    <div>
      <h2>{data.name}</h2>
      <p>@{data.login}</p>
    </div>
  );
}`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto safe-px py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Code className="h-8 w-8 sm:h-10 sm:w-10 text-primary flex-shrink-0" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">{t('examples.pageTitle')}</h1>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('examples.pageSubtitle')}
          </p>
        </div>

        {/* Examples Grid */}
        <div className="space-y-6 sm:space-y-8">
          {examples.map((example, index) => (
            <Card key={index} className="p-4 sm:p-6 overflow-hidden">
              <div className="mb-4">
                <h2 className="text-xl sm:text-2xl font-semibold mb-2">{example.title}</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-3">
                  {example.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {example.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs sm:text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <CodeBlock code={example.code} language="typescript" className="text-[11px] sm:text-xs lg:text-sm" />
              </div>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <Card className="p-6 sm:p-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
              {t('examples.cta.title')}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              {t('examples.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href="/docs"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px] px-6"
              >
                {t('examples.cta.readDocs')}
              </a>
              <a
                href="/playground"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground min-h-[44px] px-6"
              >
                {t('examples.cta.tryPlayground')}
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Examples;
