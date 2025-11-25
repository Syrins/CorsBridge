import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Send, Code, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Playground = () => {
  const { t } = useTranslation();
  const [targetUrl, setTargetUrl] = useState("https://api.github.com/users/github");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState("{\n  \"Content-Type\": \"application/json\"\n}");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const proxyUrl = `https://api.cors.syrins.tech/?url=${encodeURIComponent(targetUrl)}`;

  const sendRequest = async () => {
    setLoading(true);
    setResponse("");
    
    try {
      const parsedHeaders = headers ? JSON.parse(headers) : {};
      
      const options: RequestInit = {
        method,
        headers: parsedHeaders,
      };
      
      if (method !== "GET" && body) {
        options.body = body;
      }
      
      const res = await fetch(proxyUrl, options);
      const data = await res.json();
      
      setResponse(JSON.stringify(data, null, 2));
      toast.success(t('playground.success'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResponse(JSON.stringify({ error: errorMessage }, null, 2));
      toast.error("Request failed: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto safe-px py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Code className="h-8 w-8 sm:h-10 sm:w-10 text-primary flex-shrink-0" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">{t('playground.title')}</h1>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">
            {t('playground.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 max-w-6xl mx-auto lg:grid-cols-2">
          {/* Request Panel */}
          <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                <Send className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                <span>{t('playground.requestBuilder')}</span>
              </h2>
            </div>

            {/* Target URL */}
            <div className="space-y-2">
              <Label htmlFor="url" className="text-sm sm:text-base">{t('playground.targetUrl')}</Label>
              <Input
                id="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://api.example.com/data"
                className="font-mono text-xs sm:text-sm min-h-[44px]"
              />
            </div>

            {/* Method */}
            <div className="space-y-2">
              <Label htmlFor="method" className="text-sm sm:text-base">{t('playground.method')}</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger id="method" className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET" className="min-h-[44px]">GET</SelectItem>
                  <SelectItem value="POST" className="min-h-[44px]">POST</SelectItem>
                  <SelectItem value="PUT" className="min-h-[44px]">PUT</SelectItem>
                  <SelectItem value="PATCH" className="min-h-[44px]">PATCH</SelectItem>
                  <SelectItem value="DELETE" className="min-h-[44px]">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Headers */}
            <div className="space-y-2">
              <Label htmlFor="headers" className="text-sm sm:text-base">{t('playground.headers')}</Label>
              <Textarea
                id="headers"
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                placeholder='{"Content-Type": "application/json"}'
                className="font-mono text-xs sm:text-sm min-h-[100px] sm:min-h-[120px]"
              />
            </div>

            {/* Request Body */}
            {method !== "GET" && (
              <div className="space-y-2">
                <Label htmlFor="body" className="text-sm sm:text-base">{t('playground.requestBody')}</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder='{"key": "value"}'
                  className="font-mono text-xs sm:text-sm min-h-[80px] sm:min-h-[100px]"
                />
              </div>
            )}

            {/* Proxy URL Preview */}
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">{t('playground.proxyUrl')}</Label>
              <div className="p-3 rounded-md bg-secondary border border-border overflow-x-auto max-w-full">
                <code className="text-xs block break-all" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{proxyUrl}</code>
              </div>
            </div>

            {/* Send Button */}
            <Button
              onClick={sendRequest}
              disabled={loading || !targetUrl}
              className="w-full min-h-[48px] sm:min-h-[52px] text-base"
              size="lg"
            >
              {loading ? t('playground.sending') : t('playground.sendRequest')}
            </Button>
          </Card>

          {/* Response Panel */}
          <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                <FileJson className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                <span>{t('playground.response')}</span>
              </h2>
            </div>

            {response ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default" className="bg-success text-xs sm:text-sm">
                    {t('playground.statusOk')}
                  </Badge>
                  <Badge variant="secondary" className="text-xs sm:text-sm">{t('playground.contentType')}</Badge>
                </div>

                <div className="rounded-lg bg-[hsl(var(--code-bg))] border border-border overflow-hidden">
                  <pre className="p-3 sm:p-4 overflow-x-auto max-h-[300px] sm:max-h-[400px]">
                    <code className="text-xs sm:text-sm font-mono text-foreground">
                      {response}
                    </code>
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-[280px] sm:h-[320px] lg:h-[380px] flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                <div className="text-center px-4">
                  <FileJson className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {t('playground.sendToSee')}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

          {/* Info Card */}
          <Card className="mt-8 sm:mt-10 p-4 sm:p-6 max-w-4xl mx-auto bg-primary/5 border-primary/20">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">{t('playground.about.title')}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('playground.about.description')}
            </p>
          </Card>
      </div>
    </div>
  );
};

export default Playground;
