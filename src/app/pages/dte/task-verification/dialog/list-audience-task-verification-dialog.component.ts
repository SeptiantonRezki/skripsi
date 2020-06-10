import { Component, OnInit, ViewEncapsulation, Inject, ViewChild, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatMenuTrigger } from '@angular/material';
import { Page } from 'app/classes/laravel-pagination';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { TaskVerificationService } from 'app/services/dte/task-verification.service';

@Component({
  templateUrl: './list-audience-task-verification-dialog.component.html',
  styleUrls: ['./list-audience-task-verification-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListAudienceTaskVerificationDialogComponent implements OnInit {
  rows: any[];
  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild('activeCell')
  activeCellTemp: TemplateRef<any>;

  constructor(
    public dialogRef: MatDialogRef<ListAudienceTaskVerificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public taskVerificationService: TaskVerificationService
  ) { }

  ngOnInit() {
    this.onLoad = true;
    this.pagination.sort = 'name';
    this.pagination.sort_type = 'asc';
    this.taskVerificationService.getListAudience({
      audience_id: this.data.id,
      template_id: this.data.scheduler_templates_id
    }, this.pagination).subscribe(res => {
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

    this.taskVerificationService.getListAudience({
      audience_id: this.data.id,
      template_id: this.data.scheduler_templates_id
    }, this.pagination).subscribe(res => {
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

    console.log('check pagination', this.pagination);

    this.taskVerificationService.getListAudience({
      audience_id: this.data.id,
      template_id: this.data.scheduler_templates_id
    }, this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  ngOnDestroy() {
    // this.onBoardChanged.unsubscribe();
  }

}
