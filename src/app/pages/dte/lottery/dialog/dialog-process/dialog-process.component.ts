import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { AudienceService } from 'app/services/dte/audience.service';
import { DataService } from 'app/services/data.service';
import { Page } from 'app/classes/laravel-pagination';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject, forkJoin } from 'rxjs';
import { PagesName } from 'app/classes/pages-name';
import { IdbService } from 'app/services/idb.service';

@Component({
  selector: 'app-dialog-process',
  templateUrl: './dialog-process.component.html',
  styleUrls: ['./dialog-process.component.scss']
})
export class DialogProcessComponent implements OnInit {
  uploading: Boolean;
  rows: any[];
  id: any;

  loadingIndicator = false;
  reorderable = true;
  onLoad: boolean;

  keyUp = new Subject<string>();

  permission: any;
  detailData: any;

  constructor(
    public dialogRef: MatDialogRef<DialogProcessComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private audienceService: AudienceService,
    private dataService: DataService,
    private idbService: IdbService,
    @Inject(MAT_DIALOG_DATA) data: any,
  ) {
    this.rows = [];
    this.detailData = data;
    this.dataService.showLoading(false);
  }

  ngOnInit() {
    // TODO: proses kirim data ke APTA
  }
}
