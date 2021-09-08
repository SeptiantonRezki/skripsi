import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { CustomerCareService } from 'app/services/customer-care.service';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { isArray } from 'lodash';

export interface StaffList {
  fullname: string;
  phone: string;
  type: string;
  birth_date: any;
}

@Component({
  selector: 'app-device-recover',
  templateUrl: './device-recover.component.html',
  styleUrls: ['./device-recover.component.scss']
})
export class DeviceRecoverComponent implements OnInit {
  list_staff: StaffList[] = [];
  list_devices: any[] = [];
  setting_info: any;
  unique_device_id: any;
  device_id: any;
  @Input() business_id: any;
  @Input() retailer_data: any;

  formRecovery: FormGroup;
  onRecoverDevice: boolean = false;

  constructor(
    private customerCareService: CustomerCareService,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService
  ) {

  }

  ngOnInit() {
    this.getRecoveryInfo();

    this.formRecovery = this.formBuilder.group({
      applicant_name: ["", Validators.required],
      applicant_phone: ["", Validators.required],
      description: ["", Validators.required],
      retailer_code: [""],
      retailer_name: [""],
      blocked_time: [""],
      last_recover: [""],
      total_recovery_device: [0]
    });
  }

  numbersOnlyValidation(event) {
    const inp = String.fromCharCode(event.keyCode);
    /*Allow only numbers*/
    if (!/^\d+$/.test(inp)) {
      event.preventDefault()
    }
  }

  getRecoveryInfo() {
    this.dataService.showLoading(true);
    this.customerCareService.getRecoveryInfo({ business_id: this.business_id }).subscribe(res => {
      this.list_staff = res.data.staff || [];
      this.list_devices = res.data.devices || [];

      if (res && res.data && res.data.settings && isArray(res.data.settings)) {
        let settings = res.data.settings.find(r => r.name === 'max_login');
        if (settings) this.setting_info = settings;
      }
      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
    })
  }

  setRecoveryDevice(item) {
    this.unique_device_id = item.unique_device_id;
    this.device_id = item.device_id;
    this.onRecoverDevice = !this.onRecoverDevice;

    this.formRecovery.setValue({
      applicant_name: "",
      applicant_phone: "",
      description: "",
      retailer_code: this.retailer_data.code,
      retailer_name: this.retailer_data.name,
      blocked_time: item.attempt_at,
      last_recover: item.recovery_at,
      total_recovery_device: this.setting_info.values || 0
    });

    this.formRecovery.get('retailer_code').disable();
    this.formRecovery.get('retailer_name').disable();
    this.formRecovery.get('blocked_time').disable();
    this.formRecovery.get('last_recover').disable();
    this.formRecovery.get('total_recovery_device').disable();
  }

  cancelRecovery() {
    this.formRecovery.reset();
    this.device_id = null;
    this.unique_device_id = null;
    this.onRecoverDevice = !this.onRecoverDevice;
  }

  submitRecovery() {
    if (this.formRecovery.valid) {
      const data = {
        titleDialog: 'Pulihkan Perangkat',
        captionDialog: 'Apakah anda yakin untuk Memulihkan Perangkat ini ?',
        confirmCallback: this.confirmRecovery.bind(this),
        buttonText: ['Ya, Lanjutkan', 'Batal']
      };
      this.dialogService.openCustomConfirmationDialog(data);
    } else {
      commonFormValidator.validateAllFields(this.formRecovery);
      this.dialogService.openSnackBar({ message: 'Lengkapi data terlebih dahulu' });
    }
  }

  confirmRecovery() {
    let body = {
      name: this.formRecovery.get('applicant_name').value,
      phone: '+62' + this.formRecovery.get('applicant_phone').value,
      description: this.formRecovery.get('description').value,
      device_id: this.device_id,
    }
    this.dataService.showLoading(true);
    this.customerCareService.setRecoveryDevice({ business_id: this.business_id }, body).subscribe(res => {
      this.dataService.showLoading(false);
      this.dialogService.brodcastCloseConfirmation();
      this.dialogService.openSnackBar({ message: "Data Berhasil Disimpan!" });
      this.cancelRecovery();
      this.getRecoveryInfo();
    }, err => {
      this.dataService.showLoading(false);
    });

  }

}
