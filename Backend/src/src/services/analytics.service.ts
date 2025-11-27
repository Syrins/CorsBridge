const MAX_ORIGIN_ENTRIES = 5_000;
const PRUNE_INTERVAL_MS = 10 * 60 * 1000;

class AnalyticsTracker {
  private readonly originCounts = new Map<string, number>();

  constructor() {
    setInterval(() => this.prune(), PRUNE_INTERVAL_MS).unref();
  }

  trackOrigin(origin: string): void {
    const normalised = origin.toLowerCase();
    const count = this.originCounts.get(normalised) ?? 0;
    this.originCounts.set(normalised, count + 1);

    if (this.originCounts.size > MAX_ORIGIN_ENTRIES * 1.1) {
      this.prune();
    }
  }

  getTopOrigins(limit = 10): Array<{ origin: string; count: number }> {
    return Array.from(this.originCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([origin, count]) => ({ origin, count }));
  }

  getOriginCount(): number {
    return this.originCounts.size;
  }

  private prune(): void {
    if (this.originCounts.size <= MAX_ORIGIN_ENTRIES) {
      return;
    }

    const entries = Array.from(this.originCounts.entries()).sort((a, b) => b[1] - a[1]);
    this.originCounts.clear();
    for (const [origin, count] of entries.slice(0, MAX_ORIGIN_ENTRIES)) {
      this.originCounts.set(origin, count);
    }
  }
}

export const analyticsTracker = new AnalyticsTracker();
