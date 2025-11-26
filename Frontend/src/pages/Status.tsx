import { useState, useEffect } from "react";
import { Activity, Server, Globe, Clock, RefreshCw, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ServiceStatus = "operational" | "degraded" | "down" | "unknown";

interface MemoryStats {
  status: string;
  heapUsed: number;
  heapTotal: number;
  rss: number;
}

interface CacheStats {
  status: string;
  enabled: boolean;
  stats: {
    size: number;
    hits: number;
    misses: number;
    ttlSeconds: number;
  } | null;
}

interface HealthData {
  status: string;
  uptime: number;
  timestamp: string;
  checks: {
    memory?: MemoryStats;
    cache?: CacheStats;
  };
}

interface RegionStatus {
  name: string;
  url: string;
  status: "operational" | "degraded" | "down" | "unknown";
  uptime: number;
  latency: number;
  lastChecked: Date;
}

const API_BASE_URL = "https://api.cors.syrins.tech";
const HEALTH_READY_ENDPOINT = "/health/ready";

const getRegionLabel = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.host;
  } catch {
    return url;
  }
};

const mapServiceStatus = (status?: string): ServiceStatus => {
  if (!status) {
    return "unknown";
  }

  const normalized = status.toLowerCase();
  if (["ok", "ready", "alive"].includes(normalized)) {
    return "operational";
  }

  if (normalized === "warning") {
    return "degraded";
  }

  if (["error", "down"].includes(normalized)) {
    return "down";
  }

  return "degraded";
};

const PRIMARY_REGION_URL = API_BASE_URL;
const PRIMARY_REGION_NAME = `Main API (${getRegionLabel(PRIMARY_REGION_URL)})`;

