import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { Endpoint } from '../../../../classes/endpoint';
import { PagesName } from 'app/classes/pages-name';
import { PrincipalPartnershipService } from 'app/services/principal-partnership/principal-partnership.service';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-partnership-index',
  templateUrl: './partnership-index.component.html',
  styleUrls: ['./partnership-index.component.scss']
})
export class PartnershipIndexComponent implements OnInit {
  rows: any[];
  selected: any[];
  id: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  endPoint: Endpoint = new Endpoint();
  onLoad: boolean;
  offsetPagination: any;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;

  keyUp = new Subject<string>();

  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private principalPartnershipService: PrincipalPartnershipService,
    private ls: LanguagesService
  ) {
    this.onLoad = true;
    this.selected = [];

    this.permission = this.roles.getRoles('principal.principalpartnership');

    const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.updateFilter(data);
      });
  }

  ngOnInit() {
    this.getPrincipalPartnership();
  }

  getPrincipalPartnership() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.principalPartnershipService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data ? res.data.data : [];
        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        this.onLoad = false;
      }
    );
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);

    console.log("Select Event", selected, this.selected);
  }

  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page");
    }

    this.principalPartnershipService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];

      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.principalPartnershipService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];

      this.loadingIndicator = false;
    });
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.pagination.search = string;

    if (string) {
      this.pagination.page = 1;
      this.offsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("page");
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }

    this.principalPartnershipService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];

      this.loadingIndicator = false;
    });
  }


  getActives() {
    return this.rows.map(row => row["active_status"]);
  }

  directEdit(param?: any): void {
    this.dataService.setToStorage('detail_principal_partnership', param);
    this.router.navigate(['user-management', 'principal-partnership', 'edit']);
  }

  directDetail(param?: any): void {
    this.dataService.setToStorage('detail_principal_partnership', param);
    this.router.navigate(['user-management', 'principal-partnership', 'detail']);
  }

  duplicate(param?: any): void {
    this.dataService.setToStorage('duplicate_principle_partnership', param);
    this.router.navigate(['user-management', 'principal-partnership', 'create']);
  }

  deletePartnership(id) {
    this.id = id;
    let data = {
      titleDialog: this.ls.locale.principal_partnership.delete,
      captionDialog: this.ls.locale.principal_partnership.delete_confirm,
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: [this.ls.locale.global.button.delete, this.ls.locale.global.button.cancel]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.principalPartnershipService.delete({ principal_partnership_id: this.id }).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.getPrincipalPartnership();

        this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text1 });
      }
    });
  }
}
