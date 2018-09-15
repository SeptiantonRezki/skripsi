import { Component, OnInit } from '@angular/core';
import { DateAdapter, MatDialogConfig, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { ScheduleTradeProgramService } from 'app/services/dte/schedule-trade-program.service';
import { ListAudienceDialogComponent } from '../dialog/list-audience-dialog.component';

@Component({
  selector: 'app-schedule-program-edit',
  templateUrl: './schedule-program-edit.component.html',
  styleUrls: ['./schedule-program-edit.component.scss']
})
export class ScheduleProgramEditComponent {
  idScheduler: any;
  dataScheduler: any;
  formSchedule: FormGroup;
  dialogRef: any;

  listTradeProgram: Array<any>;
  listTemplate: Array<any>;
  onLoad: Boolean = true;

  constructor(
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private scheduleTradeProgramService: ScheduleTradeProgramService
  ) { 
    activatedRoute.url.subscribe(param => {
      this.idScheduler = param[2].path;
    })

    this.listTradeProgram = activatedRoute.snapshot.data['listTradeProgram'].data;
    this.listTemplate = activatedRoute.snapshot.data['listTemplate'].data;
  }

  ngOnInit() {
    this.scheduleTradeProgramService.getDetail(this.idScheduler).subscribe(res => {
      this.dataScheduler = res; 
      this.onLoad = false;
    })
  }

  submit() {
    let body = {
      _method: 'PUT',
      status_scheduler: 'publish'
    }

    this.scheduleTradeProgramService.put(body, {schedule_tp_id: this.idScheduler}).subscribe(
      res => {
        this.dialogService.openSnackBar({ message: 'Status Berhasil diubah' });
        this.router.navigate(['dte', 'schedule-trade-program']);
      },
      err => {
        console.log(err.error.message)
      }
    )
  }

  openListAudience(item) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = item;

    this.dialogRef = this.dialog.open(ListAudienceDialogComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => { })
  }
}
