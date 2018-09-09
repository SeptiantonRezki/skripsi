import { Component, OnInit } from '@angular/core';
import { DateAdapter } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { ScheduleTradeProgramService } from 'app/services/dte/schedule-trade-program.service';

@Component({
  selector: 'app-schedule-program-edit',
  templateUrl: './schedule-program-edit.component.html',
  styleUrls: ['./schedule-program-edit.component.scss']
})
export class ScheduleProgramEditComponent {
  idScheduler: any;
  dataScheduler: any;
  formSchedule: FormGroup;

  listTradeProgram: Array<any>;
  listTemplate: Array<any>;
  onLoad: Boolean = true;

  constructor(
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
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

}
