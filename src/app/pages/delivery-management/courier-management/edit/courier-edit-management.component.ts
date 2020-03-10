import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { take } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { CourierService } from 'app/services/delivery-management/courier.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';

@Component({
  selector: 'app-courier-edit-management',
  templateUrl: './courier-edit-management.component.html',
  styleUrls: ['./courier-edit-management.component.scss']
})
export class CourierEditManagementComponent implements OnInit {
  courierID: any = null;
  formCourier: FormGroup;
  formCourierError: any;
  onLoad: boolean;
  loadingIndicator: boolean;
  dayDurationList: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 27, 29, 30];
  timeMask = [/[0-2]/, /\d/, ':', /[0-5]/, /\d/];
  isDetail: Boolean;
  detailCourier: any;
  panelOpenState = false;

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
    private activatedRoute: ActivatedRoute
  ) {
    activatedRoute.url.subscribe(params => {
      this.courierID = params[2].path;
      this.isDetail = params[1].path === 'detail' ? true : false;
    });
    this.formCourierError = {
      name: {},
      contact: {},
      email: {}
    }
  }

  ngOnInit() {
    this.formCourier = this.formBuilder.group({
      name: ["", Validators.required],
      contact: ["", [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
      email: ["", Validators.compose([Validators.required, Validators.email])],
      services: this.formBuilder.array([])
    });

    this.getCourierDetail();
  }

  getCourierDetail() {
    this.dataService.showLoading(true);
    this.courierManagementService.show({ courier_id: this.courierID }).subscribe(res => {
      this.detailCourier = res.data;

      this.formCourier.get("name").setValue(res.data.name);
      this.formCourier.get("contact").setValue(res.data.phone);
      this.formCourier.get("email").setValue(res.data.email);

      let services = this.formCourier.get("services") as FormArray;
      this.detailCourier.services.map((item, idx) => {
        services.push(this.formBuilder.group({
          name: item.name,
          est_fastest_duration: item.short_duration,
          est_fastest_duration_time: item.short_duration_type === "day" ? "days" : "hours",
          est_longest_duration: item.long_duration,
          est_longest_duration_time: item.long_duration_type === "day" ? "days" : "hours",
          note_duration: item.description,
          service_status: item.status,
          flat_cost: item.cost_flat,
          max_distance_config: [true],
          max_distance: item.max_distance,
          max_received_time: item.time_limit,
          max_received_time_config: [true]
        }));
      });
      this.dataService.showLoading(false);

      if (this.isDetail) {
        this.formCourier.disable();
      }
    }, err => {
      this.dataService.showLoading(false);
    })
  }

  createFormService() {
    let maxReceivedTime = new Date();
    maxReceivedTime.setHours(14, 0, 0, 0);

    return this.formBuilder.group({
      name: ["Layanan Baru", Validators.required],
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
        phone: this.formCourier.get("contact").value,
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
            } else if (time_limit.indexOf(":") > -1 && time_limit.length > 5) {
              console.log('disini bor masuk time format dari BE');
              time_limit = time_limit.substr(0, 5);
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
            id: this.detailCourier.services[idx] ? this.detailCourier.services[idx]['id'] : -99,
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
        this.dialogService.openSnackBar({ message: "Format Waktu Layanan Tidak Valid" });
        return;
      }
      console.log('body', body, this.formCourier);

      this.courierManagementService.update(body, { courier_id: this.courierID }).subscribe(res => {
        this.dataService.showLoading(false);
        console.log('res', res);
        this.dialogService.openSnackBar({ message: "Data berhasil disimpan" });
        this.router.navigate(['delivery', 'courier']);
      }, err => {
        console.log('err create courier', err);
        this.dataService.showLoading(false);
      })
    } else {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formCourier);
    }
  }

}
