import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { AudienceService } from '../../../../../services/dte/audience.service';
import { DataService } from '../../../../../services/data.service';
import { PagesName } from 'app/classes/pages-name';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-audience-index-personalize',
  templateUrl: './audience-index-personalize.component.html',
  styleUrls: ['./audience-index-personalize.component.scss']
})
export class AudienceIndexPersonalizeComponent implements OnInit {
  rows: any[];
  selected: any[];
  id: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;

  keyUp = new Subject<string>();

  permission: any;
  roles: PagesName = new PagesName();

  offsetPagination: any;
  pageName = this.translate.instant('dte.audience.audience_personalize');
  titleParam = {entity: this.pageName};

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private audienceService: AudienceService,
    private dataService: DataService,
    private ls: LanguagesService,
    private translate: TranslateService,
  ) {
    this.onLoad = true;
    this.selected = [];

    this.permission = this.roles.getRoles('principal.audience');
    console.log(this.permission);

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
    this.getAudience();
  }

  getAudience() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.audienceService.getPersonalize(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data.data;
        this.onLoad = false;
        this.loadingIndicator = false;

        setTimeout(() => {
          this.addObjectToTable();
        }, 1000);
      },
      err => {
        this.onLoad = false;
      }
    );
  }

  addObjectToTable(){
    document.querySelector("datatable-body").id = "datatable-body";

    let rows = document.querySelectorAll("datatable-row-wrapper");
    for (let index = 0; index < rows.length; index++) {
      rows[index].id = 'data-row';

      let cells = rows[index].querySelectorAll("datatable-body-cell");
      for (let indexCell = 0; indexCell < cells.length; indexCell++) {
        cells[indexCell].id = 'data-cell';
      }
    }
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

    this.audienceService.getPersonalize(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data.data;

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

    this.audienceService.getPersonalize(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data.data;

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

    this.audienceService.getPersonalize(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data.data;

      this.loadingIndicator = false;
    });
  }

  getActives() {
    return this.rows.map(row => row["active_status"]);
  }

  directEdit(param?: any): void {
    this.dataService.setToStorage('detail_audience', param);
    this.router.navigate(['dte', 'audience', 'edit-personalize']);
  }

  directDetail(param?: any): void {
    this.dataService.setToStorage('detail_audience', param);
    this.router.navigate(['dte', 'audience', 'detail-personalize']);
  }

  deleteAudience(id) {
    this.id = id;
    let data = {
      titleDialog: this.translate.instant('global.label.delete_entity', {entity: this.pageName}),
      captionDialog: this.translate.instant('global.messages.delete_confirm', {entity: this.pageName}),
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: [this.translate.instant('global.button.delete'), this.translate.instant('global.button.cancel')]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.audienceService.delete({ audience_id: this.id }).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.getAudience();

        this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text1') });
      }
    });
  }

  classStatus(status, job_status){
    let classes = `text-boxed `;

    if (job_status === 'failed') {
      classes += `mat-red-700-bg`;
    }
    else if (job_status === 'requesting') {
      classes += `mat-yellow-700-bg`;
    }
    else if (job_status === 'running') {
      classes += `mat-orange-700-bg`;
    }
    else if (job_status === 'done' || job_status === 'completed') {
      if (status === 'rejected') {
        classes += `mat-red-700-bg`;
      }
      else if (status === 'pending') {
        classes += `mat-yellow-700-bg`;
      }
      else if (status === 'approved') {
        classes += `mat-green-700-bg`;
      }
    }

    return classes;
  }

  renderStatus(status, real_status, job_status) {
    switch (job_status) {
      case "failed":
        return this.translate.instant('global.label.failed');
      case "requesting":
        return this.translate.instant('global.messages.requesting');
      case "running":
        return this.translate.instant('global.label.processing');
      case "done":
      case "completed":
        switch (status) {
          case "rejected":
            // return real_status;
            return this.translate.instant('dte.approval_coin_adjustment.rejected');
          case "pending":
            // return real_status;
            return this.translate.instant('dte.approval_coin_adjustment.pending');
          case "approved":
            // return real_status;
            return this.translate.instant('dte.approval_coin_adjustment.approved');
          default:
            // return "No Status"
            return this.translate.instant('global.label.no_status');
        }
      default:
        // return "No Status"
        return this.translate.instant('global.label.no_status');
    }
  }
}
