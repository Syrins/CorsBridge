import { Activity, Server, Globe, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Status = () => {
  const { t } = useTranslation();
  const regions = [
    { name: t('status.regions.northAmericaEast'), status: "operational", uptime: 99.98, latency: 45 },
    { name: t('status.regions.northAmericaWest'), status: "operational", uptime: 99.97, latency: 38 },
    { name: t('status.regions.europeLondon'), status: "operational", uptime: 99.99, latency: 52 },
    { name: t('status.regions.europeFrankfurt'), status: "operational", uptime: 99.96, latency: 48 },
    { name: t('status.regions.asiaSingapore'), status: "operational", uptime: 99.95, latency: 67 },
    { name: t('status.regions.asiaTokyo'), status: "operational", uptime: 99.98, latency: 71 },
  ];

  const services = [
    { name: t('status.serviceStatus.apiGateway'), status: "operational" },
    { name: t('status.serviceStatus.proxyService'), status: "operational" },
    { name: t('status.serviceStatus.edgeNetwork'), status: "operational" },
    { name: t('status.serviceStatus.analytics'), status: "operational" },
    { name: t('status.serviceStatus.documentation'), status: "operational" },
  ];

  const getStatusColor = (status: string) => {
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

  const getStatusBadge = (status: string) => {
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto safe-px py-10 sm:py-14 lg:py-16">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Activity className="h-8 w-8 sm:h-10 sm:w-10 text-primary flex-shrink-0" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">{t('status.title')}</h1>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">
            {t('status.subtitle')}
          </p>
        </div>

        {/* Overall Status */}
        <Card className="p-6 sm:p-8 mb-8 sm:mb-10 max-w-4xl mx-auto border-2 border-success/20 bg-success/5">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-success/10 mb-3 sm:mb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-success animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">{t('status.operational')}</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('status.allOperational')}
            </p>
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{t('status.lastUpdated')}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Services Status */}
        <div className="max-w-4xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
            <Server className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            <span>{t('status.services')}</span>
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {services.map((service) => (
              <Card key={service.name} className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${getStatusColor(service.status)}`} />
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
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
            <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            <span>{t('status.regionsTitle')}</span>
          </h2>
          <div className="grid gap-4 sm:gap-5 lg:gap-6 md:grid-cols-2">
            {regions.map((region) => (
              <Card key={region.name} className="p-4 sm:p-5 lg:p-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4 gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">{region.name}</h3>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <span>{t('status.latencyMs').replace('{latency}', region.latency.toString())}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(region.status)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">{t('status.uptime30d')}</span>
                    <span className="font-medium">{region.uptime}%</span>
                  </div>
                  <Progress value={region.uptime} className="h-1.5 sm:h-2" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Uptime Chart Placeholder */}
        <div className="max-w-6xl mx-auto mt-10 sm:mt-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t('status.uptimeHistory')}</h2>
          <Card className="p-4 sm:p-6">
            <div className="h-48 sm:h-64 flex items-center justify-center bg-secondary/30 rounded-lg border-2 border-dashed border-border">
              <div className="text-center px-4">
                <Activity className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('status.uptimeChart')}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  {t('status.avgUptime90Days')}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Subscribe to Updates */}
        <div className="max-w-4xl mx-auto mt-10 sm:mt-12">
          <Card className="p-6 sm:p-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center">
              {t('status.stayUpdated')}
            </h2>
            <p className="text-center text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              {t('status.subscribeNotify')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder={t('status.emailPlaceholder')}
                className="flex h-10 sm:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]"
              />
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 sm:h-11 px-6 whitespace-nowrap min-h-[44px]">
                {t('status.subscribeButton')}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Status;
