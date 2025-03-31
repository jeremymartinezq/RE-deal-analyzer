import { captureException } from './errorReporting';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface APIMetric extends PerformanceMetric {
  endpoint: string;
  status: number;
  duration: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private readonly maxBufferSize = 100;
  private readonly flushInterval = 30000; // 30 seconds

  private constructor() {
    // Initialize performance observer for web vitals
    if (typeof PerformanceObserver !== 'undefined') {
      this.observeWebVitals();
    }

    // Start flush interval
    setInterval(() => this.flush(), this.flushInterval);

    // Track route changes
    this.setupRouteTracking();

    // Track user interactions
    this.setupInteractionTracking();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private observeWebVitals(): void {
    // Observe LCP
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        this.trackMetric({
          name: 'LCP',
          value: entry.startTime,
          timestamp: Date.now()
        });
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Observe FID
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        this.trackMetric({
          name: 'FID',
          value: entry.duration,
          timestamp: Date.now()
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Observe CLS
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (entry instanceof LayoutShift) {
          this.trackMetric({
            name: 'CLS',
            value: entry.value,
            timestamp: Date.now()
          });
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private setupRouteTracking(): void {
    if (typeof window !== 'undefined') {
      const originalPushState = window.history.pushState;
      window.history.pushState = function(...args) {
        const result = originalPushState.apply(this, args);
        PerformanceMonitor.getInstance().trackRouteChange(args[2] as string);
        return result;
      };
    }
  }

  private setupInteractionTracking(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        this.trackUserInteraction('click', target.tagName, {
          id: target.id,
          class: target.className
        });
      }, { passive: true });
    }
  }

  public trackMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    if (this.metrics.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  public trackAPICall(endpoint: string, status: number, duration: number): void {
    this.trackMetric({
      name: 'api_call',
      value: duration,
      timestamp: Date.now(),
      tags: {
        endpoint,
        status: status.toString()
      }
    });
  }

  public trackRouteChange(route: string): void {
    this.trackMetric({
      name: 'route_change',
      value: performance.now(),
      timestamp: Date.now(),
      tags: { route }
    });
  }

  public trackUserInteraction(type: string, element: string, details: Record<string, string>): void {
    this.trackMetric({
      name: 'user_interaction',
      value: performance.now(),
      timestamp: Date.now(),
      tags: {
        type,
        element,
        ...details
      }
    });
  }

  private async flush(): Promise<void> {
    if (this.metrics.length === 0) return;

    try {
      const metricsToSend = [...this.metrics];
      this.metrics = [];

      // Send metrics to your analytics service
      await fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metricsToSend)
      });
    } catch (error) {
      captureException(error);
      // Restore metrics if send failed
      this.metrics = [...this.metrics, ...this.metrics];
    }
  }
} 