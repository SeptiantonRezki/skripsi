import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { DataService } from "../../../../../services/data.service";
import { AudienceService } from "../../../../../services/dte/audience.service";
import { DialogService } from "../../../../../services/dialog.service";
import { Router } from "@angular/router";
import { Subject, Observable, ReplaySubject } from "rxjs";
import { NotificationService } from '../../../../../services/notification.service';
import { takeUntil } from 'rxjs/operators';
import { SequencingService } from '../../../../../services/dte/sequencing.service';
import { Page } from 'app/classes/laravel-pagination';

@Component({
  selector: 'app-diaglog-pop-up-notif',
  templateUrl: './diaglog-pop-up-notif.component.html',
  styleUrls: ['./diaglog-pop-up-notif.component.scss']
})
export class DiaglogPopUpNotifComponent implements OnInit {
  form: FormGroup;
  popup: any[];

  private _onDestroy = new Subject<void>();
  public filterPopup: FormControl = new FormControl();
  public filteredPopup: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  pagination: Page = new Page();

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DiaglogPopUpNotifComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private notificationService: NotificationService,
    private sequencingService: SequencingService,
    private dataService: DataService,
  ) { }

  ngOnInit() {
    this.getPopup();
    this.form = this.formBuilder.group({
      notification_id: "",
      time: "",
    });

    this.filterPopup.valueChanges.debounceTime(1000)
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringPopup();
      });

    if (this.data !== null) {
      this.form.patchValue({
        notification_id: this.data.data.attribute.notification_id,
        time: this.data.data.attribute.time,
      });
    }
  }

  filteringPopup() {
    if (!this.popup) {
      return;
    }
    // get the search keyword
    let search = this.filterPopup.value;

    this.pagination.search = search;
    this.sequencingService.getPopup(this.pagination).subscribe(
      (res) => {
        this.popup = res.data;
        this.filteredPopup.next(this.popup.slice());
      },
      (err) => {
        console.log("err ", err);
      }
    );

    // filter the banks
    this.filteredPopup.next(
      this.popup.filter(item => item.title.toLowerCase().indexOf(search) > -1)
    );
  }

  getPopup() {
    this.sequencingService.getPopup().subscribe(
      (res) => {
        this.popup = res.data;
        this.filteredPopup.next(this.popup.slice());
      },
      (err) => {
        console.log("err ", err);
      }
    );
  }

  submit(form: any) {
    const returnObject = {
      id: this.data.id,
      component_id: this.data.data.component_id,
      task_sequencing_management_id: this.data.data.task_sequencing_management_id,
      task_template_id: this.data.data.task_template_id,
      name: 'Pop Up Notification',
      type: 'pop-up-notification',
      attribute: form.value,
      next_step_component: this.data.data.next_step_component,
      next_step_component_yes: this.data.data.next_step_component_yes,
      next_step_component_no: this.data.data.next_step_component_no,
      decision_type: this.data.data.decision_type,
    }
    this.dialogRef.close(returnObject);
  }

}
