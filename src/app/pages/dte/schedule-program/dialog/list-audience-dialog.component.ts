import { Component, OnInit, ViewEncapsulation, Inject, ViewChild, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatMenuTrigger } from '@angular/material';
import { ScheduleTradeProgramService } from '../../../../services/dte/schedule-trade-program.service';
import { Page } from 'app/classes/laravel-pagination';
import { DatatableComponent } from '@swimlane/ngx-datatable';

@Component({
  templateUrl: './list-audience-dialog.component.html',
  styleUrls: ['./list-audience-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListAudienceDialogComponent {
  rows: any[];
  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;

  constructor(
    public dialogRef: MatDialogRef<ListAudienceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public schedulerService: ScheduleTradeProgramService
  ) { }

  ngOnInit() {
    this.onLoad = true;
    this.schedulerService.getListRetailerSelected({ audience_id: this.data.id }, this.pagination).subscribe(
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
    )
  }

  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.schedulerService.getListRetailerSelected({ audience_id: this.data.id }, this.pagination).subscribe(res => {
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

    console.log("check pagination", this.pagination);

    this.schedulerService.getListRetailerSelected({ audience_id: this.data.id }, this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  ngOnDestroy() {
    // this.onBoardChanged.unsubscribe();
  }

}
