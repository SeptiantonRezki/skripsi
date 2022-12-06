import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { environment } from 'environments/environment';
declare let ga: any;

@Injectable()
export class GoogleAnalyticsService {

  constructor(router: Router) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        (<any>window).gtag('config', 'UA-125127400-3', {
          'page_title' : event.urlAfterRedirects,
          'page_path': event.urlAfterRedirects
        });
      }
    })
  }

  gtmDataLayer(item: any) {
    console.log('item_DATALAYER', item);
    (<any>window).datalayer = (<any>window).dataLayer || [];
    (<any>window).dataLayer.push({ ...item });
    console.log('DATALAYER',  (<any>window).dataLayer);
  }
}
