import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { AccessService } from 'app/services/settings/access.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { PagesName } from 'app/classes/pages-name';

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

  listVersionConsumer: any[];
  listVersionRetailer: any[];
  lastVersionConsumer: any;
  lastVersionRetailer: any;

  id: any;
  onLoad: Boolean;

  permission: any;
  roles: PagesName = new PagesName();
  
  constructor(
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private accessServices: AccessService
  ) { 
    this.onLoad = true;

    this.permission = this.roles.getRoles('principal.forceupdate');
    console.log(this.permission);
  }

  ngOnInit() {
    
    this.accessServices.listVersion().subscribe(res => {
      this.listVersionRetailer = res[0].data;
      this.listVersionConsumer = res[1].data;
      
      this.lastVersionRetailer = this.listVersionRetailer.length > 0 ? parseFloat(this.listVersionRetailer[0]['version']) : 0;
      this.lastVersionConsumer = this.listVersionConsumer.length > 0 ? parseFloat(this.listVersionConsumer[0]['version']) : 0;

      this.formForceUpdate = this.formBuilder.group({
        appsName: ["", Validators.required],
        version: ["", Validators.required],
        title: ["", Validators.required],
        notifNewVersion: ["yes", Validators.required],
        notifMessage: ["", Validators.required],
        forceUpdate: ["yes", Validators.required],
        os: ["", Validators.required],
      })

      this.formForceUpdate.valueChanges.debounceTime(200).subscribe(val => {
        if (val.appsName === 'retailer') {
          this.formForceUpdate.controls['version'].clearValidators();
          this.formForceUpdate.controls['version'].updateValueAndValidity();

          this.formForceUpdate.controls['version'].setValidators([Validators.required, Validators.min(this.lastVersionRetailer)])
          this.formForceUpdate.controls['version'].updateValueAndValidity();
        }

        if (val.appsName === 'customer') {
          this.formForceUpdate.controls['version'].clearValidators();
          this.formForceUpdate.controls['version'].updateValueAndValidity();

          this.formForceUpdate.controls['version'].setValidators([Validators.required, Validators.min(this.lastVersionConsumer)])
          this.formForceUpdate.controls['version'].updateValueAndValidity();
        }
      })

      if (!this.permission.buat) { this.formForceUpdate.disable() };
      this.onLoad = false;
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

  revertVersion(item) {
    this.id = item.id;
    let data = {
      titleDialog: "Hapus Versi Aplikasi",
      captionDialog: `Apakah anda yakin untuk menghapus versi ${item.version} pada aplikasi ${item.name}?`,
      confirmCallback: this.confirmRevert.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmRevert() {
    this.accessServices.revertVersion({ version_id: this.id }).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Versi berhasil dihapus" });

        this.ngOnInit();
      },
      err => {
        // this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

}
