import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { commonFormValidator } from "../../../../classes/commonFormValidator";
import { AdminPrincipalService } from "../../../../services/user-management/admin-principal.service";
import { DialogService } from "../../../../services/dialog.service";
import { Router, ActivatedRoute } from "@angular/router";
import { DataService } from "app/services/data.service";
import * as _ from "underscore";
import { SequencingService } from "../../../../services/dte/sequencing.service";
import { Subject, Observable, ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import * as moment from 'moment';
import { Page } from 'app/classes/laravel-pagination';

@Component({
  selector: "app-task-sequencing-create",
  templateUrl: "./task-sequencing-create.component.html",
  styleUrls: ["./task-sequencing-create.component.scss"],
})
export class TaskSequencingCreateComponent implements OnInit {
  minDateTask: any;
  maxDateTask: any;
  submitting: any;
  taskSequenceForm: FormGroup;
  programs: any[];
  audiences: any[];
  maxDate: any;
  minDate: any;
  private _onDestroy = new Subject<void>();
  public filterGTP: FormControl = new FormControl();
  public filteredGTP: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public filterGTA: FormControl = new FormControl();
  public filteredGTA: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  pagination: Page = new Page();

  constructor(
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private sequencingService: SequencingService
  ) {}

  ngOnInit() {
    this.getTradePrograms();
    this.getTradeAudience();

    this.taskSequenceForm = this.formBuilder.group({
      name: ["", Validators.required],
      trade_creator_id: ["", Validators.required],
      trade_audience_group_id: ["", Validators.required],
      start_date: ["", Validators.required],
      end_date: ["", Validators.required],
      trade_creator_name: ["", Validators.required],
      total_budget: ["", Validators.required],
      endDateTrade: ["", Validators.required],
      trade_audience_group_name: ["", Validators.required],
      current_week: [""],
      total_week: [""],
      status: [""],
    });

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

  selectChange(e: any){
    // console.log(e);
    const theIndex = this.programs.findIndex(x => x.id === e.value);
    console.log(this.programs[theIndex]);
    this.setDate(this.programs[theIndex].end_date);
    this.taskSequenceForm.patchValue({
      trade_creator_name: this.programs[theIndex].name,
      total_budget: this.programs[theIndex].budget,
      endDateTrade: this.programs[theIndex].end_date,
      status: "unpublish",

    });

  }

  setDate(d: any) {
    this.maxDate = moment(d).format('YYYY-MM-DD');
    this.minDate = moment(new Date()).format('YYYY-MM-DD');
  }

  selectChangeAudince(e: any){
    // console.log(e);
    const theIndex = this.audiences.findIndex(x => x.id === e.value);
    console.log(this.audiences[theIndex]);
    this.taskSequenceForm.patchValue({
      trade_audience_group_name: this.audiences[theIndex].name
    });
  }

  formatDate(val: any) {
    var d = new Date(val);
    let date = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + (d.getDate())).slice(-2)].join('-');
    return date;
  }

  submit() {
    this.taskSequenceForm.get('start_date').patchValue(this.formatDate(this.taskSequenceForm.value.start_date));
    this.taskSequenceForm.get('end_date').patchValue(this.formatDate(this.taskSequenceForm.value.end_date));
    this.dataService.setDataSequencing({
      data: this.taskSequenceForm.value,
    });
    console.log(this.taskSequenceForm.value);
  }

  filteringGTP() {
    if (!this.programs) {
      return;
    }
    // get the search keyword
    let search = this.filterGTP.value;

    this.pagination.per_page = 99999999;
    this.pagination.search = search;
    this.sequencingService.getListTradePrograms(this.pagination).subscribe(
      (res) => {
        console.log(res);
        this.programs = res.data.data;
        this.filteredGTP.next(this.programs.slice());
      },
      (err) => {
        console.log("err ", err);
      }
    )
    // filter the banks
    this.filteredGTP.next(
      this.programs.filter(
        (item) => item.name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  getTradePrograms() {
    this.pagination.per_page = 99999999;
    this.sequencingService.getListTradePrograms(this.pagination).subscribe(
      (res) => {
        console.log("trade programs: ", res.data);
        this.programs = res.data.data;
        this.filteredGTP.next(this.programs.slice());
        // this.programs = res.data;
      },
      (err) => {
        console.log("err trade programs: ", err);
      }
    );
  }

  filteringGTA() {
    if (!this.audiences) {
      return;
    }
    // get the search keyword
    let search = this.filterGTA.value;

    this.pagination.per_page = 99999999;
    this.pagination.search = search;
    this.sequencingService.getListTradeAudienceGroup(this.pagination).subscribe(
      (res) => {
        console.log(res);
        this.audiences = res.data.data;
        this.filteredGTA.next(this.audiences.slice());
      },
      (err) => {
        console.log("err ", err);
      }
    )

    // filter the banks
    this.filteredGTA.next(
      this.audiences.filter(
        (item) => item.name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  getTradeAudience() {
    this.pagination.per_page = 99999999;
    this.sequencingService.getListTradeAudienceGroup(this.pagination).subscribe(
      (res) => {
        console.log("Trade Audience: ", res.data);
        this.audiences = res.data.data;
        this.filteredGTA.next(this.audiences.slice());
        // this.audiences = res.data;
      },
      (err) => {
        console.log("Trade Audience: ", err);
      }
    );
  }
}
