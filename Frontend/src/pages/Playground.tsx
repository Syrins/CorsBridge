import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Send, Code, FileJson, Copy, Trash2, Plus, X, Download, Eye, ChevronDown, Zap, Eye as EyeIcon } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface SavedRequest {
  id: string;
  timestamp: number;
  url: string;
  method: string;
  headers: string;
  body: string;
  params: QueryParam[];
}

interface ResponseData {
  data?: unknown;
  error?: string;
  time?: number;
  size?: number;
  status?: number;
  headers?: Record<string, string>;
  statusText?: string;
}

interface QueryParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

const EXAMPLE_PRESETS = [
  {
    name: "GitHub API",
    url: "https://api.github.com/users/github",
    method: "GET",
    headers: '{\n  "Content-Type": "application/json",\n  "Accept": "application/json"\n}',
    body: "",
  },
  {
    name: "JSONPlaceholder",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    method: "GET",
    headers: '{\n  "Content-Type": "application/json"\n}',
    body: "",
  },
  {
    name: "HTTP Bin (POST)",
    url: "https://httpbin.org/post",
    method: "POST",
    headers: '{\n  "Content-Type": "application/json"\n}',
    body: '{\n  "test": "data",\n  "message": "Hello from CORS Bridge"\n}',
  },
];

