import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Page } from 'app/classes/laravel-pagination';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { MatDialog, MatDialogConfig } from '@angular/material';
// import { ImportKeywordListDialogComponent } from './import-keyword-list-dialog/import-keyword-list-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { LanguagesService } from 'app/services/languages/languages.service';
import { ProductService } from 'app/services/sku-management/product.service';
import { KeywordService } from 'app/services/content-management/keyword.service';
import { PagesName } from 'app/classes/pages-name';
import { ImportKeyword } from './import/personalize/import-keyword.component';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-keyword-management-component',
  templateUrl: './keyword-management-component.html',
  styleUrls: ['./keyword-management-component.scss']
})
export class KeywordManagementComponent implements OnInit {

  @ViewChild('downloadLink') downloadLink: ElementRef;

  public filterCategory: FormControl = new FormControl();
  private _onDestroy = new Subject<void>();
  public filteredCategory: ReplaySubject<any[]> = new ReplaySubject<any[]>(
    1
  );

  rows: any[];
  onLoad: boolean;
  loadingIndicator: boolean;
  permission: any;
  roles: PagesName = new PagesName();
  offsetPagination: any;
  reorderable = true;
  pagination: Page = new Page();
  listCategories = [];
  listUserGroup = [
    {
      value: 'wholesaler',
      name: 'Wholesaler'
    },
    {
      value: 'retailer',
      name: 'Retailer'
    },
    {
      value: 'customer',
      name: 'Customer'
    }
  ];
  importID = '';

  private _data: any = null;
  @Input() set data(data: any) {
    if (data !== null) {
      this._data = data;
    }
  }
  get data(): any { return this._data; }
  @Output() changes = new EventEmitter<any>();

  formKeyword: FormGroup;

  areaFromLogin;
  area_id_list: any = [];
  listLevelArea: any[];
  list: any;
  area: Array<any>;
  lastLevel: any;
  endArea: String;

  dialogRef: any;

  keyUp = new Subject<string>();
  medalKategoriSelected: any;

  constructor(
    private keywordService: KeywordService,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private ls: LanguagesService,
    private productService: ProductService,
  ) {
    this.permission = this.roles.getRoles('principal.keywordmanagement');
    this.rows = [];
    this.onLoad = true;
    this.loadingIndicator = true;

    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
    this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];
    this.listLevelArea = [
      {
        'id': 1,
        'parent_id': null,
        'code': 'SLSNTL      ',
        'name': 'SLSNTL'
      }
    ];

