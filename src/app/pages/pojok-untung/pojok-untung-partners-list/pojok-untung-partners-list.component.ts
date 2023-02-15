import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { LanguagesService } from 'app/services/languages/languages.service';
import { Router } from '@angular/router';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import {map, startWith, debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import { DataService } from 'app/services/data.service';
import { PagesName } from 'app/classes/pages-name';
import { DialogService } from 'app/services/dialog.service';
import { PojokUntungPartnersListService } from 'app/services/pojok-untung/pojok-untung-partners-list.service';

@Component({
  selector: 'app-pojok-untung-partners-list',
  templateUrl: './pojok-untung-partners-list.component.html',
  styleUrls: ['./pojok-untung-partners-list.component.scss']
})
export class PojokUntungPartnersListComponent implements OnInit {
  formFilter: FormGroup;
  loadingIndicator = true;
  loadingSearch = false;
  onDeleting = null;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;
  offsetPagination: any;
  partner_type: any = '-9';
  defaultPartnerType: any[] = [{ id: -9, label: "Semua Jenis Partner" }];

  keyUp = new Subject<string>();

  @ViewChild("activeCell")
  @ViewChild('table') table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;
  
  id: any[];
  partnerTypeList: any[];

  rows: any[];

  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private ls: LanguagesService,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private PojokUntungPartnersListService: PojokUntungPartnersListService,
    ) {
      this.onLoad = true;
      this.permission = this.roles.getRoles('principal.pojokuntung_partner');
      const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.updateFilter('search', data);
      });
    
      this.formFilter = this.formBuilder.group({
        partner_type_list: ''
      });
    }

  ngOnInit() {
    this.formFilter.get('partner_type_list').setValue(this.defaultPartnerType[0].id);
    this.getPartnerTypeList();
    this.getList(true);
  }

  getPartnerTypeList() {
    this.PojokUntungPartnersListService.getPartnerType({partner_type: this.partner_type}).subscribe(res => {
      this.partnerTypeList = this.defaultPartnerType.concat(res.data);
    }, err=> { })
  }

  updateFilter(string, value) {
    this.loadingIndicator = true;

    if (string === 'search') {
      this.pagination.search = value;
    }
    if (string === 'partner_type') {
      this.pagination.partner_type = value;
    }

    if (value) {
      this.pagination.page = 1;
      this.offsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("page_pojok_untung_partners_list");
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }
    this.PojokUntungPartnersListService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data : [];
      this.loadingIndicator = false;
    });
  }

  changePartnerType(param?: any){
    // this.dataService.setToStorage("filter_partners_list", param);
    this.updateFilter('partner_type', param);
  }

  getList(resetPage?) {
    this.pagination.page = resetPage ? 1 : this.dataService.getFromStorage("page_pojok_untung_partners_list");
    this.pagination.sort_type = resetPage ? null : this.dataService.getFromStorage("sort_type_pojok_untung_partners_list");
    this.pagination.sort = resetPage ? null : this.dataService.getFromStorage("sort_pojok_untung_partners_list");
    
    if (!this.pagination.partner_type) {
      this.pagination.partner_type = '-9';
    }

    this.dataService.setToStorage("page_pojok_untung_partners_list", this.pagination.page);
    this.dataService.setToStorage("sort_type_pojok_untung_partners_list", this.pagination.sort_type);
    this.dataService.setToStorage("sort_pojok_untung_partners_list", this.pagination.sort);

    this.offsetPagination = this.pagination.page ? (this.pagination.page - 1) : 0;
    this.PojokUntungPartnersListService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data ? res.data : [];
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

    if (!this.pagination.partner_type) {
      this.pagination.partner_type = '-9';
    }

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page_pojok_untung_partners_list", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page_pojok_untung_partners_list");
    }
    this.PojokUntungPartnersListService.get(this.pagination).subscribe(
      res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data : [];
      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    if (!this.pagination.partner_type) {
      this.pagination.partner_type = '-9';
    }

    this.dataService.setToStorage("page_pojok_untung_partners_template", this.pagination.page);
    this.dataService.setToStorage("sort_pojok_untung_partners_template", event.column.prop);
    this.dataService.setToStorage("sort_type_pojok_untung_partners_template", event.newValue);
    this.PojokUntungPartnersListService.get(this.pagination).subscribe(
      res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data : [];
      this.loadingIndicator = false;
    });
  }

  addPartner() {
    this.router.navigate(["pojok-untung", "partners-list", "create"]);
  }

  editPartner(param?: any): void {
    this.dataService.setToStorage("edit_pojok_untung_partners_list", param);
    this.router.navigate(["pojok-untung", "partners-list", "edit", param.id]);
  }

  deletePartner(id) {
    this.id = id;
    let data = {
      titleDialog: "Hapus Partner",
      captionDialog: "Apakah anda yakin untuk menghapus partner ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.PojokUntungPartnersListService.delete({id: this.id}).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.getList(true);

        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
      }
    },
    err => {
      this.dialogService.openSnackBar({ message: err.error.message });
    });
  }

}
