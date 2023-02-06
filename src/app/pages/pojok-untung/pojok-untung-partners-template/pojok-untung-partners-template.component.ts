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
import { PojokUntungPartnersTemplateService } from 'app/services/pojok-untung/pojok-untung-partners-template.service';

@Component({
  selector: 'app-pojok-untung-partners-template',
  templateUrl: './pojok-untung-partners-template.component.html',
  styleUrls: ['./pojok-untung-partners-template.component.scss']
})
export class PojokUntungPartnersTemplateComponent implements OnInit {
  formFilter: FormGroup;
  loadingIndicator = true;
  loadingSearch = false;
  onDeleting = null;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;
  offsetPagination: any;
  defaultPartner: any[] = [{ id: '', name: "Semua Partner" }];

  keyUp = new Subject<string>();

  @ViewChild("activeCell")
  @ViewChild('table') table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;

  // partnerList: any[];
  partnerList: any[] = [
    {
      id: '',
      name: "Semua Partner"
    },
    {
      id: 1,
      name: "Shafwah"
    },
    {
      id: 2,
      name: "BRI"
    },
    {
      id: 3,
      name: "BNI"
    },
    {
      id: 4,
      name: "Pegadaian"
    },
    {
      id: 5,
      name: "BPJS Ketenagakerjaan"
    },
    {
      id: 6,
      name: "Anter Aja"
    },
  ];
  id: any[];
  rows: any[];
  // rows: any[] = [
  //   {
  //     id: 1,
  //     name: "Pembukaan Rekening",
  //     alias: "Buka Rekening",
  //     partner_name: "BRI",
  //     type: "Keuangan"
  //   },
  //   {
  //     id: 2,
  //     name: "Pengaktifan QRIS",
  //     alias: "Aktifkan QRIS Statis",
  //     partner_name: "BRI",
  //     type: "Keuangan"
  //   },
  //   {
  //     id: 3,
  //     name: "Pendaftaran BPJSTK",
  //     alias: "Daftra BPJSTK",
  //     partner_name: "BPJS",
  //     type: "Asuransi"
  //   }
  // ];

  // templateControl = new FormControl();
  // options: any[] = [];
  // filteredOptions: Observable<any[]>;
  // FILTER_BY: string = 'fullname'

  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private ls: LanguagesService,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private PojokUntungPartnersTemplateService: PojokUntungPartnersTemplateService,
    private dialogService: DialogService,
    ) {
      this.onLoad = true;
      // this.permission = this.roles.getRoles('principal.pojok_untung');

      // this.getOptionText = this.getOptionText.bind(this);
      // this.templateControl.valueChanges.debounceTime(400).subscribe(val => {
      //   let query = (typeof val === 'object') ? val[this.FILTER_BY] : val;
        
      //   if (query.length >= 3) {
      //     this.filteredOptions = this._filter(query);
      //   }
      // })

    const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.updateFilter('search', data);
      });
    
      this.formFilter = this.formBuilder.group({
        partner_list: ''
      });

    }

  ngOnInit() {
    this.formFilter.get('partner_list').setValue(this.defaultPartner[0].id);
    // this.rows;
    this.getList(true);
  }

  // private _filter(value: any): Observable<any[]> {
  //   const filterValue = value.toLowerCase();
  //   this.loadingIndicator = true;
  //   this.loadingSearch = true;
  //   return this.PojokUntungPartnersTemplateService.get({search: filterValue})
  //     .pipe(
  //       map(response => {
  //         this.loadingIndicator = false;
  //         this.loadingSearch = false;
  //         return response.data.filter(option => {
  //           if (!filterValue) return false;
  //           return (option[this.FILTER_BY].toLowerCase().includes(filterValue) && filterValue);
  //         })
  //       }
  //       )
  //     )
  // }

  // getOptionText(option) {
  //   return (option && option[this.FILTER_BY]) ? option[this.FILTER_BY] : '';
  // }

  // clear() {
  //   this.templateControl.setValue('');
  // }

  updateFilter(string, value) {
    this.loadingIndicator = true;

    if (string === 'search') {
      this.pagination.search = value;
    }
    if (string === 'partner_id') {
      this.pagination.partner_id = value;
    }

    if (value) {
      this.pagination.page = 1;
      this.offsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("page_pojok_untung");
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }
    this.PojokUntungPartnersTemplateService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data : [];
      this.loadingIndicator = false;
    });
  }

  changePartner(param?: any){
    // this.dataService.setToStorage("filter_partner", param);
    this.updateFilter('partner_id', param);
  }

  getList(resetPage?) {
    this.pagination.page = resetPage ? 1 : this.dataService.getFromStorage("page_pojok_untung_partners_template");
    this.pagination.sort_type = resetPage ? null : this.dataService.getFromStorage("sort_type_pojok_untung_partners_template");
    this.pagination.sort = resetPage ? null : this.dataService.getFromStorage("sort_pojok_untung_partners_template");

    this.dataService.setToStorage("page_pojok_untung_partners_template", this.pagination.page);
    this.dataService.setToStorage("sort_type_pojok_untung_partners_template", this.pagination.sort_type);
    this.dataService.setToStorage("sort_pojok_untung_partners_template", this.pagination.sort);

    this.offsetPagination = this.pagination.page ? (this.pagination.page - 1) : 0;
    this.PojokUntungPartnersTemplateService.get(this.pagination).subscribe(
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

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page_pojok_untung_partners_template", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page_pojok_untung_partners_template");
    }
    this.PojokUntungPartnersTemplateService.get(this.pagination).subscribe(
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

    this.dataService.setToStorage("page_pojok_untung_partners_template", this.pagination.page);
    this.dataService.setToStorage("sort_pojok_untung_partners_template", event.column.prop);
    this.dataService.setToStorage("sort_type_pojok_untung_partners_template", event.newValue);
    this.PojokUntungPartnersTemplateService.get(this.pagination).subscribe(
      res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data : [];
      this.loadingIndicator = false;
    });
  }

  addTemplatePartner() {
    this.router.navigate(["pojok-untung", "partners-template", "create"]);
  }

  editTemplatePartner(param?: any): void {
    this.dataService.setToStorage("edit_pojok_untung_partners_template", param);
    this.router.navigate(["pojok-untung", "partners-template", "edit", param.id]);
  }

}
