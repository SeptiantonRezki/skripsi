import { Component, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject, Observable } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PagesName } from 'app/classes/pages-name';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { AudienceTradeProgramService } from 'app/services/dte-automation/audience-trade-program.service';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-audience-trade-program-index',
  templateUrl: './audience-trade-program-index.component.html',
  styleUrls: ['./audience-trade-program-index.component.scss']
})
export class AudienceTradeProgramIndexComponent implements OnInit {
  rows: any[];
  selected: any[];
  id: any;
  btnNonTsm :any;
  btnTsm :any;
  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  // endPoint: Endpoint = new Endpoint();
  onLoad: boolean;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;

  keyUp = new Subject<string>();
  dateNow: any;

  permission: any;
  roles: PagesName = new PagesName();

  offsetPagination: any;
  @ViewChild('downloadLink') downloadLink: ElementRef;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private audienceTradeProgramService: AudienceTradeProgramService,
    private formBuilder: FormBuilder,
    private ls: LanguagesService,
  ) {
    this.onLoad = true;
    this.permission = this.roles.getRoles('principal.dteautomation');
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
    this.getDTEAutomationNonTsm();
    this.btnNonTsm = true;
  }
  tabClick(tab) {
    if (tab.index === 1) {
      this.btnNonTsm = false;
      this.btnTsm = true;
    } else {
      this.btnNonTsm = true;
      this.btnTsm = false;
    }
    console.log(tab.index);
  }
  getDTEAutomationNonTsm() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;
    this.pagination['classification']= '0';
    this.offsetPagination = page ? (page - 1) : 0;
    this.audienceTradeProgramService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.onLoad = false;
      this.loadingIndicator = false;
    }, err => {
      console.log('err', err);
      this.onLoad = false;
    });
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

    this.audienceTradeProgramService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;

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

    this.audienceTradeProgramService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;

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

    this.audienceTradeProgramService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;

      this.loadingIndicator = false;
    });
  }

  directEdit(param?: any): void {
    this.dataService.setToStorage('detail_dte_automation', param);
    this.router.navigate(['dte', 'automation', 'edit']);
  }

  directDetail(param?: any): void {
    this.dataService.setToStorage('detail_dte_automation', param);
    this.router.navigate(['dte', 'automation', 'detail']);
  }

  deleteAutomation(id) {
    this.id = id;
    let data = {
      titleDialog: "Hapus DTE Automation",
      captionDialog: "Apakah anda yakin untuk menghapus dte automation ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.audienceTradeProgramService.delete({ automation_id: this.id }).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.getDTEAutomationNonTsm();

        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
      }
    });
  }

  export(item) {
    this.dataService.showLoading(true);
    console.log('Wow You Exported Me!!!', item);
    this.audienceTradeProgramService.export({ id: item.id, type: item.type }).subscribe(res => {
      if (res.data && res.status) {
        setTimeout(() => {
          this.downloadLink.nativeElement.href = res.data;
          this.downloadLink.nativeElement.click();
          this.dataService.showLoading(false);
        }, 1000);
      }
    }, err => {
      console.log('ress', err);
      this.dataService.showLoading(false);
    })
  }

}
