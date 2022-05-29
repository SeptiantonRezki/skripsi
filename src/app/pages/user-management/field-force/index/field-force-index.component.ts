import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DataService } from "../../../../services/data.service";
import { Router } from "@angular/router";
import { Page } from "../../../../classes/laravel-pagination";
import { Subject, Observable } from "rxjs";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { DialogService } from "../../../../services/dialog.service";
import { FieldForceService } from "../../../../services/user-management/field-force.service";
import { FormGroup, FormBuilder, FormControl } from "@angular/forms";
import { PagesName } from "app/classes/pages-name";
import { GeotreeService } from "app/services/geotree.service";
import { GeneralService } from "app/services/general.service";
import { LanguagesService } from "app/services/languages/languages.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-field-force-index",
  templateUrl: "./field-force-index.component.html",
  styleUrls: ["./field-force-index.component.scss"],
})
export class FieldForceIndexComponent {
  onLoad: boolean = true;
  loadingIndicator: boolean = true;
  reorderable: boolean = true;
  pagination: Page = new Page();
  offsetPagination: any;
  rows: any[];

  roles: PagesName = new PagesName();
  permission: any;

  areaFromLogin: any;

  formFilter: FormGroup;

  listVersions: any[] = [];
  listClassification: any[] = [
    { name: "All Classifications", value: "" },
    { name: "WEE", value: "WEE" },
    { name: "REE", value: "REE" },
  ];
  listStatus: any[] = [
    { name: this.ls.locale.global.label.all_status, value: "" },
    { name: this.ls.locale.global.label.active_status, value: "active" },
    { name: this.ls.locale.global.label.inactive_status, value: "inactive" },
  ];

  keyUp = new Subject<string>();

  deletedId: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private fieldForceService: FieldForceService,
    private formBuilder: FormBuilder,
    private geotreeService: GeotreeService,
    private generalService: GeneralService,
    private trans: TranslateService,
    private ls: LanguagesService
  ) {
    this.permission = this.roles.getRoles("principal.fieldforce");
    this.keyUp
      .debounceTime(500)
      .distinctUntilChanged()
      .subscribe((value) => {
        this.formFilter.get("search").setValue(value);
      });
  }

  ngOnInit() {
    this.areaFromLogin = this.dataService.getDecryptedProfile()["areas"];
    this.createFormFilter();
    this.getVersions();
    this.formFilter.valueChanges.subscribe(() => {
      this.resetPagination();
      this.getFieldForce();
    });
  }

  createFormFilter() {
    this.formFilter = this.formBuilder.group({
      area: [""],
      search: [""],
      version: [""],
      status: [""],
      classification: [""],
    });
  }

  getVersions() {
    this.generalService
      .getAppVersions({ type: "field-force" })
      .subscribe((res) => {
        let defaultData = [
          { name: this.ls.locale.global.label.all_version, value: "" },
        ];
        let data = res.map(({ version }) => ({
          name: version,
          value: version,
        }));
        this.listVersions = [...defaultData, ...data];
      });
  }

  setPage(data: any) {
    this.dataService.setToStorage("page", data.offset + 1);
    this.getFieldForce();
  }

  onSort(event: any) {
    this.dataService.setToStorage("page", this.pagination.page || 1);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);
    this.getFieldForce();
  }

  getFieldForce() {
    const filter = this.formFilter.getRawValue();
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? page - 1 : 0;

    this.loadingIndicator = true;
    this.fieldForceService.get({ ...this.pagination, ...filter }).subscribe(
      (res) => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data ? res.data : [];
        this.onLoad = false;
        this.loadingIndicator = false;
      },
      (err) => {
        console.error(err);
        this.onLoad = false;
      }
    );
  }

  resetPagination() {
    this.dataService.setToStorage("page", 1);
    this.dataService.setToStorage("sort", "");
    this.dataService.setToStorage("sort_type", "");
  }

  getAreaIds(obj: any) {
    const [id] = obj;
    const value = id.join(",");
    this.formFilter.get("area").setValue(value);
  }

  delete(id: any): void {
    this.deletedId = id;
    let data = {
      titleDialog:
        this.ls.locale.global.button.delete +
        " " +
        this.ls.locale.global.menu.field_force,
      captionDialog: this.trans.instant("global.messages.delete_confirm", {
        entity: this.ls.locale.global.menu.field_force,
        index: "",
      }),
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: [
        this.ls.locale.global.button.delete,
        this.ls.locale.global.button.cancel,
      ],
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.fieldForceService.delete({ fieldforce_id: this.deletedId }).subscribe(
      (res) => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({
          message: this.ls.locale.global.messages.text1,
        });
        this.resetPagination();
        this.getFieldForce();
      },
      (err) => {
        this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }
}
