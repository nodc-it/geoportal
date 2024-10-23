import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CacheService } from '../services/cache.service';
import { filter, first, map, shareReplay } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  constructor(private readonly cacheService: CacheService) {}

  public readonly store: Record<string, Observable<HttpEvent<any>>> = {};

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Don't cache if it's not a GET request
    if (request.method !== 'GET') {
      return next.handle(request);
    }

    // delete cache if no header is set by service's method
    /*if (!req.headers.get('cache-response')) {
      if (this.cacheService.cacheMap.get(req.urlWithParams)) {
        this.cacheService.cacheMap.delete(req.urlWithParams);
      }

      return next.handle(req);
    }*/

    // Checked if there is cached data for this URI
    const cachedResponse = this.cacheService.getFromCache(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If the request of going through for first time
    // then let the request proceed and cache the response
    const response = next.handle(request).pipe(
      filter(res => res instanceof HttpResponse),
      // The default Observable behavior is creating a new stream for each subscription.
      // With shareReplay we avoid the default behavior and instead we execute the stream only once,
      // then the result of that stream will be replayed to each new subscriber.
      shareReplay(1)
    );
    this.cacheService.addToCache(request, response);
    return response.pipe(
      // Ensures that when the first value is received, the observable will automatically unsubscribe
      // and stop listening for any further emissions.
      first(),
      // Clones the response, to avoid that further modifications to the data will affect the data
      // within the cache.
      map(event => (event as HttpResponse<any>).clone())
    );
  }
}
