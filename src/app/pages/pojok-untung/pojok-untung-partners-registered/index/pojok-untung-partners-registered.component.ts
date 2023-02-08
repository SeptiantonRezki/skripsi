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
import { PojokUntungPartnersRegisteredService } from 'app/services/pojok-untung/pojok-untung-partners-registered.service';

@Component({
  selector: 'app-pojok-untung-partners-registered',
  templateUrl: './pojok-untung-partners-registered.component.html',
  styleUrls: ['./pojok-untung-partners-registered.component.scss']
})
export class PojokUntungPartnersRegisteredComponent implements OnInit {
  formFilter: FormGroup;
  loadingIndicator = true;
  loadingSearch = false;
  onDeleting = null;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;
  offsetPagination: any;
  defaultPartnerType: any[] = [{ id: -9, name: "Semua Jenis Partner" }];

  keyUp = new Subject<string>();

  @ViewChild("activeCell")
  @ViewChild('table') table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;
  
  partnerTypeList: any[] = [
    {
      id: -9,
      name: "Semua Jenis Partner"
    },
    {
      id: 1,
      name: "Perjalanan"
    },
    {
      id: 2,
      name: "Asuransi"
    },
    {
      id: 3,
      name: "Keuangan"
    },
    {
      id: 4,
      name: "Logistik"
    }
  ];

  rows: any[] = [
    {
      id: 1,
      name: "Shafwah",
      type: "Perjalanan",
      status: "Aktif"
    },
    {
      id: 2,
      name: "BRI",
      type: "Keuangan",
      status: "Tidak Aktif"
    }
  ];

  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private ls: LanguagesService,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private PojokUntungPartnersRegisteredService: PojokUntungPartnersRegisteredService,
    ) { 
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
    this.rows;
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
      const page = this.dataService.getFromStorage("page_pojok_untung_partners_registered");
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }
    // this.PojokUntungPartnersRegisteredService.get(this.pagination).subscribe(res => {
    //   Page.renderPagination(this.pagination, res.data);
    //   this.rows = res.data ? res.data : [];
      this.loadingIndicator = false;
    // });
  }

  changeRegisteredPartnerType(param?: any){
    // this.dataService.setToStorage("filter_partners_registered", param);
    this.updateFilter('partner_type', param);
  }

  export() {
    console.log('export done!');
  }

}
