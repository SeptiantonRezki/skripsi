import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { AccessService } from 'app/services/settings/access.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';

@Component({
  selector: 'app-force-update-apps',
  templateUrl: './force-update-apps.component.html',
  styleUrls: ['./force-update-apps.component.scss']
})
export class ForceUpdateAppsComponent {
  listApps: any[] = [{ name: 'Consumer', value: 'customer'}, { name: 'Retailer', value: 'retailer' }];
  listOs: any[] = [
    { name: 'Android', value: 'android' },
    // { name: 'ios', value: 'ios' }
  ]
  yesOrNo: any[] = [{name:'Ya', value: 'yes'}, {name: 'Tidak', value:'no'}];
  formForceUpdate: FormGroup;
  
  constructor(
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private accessServices: AccessService
  ) { 

  }

  ngOnInit() {
    this.formForceUpdate = this.formBuilder.group({
      appsName: ["", Validators.required],
      version: ["", Validators.required],
      title: ["", Validators.required],
      notifNewVersion: ["yes", Validators.required],
      notifMessage: ["", Validators.required],
      forceUpdate: ["yes", Validators.required],
      os: ["", Validators.required],
    })
  }

  changeValue() {
    if (this.formForceUpdate.controls['notifNewVersion'].value === 'yes') {
      this.formForceUpdate.controls['notifMessage'].enable();

      this.formForceUpdate.controls['notifMessage'].setValidators([Validators.required]);
      this.formForceUpdate.controls['notifMessage'].updateValueAndValidity();
    } else {
      this.formForceUpdate.controls['notifMessage'].disable();
    }
  }

  submit() {
    if (this.formForceUpdate.valid) {
      let body = {
        version: this.formForceUpdate.controls['version'].value,
        type: this.formForceUpdate.controls['appsName'].value,
        force_update: this.formForceUpdate.controls['forceUpdate'].value === 'yes' ? 1 : 0,
        sort_notif: this.formForceUpdate.controls['title'].value,
        notif: this.formForceUpdate.controls['notifMessage'].value,
        os: this.formForceUpdate.controls['os'].value,
      }

      this.accessServices.forceUpdate(body).subscribe(
        res => {
          this.dialogService.openSnackBar({ message: 'Pemberitahuan Pembaruan Aplikasi berhasil disimpan' });
          this.ngOnInit();
        },
        err => {
          console.log(err)
        }
      )
    } else {
      this.dialogService.openSnackBar({ message: 'Silakan lengkapi data terlebih dahulu! '});
      commonFormValidator.validateAllFields(this.formForceUpdate);
    }
  }

}
