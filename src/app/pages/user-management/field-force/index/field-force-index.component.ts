import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DataService } from "../../../../services/data.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-field-force-index",
  templateUrl: "./field-force-index.component.html",
  styleUrls: ["./field-force-index.component.scss"]
})
export class FieldForceIndexComponent {
  rows: any[];
  loadingIndicator = true;
  reorderable = true;
  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;
  constructor(
    private http: HttpClient,
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit() {
    this.http.get("api/admin_user").subscribe((admin_user: any) => {
      this.rows = admin_user;
      this.loadingIndicator = false;
    });
  }

  getActives() {
    return this.rows.map(row => row["active_status"]);
  }

  directEdit(param?: any): void {
    // let navigationExtras: NavigationExtras = {
    //   queryParams: param
    // }
    this.dataService.setToStorage("detail_field_force", param);
    this.router.navigate(["user-management", "field-force", "edit"]);
  }
}
