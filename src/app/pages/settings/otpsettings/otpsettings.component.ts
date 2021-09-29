import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OTPSettingService } from 'app/services/otpsetting.service';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-otpsettings',
  templateUrl: './otpsettings.component.html',
  styleUrls: ['./otpsettings.component.scss']
})
export class OTPSettingsComponent implements OnInit {
  otpSettings: Array<any>[];
  otpSettingId: any;
  onLoad: boolean;
  detailOtpSettings: any;
  constructor(
    private dialogService: DialogService,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private otpSettingService: OTPSettingService,
    private ls: LanguagesService
  ) {
    this.onLoad = true;
  }

  ngOnInit() {
    this.getOtpSettings();
  }

  getOtpSettings() {
    this.otpSettingService.get({}).subscribe(res => {
      console.log('res asdjha');
      this.otpSettings = res;
      // this.detailRoles = res;
      // this.roles = res.role;

      this.onLoad = false;
    })
  }

  onToggleChange(otpIdx, actionIdx, itemIdx) {
    console.log('idx family', otpIdx, actionIdx, itemIdx);
    let newOtpSettings = [...this.otpSettings];
    newOtpSettings[otpIdx]['action'][actionIdx]['value'][itemIdx === 1 ? 0 : 1]['value'] = !newOtpSettings[otpIdx]['action'][actionIdx]['value'][itemIdx]['value'];
    this.otpSettings = newOtpSettings;
  }

  submit() {
    this.dataService.showLoading(true);
    let body = [];
    this.otpSettings.map((otp: any) => {
      otp.action.map(act => {
        let val = act.value.find(vl => vl.value);
        if (val) {
          body.push({
            platform: otp.platform,
            action: act.nama,
            value: val.nama
          });
        }
      })
    });
    console.log('bodies', body);
    // return;
    this.otpSettingService.update(body).subscribe(
      res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
        this.onLoad = true;
        this.getOtpSettings();
      },
      err => {
        console.log(err.error.message);
        this.dataService.showLoading(false);
      }
    )
  }

}