const Playground = () => {
  const { t } = useTranslation();
  const [targetUrl, setTargetUrl] = useState("https://api.github.com/users/github");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState("{\n  \"Content-Type\": \"application/json\"\n}");
  const [body, setBody] = useState("");
  const [bodyFormat, setBodyFormat] = useState("json");
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("raw");
  const [history, setHistory] = useState<SavedRequest[]>([]);
  const [requestTab, setRequestTab] = useState<"params" | "headers" | "body" | "auth">("params");
  const [queryParams, setQueryParams] = useState<QueryParam[]>([
    { id: "1", key: "", value: "", enabled: true },
  ]);
  const [authToken, setAuthToken] = useState("");
  const [authType, setAuthType] = useState<"none" | "bearer" | "basic">("none");
  const [responseSize, setResponseSize] = useState(0);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cors-bridge-history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history:", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("cors-bridge-history", JSON.stringify(history.slice(0, 20)));
    }
  }, [history]);

  const proxyUrl = `https://api.cors.syrins.tech/?url=${encodeURIComponent(targetUrl)}`;

  const applyPreset = (preset: typeof EXAMPLE_PRESETS[0]) => {
    setTargetUrl(preset.url);
    setMethod(preset.method);
    setHeaders(preset.headers);
    setBody(preset.body);
    toast.success(`Preset "${preset.name}" loaded`);
  };

  // Build URL with query parameters
  const buildUrlWithParams = (): string => {
    const enabledParams = queryParams.filter(p => p.enabled && p.key);
    if (enabledParams.length === 0) return targetUrl;
    
    const url = new URL(targetUrl);
    enabledParams.forEach(param => {
      url.searchParams.append(param.key, param.value);
    });
    return url.toString();
  };

  const addQueryParam = () => {
    setQueryParams([
      ...queryParams,
      { id: Date.now().toString(), key: "", value: "", enabled: true },
    ]);
  };

  const removeQueryParam = (id: string) => {
    setQueryParams(queryParams.filter(p => p.id !== id));
  };

  const updateQueryParam = (id: string, field: string, value: string) => {
    setQueryParams(
      queryParams.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  const toggleQueryParam = (id: string) => {
    setQueryParams(
      queryParams.map(p =>
        p.id === id ? { ...p, enabled: !p.enabled } : p
      )
    );
  };

  const saveToHistory = (req: {
    url: string;
    method: string;
    headers: string;
    body: string;
    params: QueryParam[];
  }) => {
    const newRequest: SavedRequest = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...req,
    };
    setHistory([newRequest, ...history.slice(0, 19)]);
  };

  const loadFromHistory = (req: SavedRequest) => {
    setTargetUrl(req.url);
    setMethod(req.method);
    setHeaders(req.headers);
    setBody(req.body);
    setQueryParams(req.params || []);
    toast.success("Request loaded from history");
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("cors-bridge-history");
    toast.success("History cleared");
  };

  const copyCurl = () => {
    try {
      const code = buildCurlCode();
      navigator.clipboard.writeText(code);
      toast.success("cURL copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy cURL");
    }
  };

  const buildCurlCode = (): string => {
    try {
      const parsedHeaders = headers ? JSON.parse(headers) : {};
      const fullUrl = buildUrlWithParams();
      let curl = `curl -X ${method} "${fullUrl}"`;
      
      Object.entries(parsedHeaders).forEach(([key, value]) => {
        curl += ` \\\n  -H "${key}: ${value}"`;
      });

      if (authType === "bearer" && authToken) {
        curl += ` \\\n  -H "Authorization: Bearer ${authToken}"`;
      } else if (authType === "basic" && authToken) {
        curl += ` \\\n  -H "Authorization: Basic ${btoa(authToken)}"`;
      }
      
      if (method !== "GET" && body) {
        curl += ` \\\n  -d '${body.replace(/'/g, "'\\''")}'`;
      }

      return curl;
    } catch {
      return "";
    }
  };

  const buildBashCode = (): string => {
    try {
      const parsedHeaders = headers ? JSON.parse(headers) : {};
      const fullUrl = buildUrlWithParams();
      
      let bash = `#!/bin/bash\n\nURL="${fullUrl}"\nMETHOD="${method}"\n`;
      bash += `\nDECLARE -A HEADERS=(\n`;
      
      Object.entries(parsedHeaders).forEach(([key, value]) => {
        bash += `  ["${key}"]="${value}"\n`;
      });
      bash += `)\n\n`;

      if (authType === "bearer" && authToken) {
        bash += `AUTH_HEADER="Authorization: Bearer ${authToken}"\n`;
      } else if (authType === "basic" && authToken) {
        bash += `AUTH_HEADER="Authorization: Basic ${btoa(authToken)}"\n`;
      }

      bash += `\nfor header in "\${!HEADERS[@]}"; do\n`;
      bash += `  curl_args+=(-H "$header: \${HEADERS[$header]}")\n`;
      bash += `done\n\n`;

      if (body && method !== "GET") {
        bash += `curl "\${curl_args[@]}" -X $METHOD -d '${body.replace(/'/g, "'\\''")}'  "$URL"\n`;
      } else {
        bash += `curl "\${curl_args[@]}" -X $METHOD "$URL"\n`;
      }

      return bash;
    } catch {
      return "";
    }
  };

  const buildPythonCode = (): string => {
    try {
      const parsedHeaders = headers ? JSON.parse(headers) : {};
      const fullUrl = buildUrlWithParams();
      
      let python = `import requests\nimport json\n\n`;
      python += `url = "${fullUrl}"\nmethod = "${method}"\n`;
      python += `headers = ${JSON.stringify(parsedHeaders, null, 2).split('\n').join('\n')}\n\n`;

      if (authType === "bearer" && authToken) {
        python += `headers["Authorization"] = "Bearer ${authToken}"\n`;
      } else if (authType === "basic" && authToken) {
        python += `headers["Authorization"] = "Basic ${btoa(authToken)}"\n`;
      }

      if (body && method !== "GET") {
        python += `\ndata = ${JSON.stringify(JSON.parse(body), null, 2)}\n`;
        python += `response = requests.request(method, url, headers=headers, json=data)\n`;
      } else {
        python += `\nresponse = requests.request(method, url, headers=headers)\n`;
      }

      python += `\nprint(response.json())\n`;

      return python;
    } catch {
      return "";
    }
  };

  const buildJavaScriptCode = (): string => {
    try {
      const parsedHeaders = headers ? JSON.parse(headers) : {};
      const fullUrl = buildUrlWithParams();
      
      let js = `const url = '${fullUrl}';\nconst options = {\n  method: '${method}',\n`;
      js += `  headers: ${JSON.stringify(parsedHeaders, null, 4).split('\n').join('\n  ')},\n`;

      if (authType === "bearer" && authToken) {
        js += `  headers: {\n    ...headers,\n    'Authorization': 'Bearer ${authToken}'\n  },\n`;
      } else if (authType === "basic" && authToken) {
        js += `  headers: {\n    ...headers,\n    'Authorization': 'Basic ${btoa(authToken)}'\n  },\n`;
      }

      if (body && method !== "GET") {
        js += `  body: JSON.stringify(${JSON.stringify(JSON.parse(body), null, 2)}),\n`;
      }

      js += `};\n\nfetch(url, options)\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error('Error:', error));\n`;

      return js;
    } catch {
      return "";
    }
  };

  const buildVBNetCode = (): string => {
    try {
      const parsedHeaders = headers ? JSON.parse(headers) : {};
      const fullUrl = buildUrlWithParams();
      
      let vb = `Dim request As HttpRequestMessage = New HttpRequestMessage(HttpMethod.Parse("${method}"), "${fullUrl}")\n\n`;
      
      Object.entries(parsedHeaders).forEach(([key, value]) => {
        vb += `request.Headers.Add("${key}", "${value}")\n`;
      });

      if (authType === "bearer" && authToken) {
        vb += `request.Headers.Add("Authorization", "Bearer ${authToken}")\n`;
      } else if (authType === "basic" && authToken) {
        vb += `request.Headers.Add("Authorization", "Basic ${btoa(authToken)}")\n`;
      }

      if (body && method !== "GET") {
        vb += `\nDim content As StringContent = New StringContent("${body.replace(/"/g, '\\"')}", Encoding.UTF8, "application/json")\n`;
        vb += `request.Content = content\n`;
      }

      vb += `\nUsing client As HttpClient = New HttpClient()\n`;
      vb += `    Dim response As HttpResponseMessage = Await client.SendAsync(request)\n`;
      vb += `    Dim responseContent As String = Await response.Content.ReadAsStringAsync()\n`;
      vb += `End Using\n`;

      return vb;
    } catch {
      return "";
    }
  };

  const copyBash = () => {
    try {
      const code = buildBashCode();
      navigator.clipboard.writeText(code);
      toast.success("Bash script copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy Bash script");
    }
  };

  const copyPython = () => {
    try {
      const code = buildPythonCode();
      navigator.clipboard.writeText(code);
      toast.success("Python code copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy Python code");
    }
  };

  const copyJavaScript = () => {
    try {
      const code = buildJavaScriptCode();
      navigator.clipboard.writeText(code);
      toast.success("JavaScript code copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy JavaScript code");
    }
  };

  const copyVBNet = () => {
    try {
      const code = buildVBNetCode();
      navigator.clipboard.writeText(code);
      toast.success("VB.NET code copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy VB.NET code");
    }
  };

  const copyResponse = () => {
    try {
      if (!response?.data) return;
      const data = typeof response.data === "string" 
        ? response.data 
        : JSON.stringify(response.data, null, 2);
      navigator.clipboard.writeText(data);
      toast.success("Response copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy response");
    }
  };

  const downloadResponse = () => {
    try {
      if (!response?.data) return;
      const data = typeof response.data === "string" 
        ? response.data 
        : JSON.stringify(response.data, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `response-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Response downloaded");
    } catch (error) {
      toast.error("Failed to download response");
    }
  };

  const sendRequest = async () => {
    setLoading(true);
    setResponse(null);
    setActiveTab("raw");
    abortControllerRef.current = new AbortController();

    try {
      if (!targetUrl.trim()) {
        throw new Error("Please enter a target URL");
      }

      const parsedHeaders = headers ? JSON.parse(headers) : {};
      const fullUrl = buildUrlWithParams();
      
      // Add authentication header if needed
      if (authType === "bearer" && authToken) {
        parsedHeaders["Authorization"] = `Bearer ${authToken}`;
      } else if (authType === "basic" && authToken) {
        parsedHeaders["Authorization"] = `Basic ${btoa(authToken)}`;
      }

      const startTime = Date.now();
      const proxyRequestUrl = `https://api.cors.syrins.tech/?url=${encodeURIComponent(fullUrl)}`;

      const options: RequestInit = {
        method,
        headers: parsedHeaders,
        signal: abortControllerRef.current.signal,
      };

      if (method !== "GET" && body) {
        options.body = body;
      }

      const res = await fetch(proxyRequestUrl, options);
      const data = await res.text();
      const endTime = Date.now();

      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch {
        parsedData = data;
      }

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const responseSize = new Blob([data]).size;

      setResponseSize(responseSize);
      setResponse({
        data: parsedData,
        status: res.status,
        statusText: res.statusText,
        time: endTime - startTime,
        size: responseSize,
        headers: responseHeaders,
      });

      saveToHistory({
        url: targetUrl,
        method,
        headers,
        body,
        params: queryParams,
      });
      
      if (res.ok) {
        toast.success(t("playground.success"));
      } else {
        toast.warning(`Response status: ${res.status}`);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        setResponse({ error: errorMessage });
        toast.error("Request failed: " + errorMessage);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      toast.info("Request cancelled");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">API Playground</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Test your APIs with advanced request builder</p>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Quick Presets */}
          <Card className="p-4">
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(preset)}
                  className="text-xs"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Request Builder - Main */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="p-4 sm:p-6">
                {/* URL Bar */}
                <div className="space-y-3 mb-4">
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                        <SelectItem value="HEAD">HEAD</SelectItem>
                        <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="https://api.example.com/endpoint"
                      className="flex-1 font-mono text-xs"
                    />
                    <Button
                      onClick={sendRequest}
                      disabled={loading || !targetUrl}
                      className="w-full sm:w-auto"
                      size="lg"
                    >
                      {loading ? "..." : "Send"}
                    </Button>
                    {loading && (
                      <Button
                        onClick={cancelRequest}
                        variant="destructive"
                        size="lg"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {/* Request Tabs */}
                <Tabs value={requestTab} onValueChange={(v) => setRequestTab(v as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="params" className="text-xs">Params</TabsTrigger>
                    <TabsTrigger value="headers" className="text-xs">Headers</TabsTrigger>
                    <TabsTrigger value="body" className="text-xs">Body</TabsTrigger>
                    <TabsTrigger value="auth" className="text-xs">Auth</TabsTrigger>
                  </TabsList>

                  {/* Params Tab */}
                  <TabsContent value="params" className="space-y-3">
                    <div className="space-y-2">
                      {queryParams.map((param) => (
                        <div key={param.id} className="flex gap-2 items-center">
                          <input
                            type="checkbox"
                            checked={param.enabled}
                            onChange={() => toggleQueryParam(param.id)}
                            className="w-4 h-4"
                          />
                          <Input
                            placeholder="Key"
                            value={param.key}
                            onChange={(e) => updateQueryParam(param.id, "key", e.target.value)}
                            className="flex-1 text-xs h-8"
                          />
                          <Input
                            placeholder="Value"
                            value={param.value}
                            onChange={(e) => updateQueryParam(param.id, "value", e.target.value)}
                            className="flex-1 text-xs h-8"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQueryParam(param.id)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addQueryParam}
                      className="w-full text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Param
                    </Button>
                  </TabsContent>

                  {/* Headers Tab */}
                  <TabsContent value="headers">
                    <Textarea
                      value={headers}
                      onChange={(e) => setHeaders(e.target.value)}
                      placeholder='{"Content-Type": "application/json"}'
                      className="font-mono text-xs min-h-[200px]"
                    />
                  </TabsContent>

                  {/* Body Tab */}
                  <TabsContent value="body" className="space-y-3">
                    {method !== "GET" && (
                      <>
                        <Select value={bodyFormat} onValueChange={setBodyFormat}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="xml">XML</SelectItem>
                            <SelectItem value="text">Text</SelectItem>
                          </SelectContent>
                        </Select>
                        <Textarea
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          placeholder='{"key": "value"}'
                          className="font-mono text-xs min-h-[200px]"
                        />
                      </>
                    )}
                    {method === "GET" && (
                      <p className="text-xs text-muted-foreground text-center py-8">GET requests don't have a body</p>
                    )}
                  </TabsContent>

                  {/* Auth Tab */}
                  <TabsContent value="auth" className="space-y-3">
                    <Select value={authType} onValueChange={(v) => setAuthType(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Auth</SelectItem>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                        <SelectItem value="basic">Basic Auth</SelectItem>
                      </SelectContent>
                    </Select>
                    {authType !== "none" && (
                      <Input
                        type="password"
                        placeholder={authType === "bearer" ? "Your token" : "username:password"}
                        value={authToken}
                        onChange={(e) => setAuthToken(e.target.value)}
                        className="font-mono text-xs"
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </Card>

              {/* Copy Actions */}
              <div className="flex gap-2 flex-wrap">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Copy className="h-3 w-3 mr-1" /> Copy as <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuLabel className="text-xs">Copy as Code</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={copyCurl} className="text-xs cursor-pointer">
                      cURL
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={copyBash} className="text-xs cursor-pointer">
                      Bash Script
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={copyPython} className="text-xs cursor-pointer">
                      Python
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={copyJavaScript} className="text-xs cursor-pointer">
                      JavaScript
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={copyVBNet} className="text-xs cursor-pointer">
                      VB.NET
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Dialog open={showCodeModal} onOpenChange={setShowCodeModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Code className="h-3 w-3 mr-1" /> View All Code
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Code Snippets</DialogTitle>
                      <DialogDescription>
                        All available code snippets for your request
                      </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="curl" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="curl" className="text-xs">cURL</TabsTrigger>
                        <TabsTrigger value="bash" className="text-xs">Bash</TabsTrigger>
                        <TabsTrigger value="python" className="text-xs">Python</TabsTrigger>
                        <TabsTrigger value="js" className="text-xs">JS</TabsTrigger>
                        <TabsTrigger value="vb" className="text-xs">VB.NET</TabsTrigger>
                      </TabsList>

                      <TabsContent value="curl" className="space-y-2">
                        <pre className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-[300px]">
                          <code>{buildCurlCode()}</code>
                        </pre>
                        <Button size="sm" onClick={copyCurl} className="w-full text-xs">
                          Copy cURL
                        </Button>
                      </TabsContent>

                      <TabsContent value="bash" className="space-y-2">
                        <pre className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-[300px]">
                          <code>{buildBashCode()}</code>
                        </pre>
                        <Button size="sm" onClick={copyBash} className="w-full text-xs">
                          Copy Bash
                        </Button>
                      </TabsContent>

                      <TabsContent value="python" className="space-y-2">
                        <pre className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-[300px]">
                          <code>{buildPythonCode()}</code>
                        </pre>
                        <Button size="sm" onClick={copyPython} className="w-full text-xs">
                          Copy Python
                        </Button>
                      </TabsContent>

                      <TabsContent value="js" className="space-y-2">
                        <pre className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-[300px]">
                          <code>{buildJavaScriptCode()}</code>
                        </pre>
                        <Button size="sm" onClick={copyJavaScript} className="w-full text-xs">
                          Copy JavaScript
                        </Button>
                      </TabsContent>

                      <TabsContent value="vb" className="space-y-2">
                        <pre className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-[300px]">
                          <code>{buildVBNetCode()}</code>
                        </pre>
                        <Button size="sm" onClick={copyVBNet} className="w-full text-xs">
                          Copy VB.NET
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* History Sidebar */}
            <Card className="p-4 max-h-[600px] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">History</h3>
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {history.length > 0 ? (
                <div className="space-y-2">
                  {history.map((req) => (
                    <div
                      key={req.id}
                      className="p-2 rounded border border-border bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                      onClick={() => loadFromHistory(req)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{req.method}</Badge>
                      </div>
                      <p className="font-mono text-xs text-muted-foreground break-all line-clamp-2">
                        {req.url}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(req.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-8">No requests yet</p>
              )}
            </Card>
          </div>

          {/* Response Panel */}
          {response && (
            <Card className="p-4 sm:p-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <FileJson className="h-5 w-5 text-primary" />
                  Response
                </h2>

                {/* Response Metadata */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {response.status !== undefined && (
                    <Badge
                      className={`text-xs ${
                        response.status >= 200 && response.status < 300
                          ? "bg-green-500/20 text-green-700 dark:text-green-400"
                          : response.status >= 400
                          ? "bg-red-500/20 text-red-700 dark:text-red-400"
                          : "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                      }`}
                    >
                      {response.status} {response.statusText}
                    </Badge>
                  )}
                  {response.time !== undefined && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Zap className="h-3 w-3" /> {response.time}ms
                    </Badge>
                  )}
                  {response.size !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {(response.size / 1024).toFixed(2)} KB
                    </Badge>
                  )}
                </div>
              </div>

              {response.error ? (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                  <p className="text-red-700 dark:text-red-400 font-mono text-xs">{response.error}</p>
                </div>
              ) : (
                <>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="raw" className="text-xs">Response Body</TabsTrigger>
                      <TabsTrigger value="headers" className="text-xs">Headers</TabsTrigger>
                      <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                    </TabsList>

                    <TabsContent value="raw" className="space-y-3">
                      <div className="flex gap-2 flex-wrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="text-xs">
                              <Copy className="h-3 w-3 mr-1" /> Copy <ChevronDown className="h-3 w-3 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-40">
                            <DropdownMenuItem onClick={copyResponse} className="text-xs cursor-pointer">
                              Copy Response
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs">Format</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              try {
                                const data = typeof response.data === "string" 
                                  ? response.data 
                                  : JSON.stringify(response.data, null, 2);
                                navigator.clipboard.writeText(data);
                                toast.success("JSON copied");
                              } catch (e) {
                                toast.error("Failed to copy");
                              }
                            }} className="text-xs cursor-pointer">
                              As JSON
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="outline" size="sm" onClick={downloadResponse} className="text-xs">
                          <Download className="h-3 w-3 mr-1" /> Download
                        </Button>
                      </div>
                      <div className="rounded-lg bg-[hsl(var(--code-bg))] border border-border overflow-hidden">
                        <pre className="p-4 overflow-x-auto max-h-[400px] sm:max-h-[500px]">
                          <code className="text-xs font-mono text-foreground">
                            {typeof response.data === "string"
                              ? response.data
                              : JSON.stringify(response.data, null, 2)}
                          </code>
                        </pre>
                      </div>
                    </TabsContent>

                    <TabsContent value="headers" className="space-y-2">
                      {response.headers && Object.keys(response.headers).length > 0 ? (
                        <div className="rounded-lg border border-border overflow-hidden">
                          {Object.entries(response.headers).map(([key, value], idx) => (
                            <div
                              key={key}
                              className={`p-3 flex flex-col sm:flex-row gap-2 border-b ${
                                idx === Object.keys(response.headers!).length - 1 ? "border-0" : "border-border"
                              }`}
                            >
                              <span className="font-mono text-xs font-semibold min-w-[150px] text-primary break-all">
                                {key}
                              </span>
                              <span className="font-mono text-xs text-muted-foreground break-all">
                                {String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No headers</p>
                      )}
                    </TabsContent>

                    <TabsContent value="preview" className="space-y-2">
                      {typeof response.data === "string" && response.data.startsWith("<") ? (
                        <iframe
                          srcDoc={response.data}
                          className="w-full h-[400px] border border-border rounded-lg"
                          title="HTML Preview"
                        />
                      ) : (
                        <div className="rounded-lg bg-muted p-4 text-center text-xs text-muted-foreground">
                          Preview not available for this content type
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </Card>
          )}

          {/* Empty State */}
          {!response && (
            <Card className="p-8 sm:p-12 text-center">
              <FileJson className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Send a request to see the response</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Playground;
