import { Component, OnInit } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CoinService } from 'app/services/sku-management/coin.service';
import { DataService } from 'app/services/data.service';
import { RupiahFormaterPipe } from '@fuse/pipes/rupiah-formater';
import * as moment from 'moment';

@Component({
  selector: 'app-detail-trade-program',
  templateUrl: './detail-trade-program.component.html',
  styleUrls: ['./detail-trade-program.component.scss']
})
export class DetailTradeProgramComponent {

  rows: any[];
  id: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  formDetailTrade: FormGroup;
  detailTrade: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private coinService: CoinService,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private rupiahFormater: RupiahFormaterPipe
  ) { 

    this.detailTrade = this.dataService.getFromStorage('coin_detail_trade_program');

    this.activatedRoute.url.subscribe(param => {
      this.id = param[2].path;
    });
  }

  ngOnInit() {
    this.getTradeProgram();

    this.formDetailTrade = this.formBuilder.group({
      name: [''],
      start_date: [''],
      end_date: [''],
      budget: [''],
      coin_expiry_date: ['']
    })

    this.formDetailTrade.setValue({
      name: this.detailTrade.name,
      start_date: moment(this.detailTrade.start_date).format('DD/MM/YYY'),
      end_date: moment(this.detailTrade.end_date).format('DD/MM/YYY'),
      budget: this.rupiahFormater.transform(this.detailTrade.budget),
      coin_expiry_date: this.detailTrade.coin_expiry_date
    })


    this.formDetailTrade.disable();
  }

  getTradeProgram() {
    this.pagination.sort = 'name';
    this.pagination.sort_type = 'asc';
    this.coinService.detailProgram({ trade_program_id: this.id }, this.pagination).subscribe(
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

    this.coinService.detailProgram({ trade_program_id: this.id }, this.pagination).subscribe(res => {
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

    this.coinService.detailProgram({ trade_program_id: this.id }, this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  setToStorage(item, name) {
    this.dataService.setToStorage(name, item);
  }

}
