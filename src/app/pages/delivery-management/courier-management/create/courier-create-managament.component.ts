import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { CourierService } from 'app/services/delivery-management/courier.service';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { take } from 'rxjs/operators';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-courier-create-managament',
  templateUrl: './courier-create-managament.component.html',
  styleUrls: ['./courier-create-managament.component.scss']
})
export class CourierCreateManagamentComponent implements OnInit {
  formCourier: FormGroup;
  formCourierError: any;
  onLoad: boolean;
  loadingIndicator: boolean;
  dayDurationList: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 27, 29, 30];
  timeMask = [/[0-2]/, /\d/, ':', /[0-5]/, /\d/];

  // hourDurationList: any[] = this.dayDurationList.slice(0, 23);
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private courierManagementService: CourierService,
    private _ngZone: NgZone,
    private ls: LanguagesService
  ) {
    this.formCourierError = {
      name: {},
      contact: {},
      email: {}
    }
  }

  ngOnInit() {
    let regex = new RegExp(/[0-9]/g);

    this.formCourier = this.formBuilder.group({
      name: ["", Validators.required],
      contact: ["", [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
      email: ["", Validators.compose([Validators.required, Validators.email])],
      services: this.formBuilder.array([])
    });

    this.formCourier.get('contact').valueChanges.debounceTime(500).subscribe(res => {
      if (res.match(regex)) {
        if (res.substring(0, 1) == '0') {
          let phone = res.substring(1);
          this.formCourier.get('contact').setValue(phone, { emitEvent: false });
        }
      }
    })
  }

  numbersOnlyValidation(event) {
    const inp = String.fromCharCode(event.keyCode);
    /*Allow only numbers*/
    if (!/^\d+$/.test(inp)) {
      event.preventDefault()
    }
  }

  createFormService() {
    let maxReceivedTime = new Date();
    maxReceivedTime.setHours(14, 0, 0, 0);

    return this.formBuilder.group({
      name: ["", Validators.required],
      est_fastest_duration: [1, Validators.required],
      est_fastest_duration_time: ["days"],
      est_longest_duration: [1, Validators.required],
      est_longest_duration_time: ["days"],
      note_duration: [""],
      service_status: ["active"],
      flat_cost: [0, Validators.required],
      max_distance_config: [true],
      max_distance: [20],
      max_received_time: ["1700"],
      max_received_time_config: [true]
    });
  }

  filterDayDuration(serviceIdx, serviceType, dayDurationList) {
    let services = this.formCourier.get("services") as FormArray;
    if (serviceType === 'fastest') {
      return services.at(serviceIdx).get("est_fastest_duration_time").value === "days" ? dayDurationList : dayDurationList.slice(0, 24);
    } else {
      return services.at(serviceIdx).get("est_longest_duration_time").value === "days" ? dayDurationList : dayDurationList.slice(0, 24);
    }
  }

  addNewService() {
    let services = this.formCourier.get('services') as FormArray;
    services.push(this.createFormService());
  }

  deleteService(index) {
    let services = this.formCourier.get('services') as FormArray;
    services.removeAt(index);
  }

  submit() {
    if (this.formCourier.valid) {
      this.dataService.showLoading(true);

      let hasNoValid = [];
      let body = {
        name: this.formCourier.get("name").value,
        phone: '+62' + this.formCourier.get("contact").value,
        email: this.formCourier.get("email").value,
        status: "active",
        services: this.formCourier.get("services").value.map((item, idx) => {
          let time_limit = item.max_received_time;
          if (time_limit && time_limit != "") {
            if (time_limit.length == 1) {
              hasNoValid.push(idx);
            }
            else if (time_limit.length == 2) time_limit += ":00";
            else if (time_limit.length == 3) {
              let first = time_limit.slice(0, 2);
              let second = time_limit.substr(2, 1);
              time_limit = first + ":" + second + "0";
            } else {
              let first = time_limit.slice(0, 2);
              let second = time_limit.substr(2, time_limit.length);
              time_limit = first + ":" + second;
            }
          } else {
            // time_limit = "17:00";
            hasNoValid.push(idx);
          }
          return {
            name: item.name,
            short_duration: item.est_fastest_duration,
            short_duration_type: item.est_fastest_duration_time === "days" ? "day" : "hour",
            long_duration: item.est_longest_duration,
            long_duration_type: item.est_longest_duration_time === "days" ? "day" : "hour",
            description: item.note_duration,
            status: item.service_status,
            cost_flat: item.flat_cost,
            max_distance: item.max_distance_config ? item.max_distance : null,
            time_limit: item.max_received_time_config ? time_limit : null
          }
        })
      }

      if (hasNoValid.length > 0) {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({ message: "Format Waktu Layanan Tidak Valid" }); // TODO
        return;
      }
      console.log('body', body, this.formCourier);

      this.courierManagementService.create(body).subscribe(res => {
        this.dataService.showLoading(false);
        console.log('res', res);
        this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
        this.router.navigate(['delivery', 'courier']);
      }, err => {
        console.log('err create courier', err);
        this.dataService.showLoading(false);
      })
    } else {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" }); // TODO
      commonFormValidator.validateAllFields(this.formCourier);
    }
  }

}
