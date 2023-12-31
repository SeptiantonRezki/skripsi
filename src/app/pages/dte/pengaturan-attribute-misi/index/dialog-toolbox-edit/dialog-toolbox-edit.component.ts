import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { FormGroup, FormBuilder } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { DataService } from "../../../../../services/data.service";
import { AudienceService } from "../../../../../services/dte/audience.service";
import { DialogService } from "../../../../../services/dialog.service";
import { Router } from "@angular/router";
import { Subject, Observable, ReplaySubject } from "rxjs";
import { PengaturanAttributeMisiService } from 'app/services/dte/pengaturan-attribute-misi.service';
import { LanguagesService } from 'app/services/languages/languages.service';


@Component({
  selector: 'app-dialog-toolbox-edit',
  templateUrl: './dialog-toolbox-edit.component.html',
  styleUrls: ['./dialog-toolbox-edit.component.scss']
})
export class DialogToolboxEditComponent implements OnInit {
  form: FormGroup;
  loadingIndicator: Boolean;
  reorderable = true;
  saveData: Boolean;
  exportTemplate: Boolean;
  valueChange: Boolean;
  selected = [];
  name:string;
  id: number;
  status: string;

  nameChange = false;
  statusChange = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<DialogToolboxEditComponent>,
    private dataService: DataService,
    private pengaturanAttributeMisiService: PengaturanAttributeMisiService,
    private dialogService: DialogService,
    private audienceService: AudienceService,
    @Inject(MAT_DIALOG_DATA) data,
    private ls: LanguagesService
  ) {
    this.name = data.name;
    this.id = data.id;
    this.status= data.status;
  }

  ngOnInit() {
    if (this.nameChange) {
      this.form.removeControl('status');
    }
    if (this.statusChange) {
      this.form.removeControl('name');
    }
    this.form = this.formBuilder.group({
      // id: "",
      // name: ""
      name: this.name,
      status: this.status,
      id: this.id
    });
    this.form.patchValue({
      name: this.name,
      status: this.status,
      // id: this.id
    });
    console.log(this.form.value);
    this.form.get('name').valueChanges.subscribe(x => {
      this.nameChange = true;
    })
    this.form.get('status').valueChanges.subscribe(x => {
      this.statusChange = true;
    })
  }

  submit(form) {
    if (this.nameChange) {
      this.form.removeControl('status');
    }
    if (this.statusChange) {
      this.form.removeControl('name');
    }
    this.dialogRef.close(`${form.value}`);
    // console.log(`${form.value.name}`);
    console.log(form.value);
    this.pengaturanAttributeMisiService.putToolbox(form.value, { kategori_toolbox_id: this.id }).subscribe(res => {
      this.dataService.showLoading(false);
      if (res.success) {
        this.dialogService.openSnackBar({
          message: this.ls.locale.notification.popup_notifikasi.text22
        });
      } else {
        this.dialogService.openSnackBar({
          message: res.message
        });
      }
      this.router.navigate(['dte', 'pengaturan-attribute-misi']);
    }, err => {
      console.log('err', err);
      this.dataService.showLoading(false);
    })
  }

}
