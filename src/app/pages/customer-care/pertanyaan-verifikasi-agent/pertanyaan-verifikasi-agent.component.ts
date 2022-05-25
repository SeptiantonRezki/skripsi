import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Page } from 'app/classes/laravel-pagination';
import { CustomerCareService } from 'app/services/customer-care.service';
import { DataService } from 'app/services/data.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { Subject, Observable } from 'rxjs';

@Component({
  selector: 'app-pertanyaan-verifikasi-agent',
  templateUrl: './pertanyaan-verifikasi-agent.component.html',
  styleUrls: ['./pertanyaan-verifikasi-agent.component.scss']
})
export class PertanyaanVerifikasiAgentComponent implements OnInit {

  keyUp = new Subject<string>();
  loadingIndicator = true;
  reorderable = true;
  
  pagination: Page = new Page();
  offsetPagination: any;

  rows: any[];
  selected: any[];

  constructor(
    private dataService: DataService,
    private customerCareService: CustomerCareService,
    private router: Router,
    private ls: LanguagesService,
  ) {
    this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(300);
      })
      .subscribe(data => {
        this.updateFilter(data);
      });
  }

  ngOnInit() {
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.pagination.search = string;

    if (string) {
      this.pagination.page = 1;
      this.offsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("customer_care_page");
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
      this.loadingIndicator = false;
      this.pagination.search = '';
    }
    this.customerCareService.getQuestions(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });

  }
  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("customer_care_page", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("customer_care_page");
    }

    this.customerCareService.getQuestions(this.pagination).subscribe(res => {
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

    this.dataService.setToStorage("customer_care_page", this.pagination.page);
    this.dataService.setToStorage("customer_care_sort", event.column.prop);
    this.dataService.setToStorage("customer_care_sort_type", event.newValue);

    this.customerCareService.getQuestions(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
        this.loadingIndicator = false;
      },
      err => {
        this.loadingIndicator = false;
      }
    );
  }
  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
  directDetail(param?: any): void {
    this.dataService.setToStorage('id_retailer', param.id);
    this.dataService.setToStorage('customer_care_verif_detail', param);
    this.router.navigate(['/customer-care', 'pertanyaan-verifikasi-agent', 'detail']);
  }

}
