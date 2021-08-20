import { Component, Input } from "@angular/core";
import {
  ActivatedRoute,
  Router,
  NavigationEnd,
  RouterLinkActive
} from "@angular/router";
import { Observable } from "rxjs/Rx";

@Component({
  selector: "page-content-header",
  templateUrl: "./page-content-header.component.html",
  styleUrls: ["./page-content-header.component.scss"]
})
export class PageContentComponent {
  @Input()
  contentTitle: string;
  breadcrumbs: Array<any> = [];
  newContentTitle: string;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.data.subscribe(data => {
      this.breadcrumbs = data.breadcrumbs;
      // console.log(this.breadcrumbs);
    });
  }

  ngOnInit() {
    this.newContentTitle = this.contentTitle.toLowerCase().split(" ").join("_");
  }
}
