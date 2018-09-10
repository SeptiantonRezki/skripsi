import { NewsService } from "../services/newsfeed-management/news.service";
import { Resolve } from "../../../node_modules/@angular/router";
import { Observable } from "../../../node_modules/rxjs";
import { Injectable } from "../../../node_modules/@angular/core";

@Injectable()
export class ListCategoryNewsfeedResolver implements Resolve<any> {
  constructor(private newsService: NewsService) {}
  resolve(): Observable<any> {
    return this.newsService.getListCategory();
  }
}