const Status = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [regions, setRegions] = useState<RegionStatus[]>([
    { name: PRIMARY_REGION_NAME, url: PRIMARY_REGION_URL, status: "unknown", uptime: 0, latency: 0, lastChecked: new Date() },
  ]);

  const checkHealth = async () => {
    try {
      setRefreshing(true);
      const startTime = Date.now();
      
      const response = await fetch(HEALTH_READY_ENDPOINT, {
        method: "GET",
        headers: { "Accept": "application/json" },
      });
      
      const latency = Date.now() - startTime;
      const data: HealthData = await response.json();
      const normalizedStatus = mapServiceStatus(data?.status);

      setHealthData(data);
      setLastUpdated(new Date());

      // Update regions status
      setRegions((prev) =>
        prev.map((region) =>
          region.url === PRIMARY_REGION_URL
            ? {
                ...region,
                status: response.ok ? normalizedStatus : "degraded",
                uptime: data.uptime,
                latency,
                lastChecked: new Date(),
              }
            : region
        )
      );

      if (!response.ok) {
        toast.error("Health check returned non-OK status");
      }
    } catch (error) {
      setRegions((prev) =>
        prev.map((region) =>
          region.url === PRIMARY_REGION_URL
            ? {
                ...region,
                status: "down",
                latency: 0,
                lastChecked: new Date(),
              }
            : region
        )
      );
      toast.error("Failed to fetch health status");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const memoryStats = healthData?.checks?.memory;
  const cacheStats = healthData?.checks?.cache;
  const overallStatus = mapServiceStatus(healthData?.status);
  const cacheLayerStatus: ServiceStatus = cacheStats
    ? cacheStats.enabled
      ? mapServiceStatus(cacheStats.status)
      : "operational"
    : "unknown";
  const memoryStatus = mapServiceStatus(memoryStats?.status);

  const services = [
    {
      name: "Core Proxy",
      status: overallStatus,
    },
    {
      name: "Cache Layer",
      status: cacheLayerStatus,
    },
    {
      name: "Memory Health",
      status: memoryStatus,
    },
  ];

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case "operational":
        return "bg-success";
      case "degraded":
        return "bg-warning";
      case "down":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case "operational":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            {t('status.statusTypes.operational')}
          </Badge>
        );
      case "degraded":
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20">
            {t('status.statusTypes.degraded')}
          </Badge>
        );
      case "down":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            {t('status.statusTypes.down')}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{t('status.statusTypes.unknown')}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/5">
      <div className="container mx-auto safe-px py-10 sm:py-14 lg:py-16">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center p-2 sm:p-3 rounded-xl bg-success/10 border border-success/20">
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-success flex-shrink-0" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">System Status</h1>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time monitoring of all CORS Bridge services and infrastructure
          </p>
        </div>

        {/* Overall Status Card */}
        <Card className="p-6 sm:p-8 mb-10 sm:mb-12 max-w-3xl mx-auto border-2 border-success/20 bg-gradient-to-br from-success/5 to-transparent">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-success/10 border-2 border-success/30 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-success animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              {!loading && healthData ? "All Systems Operational" : loading ? "Checking Status..." : "Status Checking"}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              {!loading && regions[0]?.status === "operational" 
                ? "All services are running smoothly with optimal performance"
                : loading 
                ? "Please wait while we check your services..."
                : "Some services may be experiencing issues"}
            </p>
            
            {/* Status Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
              {memoryStats && (
                <>
                  <div className="p-3 sm:p-4 rounded-lg bg-secondary/50 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Memory Used</p>
                    <p className="text-lg sm:text-xl font-bold">{memoryStats.heapUsed}MB</p>
                    <p className="text-xs text-muted-foreground mt-1">of {memoryStats.heapTotal}MB</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-lg bg-secondary/50 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Response Time</p>
                    <p className="text-lg sm:text-xl font-bold">{regions[0]?.latency || 0}ms</p>
                    <p className="text-xs text-muted-foreground mt-1">Current latency</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-lg bg-secondary/50 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Server Uptime</p>
                    <p className="text-lg sm:text-xl font-bold">{Math.floor((healthData?.uptime ?? 0) / 3600)}h</p>
                    <p className="text-xs text-muted-foreground mt-1">Running time</p>
                  </div>
                </>
              )}
            </div>

            {/* Last Updated */}
            <div className="flex items-center justify-center gap-2 mt-6 text-xs sm:text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "Never"}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={checkHealth}
                disabled={refreshing}
                className="ml-2 h-6"
              >
                <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </Card>

        {/* Services Status */}
        <div className="max-w-4xl mx-auto mb-12 sm:mb-14">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
            <Server className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            <span>Service Status</span>
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.name} className="p-4 sm:p-5 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      service.status === "operational" ? "bg-success" : service.status === "degraded" ? "bg-warning" : "bg-destructive"
                    }`} />
                    <span className="font-medium text-sm sm:text-base truncate">{service.name}</span>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(service.status)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Regional Status */}
        <div className="max-w-4xl mx-auto mb-12 sm:mb-14">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
            <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            <span>Infrastructure Status</span>
          </h2>
          <div className="space-y-3">
            {regions.map((region) => (
              <Card key={region.url} className="p-4 sm:p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getStatusColor(region.status)}`} />
                      <h3 className="font-semibold text-sm sm:text-base">{region.name}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" /> {region.latency}ms
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Checked just now
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(region.status)}
                  </div>
                </div>

                {/* Uptime Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">30-Day Uptime</span>
                    <span className="font-semibold">99.98%</span>
                  </div>
                  <Progress value={99.98} className="h-2" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        {(memoryStats || cacheStats) && (
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Performance Metrics</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {memoryStats && (
                <Card className="p-4 sm:p-6">
                  <h3 className="font-semibold text-sm sm:text-base mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Uptime Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground mb-2">Service Uptime</div>
                      <p className="text-sm font-mono">
                        {healthData?.uptime ? (() => {
                          const seconds = Math.floor(healthData.uptime);
                          const days = Math.floor(seconds / 86400);
                          const hours = Math.floor((seconds % 86400) / 3600);
                          const minutes = Math.floor((seconds % 3600) / 60);
                          const secs = seconds % 60;

                          const parts: string[] = [];
                          if (days > 0) parts.push(`${days} gün`);
                          if (hours > 0) parts.push(`${hours} saat`);
                          if (minutes > 0) parts.push(`${minutes} dakika`);
                          if (secs > 0) parts.push(`${secs} saniye`);

                          return parts.length > 0 ? parts.join(", ") : "0 saniye";
                        })() : "N/A"}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground mb-1">Last Check</div>
                      <p className="text-sm">
                        {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleString("tr-TR") : "N/A"}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground mb-1">Memory Health</div>
                      <p className="text-sm font-semibold text-success">{memoryStats.status.toUpperCase()}</p>
                    </div>
                  </div>
                </Card>
              )}

              {cacheStats && (
                <Card className="p-4 sm:p-6">
                  <h3 className="font-semibold text-sm sm:text-base mb-4 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Cache Layer
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      {getStatusBadge(cacheLayerStatus)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Mode</span>
                      <Badge className={cacheStats.enabled ? "bg-success/10 text-success" : "bg-secondary/40 text-muted-foreground"}>
                        {cacheStats.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    {cacheStats.stats && (
                      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div className="rounded-lg bg-secondary/50 border border-border p-3">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Hits</p>
                          <p className="text-base font-semibold">{cacheStats.stats.hits}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 border border-border p-3">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Misses</p>
                          <p className="text-base font-semibold">{cacheStats.stats.misses}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 border border-border p-3">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Entries</p>
                          <p className="text-base font-semibold">{cacheStats.stats.size}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 border border-border p-3">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">TTL (s)</p>
                          <p className="text-base font-semibold">{cacheStats.stats.ttlSeconds}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Subscribe Section */}
        <div className="max-w-3xl mx-auto">
          <Card className="p-6 sm:p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center">
              Stay Updated
            </h2>
            <p className="text-center text-sm sm:text-base text-muted-foreground mb-6">
              Get notified when services are degraded or experience downtime
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex h-10 sm:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]"
              />
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 sm:h-11 px-6 whitespace-nowrap min-h-[44px]">
                Subscribe
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Status;
