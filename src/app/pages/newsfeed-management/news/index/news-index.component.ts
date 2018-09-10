import { Component, OnInit, ViewChild } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { DialogService } from 'app/services/dialog.service';
import { Subject, Observable } from 'rxjs';
import { NewsService } from '../../../../services/newsfeed-management/news.service';
import { DateAdapter } from '@angular/material';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '../../../../../../node_modules/@angular/router';
import { DataService } from '../../../../services/data.service';

@Component({
  selector: 'app-news-index',
  templateUrl: './news-index.component.html',
  styleUrls: ['./news-index.component.scss']
})
export class NewsIndexComponent {

  rows: any[];
  minDate: any;
  id: any;
  listCategory: Array<any>;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  formFilter: FormGroup;
  keyUp = new Subject<string>();

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private newsService: NewsService,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService
  ) {
    this.adapter.setLocale("id");
    this.rows = [];
    this.onLoad = true;

    this.listCategory = this.activatedRoute.snapshot.data['listCategory'].data;

    this.keyUp.debounceTime(500)
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(res => {
        this.updateFilter(res);
      });
  }

  ngOnInit() {
    this.getListNews();

    this.formFilter = this.formBuilder.group({
      category_id: "all",
      start_date: "",
      end_date: ""
    });
  }

  getListNews() {
    this.newsService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
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
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.newsService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.pagination.filter = this.formFilter.get('category_id').value;
    this.pagination.start_date = this.convertDate(this.formFilter.get('start_date').value);
    this.pagination.end_date = this.convertDate(this.formFilter.get('end_date').value);
    this.loadingIndicator = true;

    console.log("check pagination", this.pagination);

    this.newsService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.table.offset = 0;
    this.pagination.search = string;
    this.pagination.page = 1;
    this.pagination.filter = this.formFilter.get('category_id').value;
    this.pagination.start_date = this.convertDate(this.formFilter.get('start_date').value);
    this.pagination.end_date = this.convertDate(this.formFilter.get('end_date').value);

    this.newsService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  setMinDate(param?: any): void {
    this.formFilter.get("end_date").setValue("");
    this.minDate = param;
  }

  deleteStp(id) {
    this.id = id;
    let data = {
      titleDialog: "Hapus Berita",
      captionDialog: "Apakah anda yakin untuk menghapus berita ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.newsService.delete({ schedule_tp_id: this.id }).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.getListNews();

        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
      }
    });
  }

  directDetail(row) {
    this.dataService.setToStorage('detail_news', row);
    this.router.navigate(['newsfeed-management', 'news', 'detail']);
  }

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format("YYYY-MM-DD");
    }

    return "";
  }

}
