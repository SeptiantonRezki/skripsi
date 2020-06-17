import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { commonFormValidator } from "../../../../classes/commonFormValidator";
import { AdminPrincipalService } from "../../../../services/user-management/admin-principal.service";
import { DialogService } from "../../../../services/dialog.service";
import { Router, ActivatedRoute } from "@angular/router";
import { DataService } from "app/services/data.service";
import * as _ from 'underscore';
import { SequencingService } from '../../../../services/dte/sequencing.service';
import { Subject, Observable, ReplaySubject } from "rxjs";
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-task-sequencing-edit',
  templateUrl: './task-sequencing-edit.component.html',
  styleUrls: ['./task-sequencing-edit.component.scss']
})
export class TaskSequencingEditComponent implements OnInit {

  taskSequenceForm: FormGroup;
  programs: any[];
  audiences: any[];
  private _onDestroy = new Subject<void>();
  public filterGTP: FormControl = new FormControl();
  public filteredGTP: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public filterGTA: FormControl = new FormControl();
  public filteredGTA: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  constructor(
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private sequencingService: SequencingService
  ) { }

  ngOnInit() {
    this.getTradePrograms();
    this.getTradeAudience();

    this.taskSequenceForm = this.formBuilder.group({
      nama: ["", Validators.required],
      trade_program: ["", Validators.required],
      group_audience: ["", Validators.required],
      startDate: ["", Validators.required],
      endDate: ["", Validators.required],
    })

    this.filterGTP.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringGTP();
      });

      this.filterGTA.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringGTA();
      });
  }

  submit(){
    console.log(JSON.stringify(this.taskSequenceForm.value));
  }

  filteringGTP() {
    if (!this.programs) {
      return;
    }
    // get the search keyword
    let search = this.filterGTP.value;
    if (!search) {
      this.filteredGTP.next(this.programs.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredGTP.next(
      this.programs.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  getTradePrograms() {
    this.sequencingService.getListTradePrograms().subscribe(
      (res) => {
        // console.log("res trade programs", res);
        this.programs = res.data;
        this.filteredGTP.next(this.programs.slice());
        // this.programs = res.data;
      },
      (err) => {
        console.log("err trade programs", err);
      }
    );
  }

  filteringGTA() {
    if (!this.audiences) {
      return;
    }
    // get the search keyword
    let search = this.filterGTA.value;
    if (!search) {
      this.filteredGTA.next(this.audiences.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredGTA.next(
      this.audiences.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  getTradeAudience() {
    this.sequencingService.getListTradeAudienceGroup().subscribe(
      (res) => {
        // console.log("res trade programs", res);
        this.audiences = res.data;
        this.filteredGTA.next(this.audiences.slice());
        // this.audiences = res.data;
      },
      (err) => {
        console.log("err trade programs", err);
      }
    );
  }

}
