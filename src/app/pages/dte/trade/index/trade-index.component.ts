import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { TradeProgramService } from 'app/services/dte/trade-program.service';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { Endpoint } from 'app/classes/endpoint';

@Component({
  selector: 'app-trade-index',
  templateUrl: './trade-index.component.html',
  styleUrls: ['./trade-index.component.scss']
})
export class TradeIndexComponent {

  rows: any[];
  selected: any[];
  id: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  endPoint: Endpoint = new Endpoint();
  onLoad: boolean;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;

  keyUp = new Subject<string>();
  
  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private tradeProgramService: TradeProgramService,
  ) {
    this.onLoad = true;
    this.selected = [];

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
    this.getTp();
  }

  getTp() {
    this.tradeProgramService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data.map(item => {
          return {
            ...item,
            image: item['image'] ? `${this.endPoint.getEndPoint()}/storage/${item.image}` : null
          }
        });
        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        this.onLoad = false;
      }
    );
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);

    console.log("Select Event", selected, this.selected);
  }

  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.tradeProgramService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data.map(item => {
        return {
          ...item,
          image: item['image'] ? `${this.endPoint.getEndPoint()}/storage/${item.image}` : null
        }
      });

      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    console.log(this.pagination)

    this.tradeProgramService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data.map(item => {
        return {
          ...item,
          image: item['image'] ? `${this.endPoint.getEndPoint()}/storage/${item.image}` : null
        }
      });

      this.loadingIndicator = false;
    });
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.table.offset = 0;
    this.pagination.search = string;
    this.pagination.page = 1;

    this.tradeProgramService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data.map(item => {
        return {
          ...item,
          image: item['image'] ? `${this.endPoint.getEndPoint()}/storage/${item.image}` : null
        }
      });
      
      this.loadingIndicator = false;
    });
  }

  getActives() {
    return this.rows.map(row => row["active_status"]);
  }

  directEdit(param?: any): void {
    this.dataService.setToStorage('detail_trade_program', param);
    this.router.navigate(['dte', 'trade-program', 'edit']);
  }

  deleteTp(id) {
    this.id = id;
    let data = {
      titleDialog: "Hapus Trade Program",
      captionDialog: "Apakah anda yakin untuk menghapus trade program ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.tradeProgramService.delete({ trade_program_id: this.id }).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.getTp();

        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
      }
    });
  }

}