    this.list = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    };

    this.medalKategoriSelected = null;

    const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe((data: any) => {
        this.getKeywordList(data);
      });
  }

  ngOnInit() {
    this.formKeyword = this.formBuilder.group({
      userGroup: [['wholesaler', 'retailer', 'customer']],
      category: ''
    });
    this.getCategories();
    this.getKeywordList();
    this.formKeyword.get('userGroup').valueChanges.subscribe(res => {
      this.dataService.setToStorage('page', '');
      this.dataService.setToStorage('sort', '');
      this.dataService.setToStorage('sort_type', '');
      this.pagination.page = 1;
      this.getKeywordList();
    });
    this.formKeyword.get('category').valueChanges.subscribe(res => {
      this.dataService.setToStorage('page', '');
      this.dataService.setToStorage('sort', '');
      this.dataService.setToStorage('sort_type', '');
      this.pagination.page = 1;
      this.getKeywordList();
    });
    this.filterCategory.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringKeyword();
      });
  }

  filteringKeyword() {
    if (!this.listCategories) {
      return;
    }
    // get the search keyword
    let search = this.filterCategory.value;
    if (!search) {
      this.filteredCategory.next(this.listCategories.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredCategory.next(
      this.listCategories.filter(
        (item) => item.name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  openCreateMedal() {
    this.changes.emit({ selected: 'MEDAL_CREATE' });
  }

  openEditMedal(row: any) {
    this.changes.emit({
      selected: 'MEDAL_EDIT',
      data: row,
    });
  }

  getCategories() {
    this.productService.getListAllCategory(null).subscribe(res => {
      this.listCategories = res.data ? res.data : [];
      this.filteredCategory.next(res.data ? res.data : []);
    });
  }

  setPage(pageInfo: any) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage('page', pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage('page');
    }
    this.getKeywordList();
  }

  onSort(event: any) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage('page', this.pagination.page);
    this.dataService.setToStorage('sort', event.column.prop);
    this.dataService.setToStorage('sort_type', event.newValue);
    this.getKeywordList();
  }

  getKeywordList(searchValue?: any, saveStatus?: boolean) {
    try {
      this.dataService.showLoading(true);
      this.loadingIndicator = true;
      this.pagination.per_page = 25;
      if (searchValue) { this.pagination.search = searchValue; } else { delete this.pagination.search; }

      const userGroup = this.formKeyword.get('userGroup').value;
      const category = this.formKeyword.get('category').value;
      if (userGroup.length > 0) {
        this.pagination['group_pengguna'] = userGroup;
      } else {
        delete this.pagination['group_pengguna'];
      }
      if (category) {
        this.pagination['category'] = category;
      } else {
        delete this.pagination['category'];
      }

      const page = this.dataService.getFromStorage("page");
      const sort_type = this.dataService.getFromStorage("sort_type");
      const sort = this.dataService.getFromStorage("sort");

      this.pagination.page = page;
      this.pagination.sort_type = sort_type;
      this.pagination.sort = sort;

      this.offsetPagination = page ? (page - 1) : 0;

      this.keywordService.getKeywordList(this.pagination).subscribe(res => {
        if (res.status === 'success') {
          Page.renderPagination(this.pagination, res.data);
          this.rows = res.data.data;
          this.loadingIndicator = false;
          this.pagination.sort = 'name';
          this.pagination.sort_type = 'asc';
          this.dataService.showLoading(false);
          if (saveStatus === true) {
            this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
          }
        } else {
          this.dialogService.openSnackBar({ message: 'Terjadi Kesalahan Pencarian' });
          Page.renderPagination(this.pagination, res.data);
          this.rows = [];
          this.loadingIndicator = false;
          this.dataService.showLoading(false);
          if (saveStatus === true) {
            this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
          }
        }
        this.onLoad = false;
      }, err => {
        console.warn(err);
        this.dialogService.openSnackBar({ message: 'Terjadi Kesalahan Pencarian' });
        this.loadingIndicator = false;
        this.dataService.showLoading(false);
        this.onLoad = false;
        if (saveStatus === true) {
          this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
        }
      });
    } catch (ex) {
      console.warn('ex', ex);
    }

  }

  importKeyword() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = "scrumboard-card-dialog";
    dialogConfig.data = { password: "P@ssw0rd" };

    this.dialogRef = this.dialog.open(
      ImportKeyword,
      dialogConfig
    );

    this.dialogRef.afterClosed().subscribe((response) => {
      if (response) {
        this.importID = response.importID;
      }
    });
  }

  async exportKeyword() {
    this.dataService.showLoading(true);
    try {
      const body = {
        group_pengguna: this.formKeyword.get('userGroup').value,
        category: this.formKeyword.get('category').value,
      };
      const response = await this.keywordService.exportKeyword(body).toPromise();
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `Export_Keyword_Management_${new Date().toLocaleString()}.xls`);
      this.dataService.showLoading(false);
    } catch (error) {
      console.log(error);
      this.handleError(error);
      this.dataService.showLoading(false);
    }
  }

  handleError(error) {
    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection;
    }
    console.log(error);
  }

  downLoadFile(data: any, type: string, fileName: string) {
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should
    var newBlob = new Blob([data], { type: type });

    // IE doesn't allow using a blob object directly as link href
    // instead it is necessary to use msSaveOrOpenBlob
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(newBlob);
      return;
    }

    // For other browsers:
    // Create a link pointing to the ObjectURL containing the blob.
    const url = window.URL.createObjectURL(newBlob);

    var link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    // this is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

    setTimeout(function () {
      // For Firefox it is necessary to delay revoking the ObjectURL
      window.URL.revokeObjectURL(url);
      link.remove();
    }, 100);
  }

  submit() {
    this.dataService.showLoading(true);
    const body = {
      _method: 'PUT',
      // group_pengguna: this.formKeyword.get('userGroup').value
    };
    this.keywordService.put(body, {id: this.importID}).subscribe(async res => {
      this.importID = '';
      this.getKeywordList(null, true);
    }, err => {
      console.warn(err);
      this.dialogService.openSnackBar({ message: 'Terjadi Kesalahan Penyimpanan' });
      this.dataService.showLoading(false);
    });
  }

}
