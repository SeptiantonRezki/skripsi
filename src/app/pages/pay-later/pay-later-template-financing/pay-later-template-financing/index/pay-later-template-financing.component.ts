import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { FormControl } from '@angular/forms';
import {map, startWith, debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import { PayLaterPanelService } from 'app/services/pay-later/pay-later-panel.service';
import { DataService } from 'app/services/data.service';
import { PayLaterTemplateFinancingService } from 'app/services/pay-later/pay-later-template-financing.service';
import { PagesName } from 'app/classes/pages-name';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';

@Component({
  selector: 'app-pay-later-template-financing',
  templateUrl: './pay-later-template-financing.component.html',
  styleUrls: ['./pay-later-template-financing.component.scss']
})
export class PayLaterTemplateFinancingComponent implements OnInit {
  @Input() dataType: string;
  rows: any[];
  selected: any[];
  id: any[];
  statusRow: string;

  loadingIndicator = true;
  loadingSearch = false;
  onDeleting = null;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;
  offsetPagination: any;

  keyUp = new Subject<string>();

  @ViewChild("activeCell")
  @ViewChild('table') table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;

  templateControl = new FormControl();
  options: any[] = [];
  filteredOptions: Observable<any[]>;
  FILTER_BY: string = 'fullname'

  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private router: Router,
    private payLaterPanelServicer: PayLaterPanelService,
    private dataService: DataService,
    private PayLaterTemplateFinancingService: PayLaterTemplateFinancingService,
    private dialogService: DialogService,
  ) {
    this.onLoad = true;
    this.permission = this.roles.getRoles('principal.template_financing');

    this.getOptionText = this.getOptionText.bind(this);
    this.templateControl.valueChanges.debounceTime(400).subscribe(val => {
      let query = (typeof val === 'object') ? val[this.FILTER_BY] : val;
      
      if (query.length >= 3) {
        this.filteredOptions = this._filter(query);
      }
    })

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
    this.getList();
  }

  private _filter(value: any): Observable<any[]> {
    const filterValue = value.toLowerCase();
    this.loadingIndicator = true;
    this.loadingSearch = true;
    return this.PayLaterTemplateFinancingService.get({search: filterValue})
      .pipe(
        map(response => {
          this.loadingIndicator = false;
          this.loadingSearch = false;
          return response.data.filter(option => {
            if (!filterValue) return false;
            return (option[this.FILTER_BY].toLowerCase().includes(filterValue) && filterValue);
          })
        }
        )
      )
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

    this.PayLaterTemplateFinancingService.get({...this.pagination, paylater_company_type_id: this.dataType === "invoice-financing" ? 1 : this.dataType === "retailer-financing" ? 2 : this.dataType === "kur" ? 3 : null}).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  getOptionText(option) {
    return (option && option[this.FILTER_BY]) ? option[this.FILTER_BY] : '';
  }

  getList() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;
    this.PayLaterTemplateFinancingService.get({...this.pagination, paylater_company_type_id: this.dataType === "invoice-financing" ? 1 : this.dataType === "retailer-financing" ? 2 : this.dataType === "kur" ? 3 : null}).subscribe(
      res => {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data ? res.data.data : [];
        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        console.error(err);
        this.onLoad = false;
      }
    );
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

    this.PayLaterTemplateFinancingService.get({...this.pagination, paylater_company_type_id: this.dataType === "invoice-financing" ? 1 : this.dataType === "retailer-financing" ? 2 : this.dataType === "kur" ? 3 : null}).subscribe(res => {
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

    this.PayLaterTemplateFinancingService.get({...this.pagination, paylater_company_type_id: this.dataType === "invoice-financing" ? 1 : this.dataType === "retailer-financing" ? 2 : this.dataType === "kur" ? 3 : null}).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  clear() {
    this.templateControl.setValue('');
  }

  addTemplate() {
    // this.dataService.setToStorage("detail_paylater_template", param);
    this.router.navigate(["paylater", "template_financing", "create"], {queryParams:{type: this.dataType}});
  }

  editTemplate(param?: any): void {
    this.dataService.setToStorage("detail_paylater_template", param);
    this.router.navigate(["paylater", "template_financing", "edit"], {queryParams:{type: this.dataType}});
  }

  deleteTemplate(id) {
    this.id = id;
    let data = {
      titleDialog: "Hapus Template",
      captionDialog: "Apakah anda yakin untuk menghapus template ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.PayLaterTemplateFinancingService.delete({id: this.id}).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.getList();

        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
      }
    },
    err => {
      this.dialogService.openSnackBar({ message: err.error.message });
    });
  }

}
