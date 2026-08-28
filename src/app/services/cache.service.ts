import { HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface Cache {
  response: Observable<HttpEvent<any>>;
  time: number;
}

const MAX_CACHE_AGE = 5 * 60 * 1000; // 5 minuti

@Injectable()
export class CacheService {
  cacheMap = new Map<string, Cache>();

  getFromCache(req: HttpRequest<any>): Observable<HttpEvent<any>> | undefined {
    const cached = this.cacheMap.get(req.urlWithParams);

    if (!cached || Date.now() - cached.time > MAX_CACHE_AGE) return undefined;
    return cached.response;
  }

  addToCache(req: HttpRequest<any>, response: Observable<HttpEvent<any>>): void {
    this.cacheMap.set(req.url, { response, time: Date.now() });
  }
}
