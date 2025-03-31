interface CacheEntry<T> {
  value: T;
  expiry: number | null;
}

export class Cache {
  private storage: Map<string, CacheEntry<any>>;
  private readonly defaultTTL: number;

  constructor(defaultTTL: number = 300) { // 5 minutes default TTL
    this.storage = new Map();
    this.defaultTTL = defaultTTL;
    
    // Start cleanup interval
    setInterval(() => this.cleanup(), 60000); // Cleanup every minute
  }

  public set<T>(key: string, value: T, ttlSeconds?: number): void {
    const expiry = ttlSeconds 
      ? Date.now() + (ttlSeconds * 1000)
      : this.defaultTTL 
        ? Date.now() + (this.defaultTTL * 1000)
        : null;

    this.storage.set(key, {
      value,
      expiry
    });
  }

  public get<T>(key: string): T | null {
    const entry = this.storage.get(key);
    
    if (!entry) {
      return null;
    }

    if (entry.expiry && entry.expiry < Date.now()) {
      this.storage.delete(key);
      return null;
    }

    return entry.value;
  }

  public has(key: string): boolean {
    const entry = this.storage.get(key);
    
    if (!entry) {
      return false;
    }

    if (entry.expiry && entry.expiry < Date.now()) {
      this.storage.delete(key);
      return false;
    }

    return true;
  }

  public delete(key: string): void {
    this.storage.delete(key);
  }

  public clear(): void {
    this.storage.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.storage.entries()) {
      if (entry.expiry && entry.expiry < now) {
        this.storage.delete(key);
      }
    }
  }

  // Helper method to get cache stats
  public getStats(): { size: number; keys: string[] } {
    return {
      size: this.storage.size,
      keys: Array.from(this.storage.keys())
    };
  }
} 