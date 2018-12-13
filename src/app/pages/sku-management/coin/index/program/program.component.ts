import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CoinService } from 'app/services/sku-management/coin.service';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';

@Component({
  selector: 'data-trade-program',
  templateUrl: './program.component.html',
  styleUrls: ['./program.component.scss']
})
export class ProgramComponent {

  rowsTP: any[];
  selected: any[];
  id: any[];

  retailer_id: any;
  type: any;
  selectedTab: any;

  loadingIndicatorTP = true;
  reorderableTP = true;
  showLoadingBar: Boolean;
  paginationTP: Page = new Page();
  onLoadTP: boolean;

  keyUpTP = new Subject<string>();

  @ViewChild("activeCell")
  @ViewChild(DatatableComponent)
  table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;

  constructor(
    private dialogService: DialogService,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private coinService: CoinService
  ) { 
    this.onLoadTP = true;

    const selectedTab = this.dataService.getFromStorage('setSelectedTabCoin');
    if (selectedTab) {
      this.selectedTab = selectedTab;
    } else {
      this.selectedTab = 0;
    }

    this.keyUpTP.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.updateFilterTP(data);
      });
  }

  ngOnInit() {
    this.getTrade();
  }

  getTrade() {
    // this.paginationTP.sort = 'name';
    // this.paginationTP.sort_type = 'asc';

    this.showLoadingBar = true;
    this.coinService.getProgram(this.paginationTP).subscribe(
      res => {
        Page.renderPagination(this.paginationTP, res);
        this.rowsTP = res.data;

        setTimeout(() => {
          this.onLoadTP = false;
          this.loadingIndicatorTP = false;
          this.showLoadingBar = false;
        }, 80);
      },
      err => {
        console.error(err);
        this.onLoadTP = false;
        this.showLoadingBar = false;
      }
    );
  }

  setPageTP(pageInfo) {
    this.loadingIndicatorTP = true;
    this.paginationTP.page = pageInfo.offset + 1;

    this.coinService.getProgram(this.paginationTP).subscribe(res => {
      Page.renderPagination(this.paginationTP, res);
      this.rowsTP = res.data;
      this.loadingIndicatorTP = false;
    });
  }

  onSortTP(event) {
    this.paginationTP.sort = event.column.prop;
    this.paginationTP.sort_type = event.newValue;
    this.paginationTP.page = 1;
    this.loadingIndicatorTP = true;

    console.log("check pagination", this.paginationTP);

    this.coinService.getProgram(this.paginationTP).subscribe(
      res => {
        Page.renderPagination(this.paginationTP, res);
        this.rowsTP = res.data;
        this.loadingIndicatorTP = false;
      },
      err => {
        this.loadingIndicatorTP = false;
      }
    );
  }

  updateFilterTP(string) {
    this.loadingIndicatorTP = true;
    this.table.offset = 0;
    this.paginationTP.search = string;
    this.paginationTP.page = 1;

    this.coinService.getProgram(this.paginationTP).subscribe(res => {
      Page.renderPagination(this.paginationTP, res);
      this.rowsTP = res.data;
      this.loadingIndicatorTP = false;
    });
  }

  flush(type, item) {
    this.type = type;
    this.retailer_id = item.id;
    let data = {
      titleDialog: "Flush Coin",
      captionDialog: "Anda akan menghapus semua coin di "+ item.name +". Coin yang terhapus tidak akan bisa dikembalikan.",
      confirmCallback: this.confirmFlush.bind(this),
      buttonText: ["Ok", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmFlush() {
    let body = {
      type: this.type
    }

    if (this.type === 'retailer') 
      body['retailer_id'] = this.retailer_id;
    else 
      body['trade_program_id'] = this.retailer_id;

    this.coinService.flush(body).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: `Flush coin ${this.type === 'retailer' ? 'Retailer' : 'Trade Program'} berhasil` });

        this.getTrade();
      },
      err => {
        // this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

  setToStorage(item, name) {
    this.dataService.setToStorage(name, item);
  }

}
