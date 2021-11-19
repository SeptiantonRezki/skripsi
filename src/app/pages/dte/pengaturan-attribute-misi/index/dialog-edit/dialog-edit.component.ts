import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { DataService } from "../../../../../services/data.service";
import { AudienceService } from "../../../../../services/dte/audience.service";
import { DialogService } from "../../../../../services/dialog.service";
import { Router } from "@angular/router";
import { Subject, Observable, ReplaySubject } from "rxjs";
import { PengaturanAttributeMisiService } from 'app/services/dte/pengaturan-attribute-misi.service';
import { LanguagesService } from 'app/services/languages/languages.service';


@Component({
  selector: 'app-dialog-edit',
  templateUrl: './dialog-edit.component.html',
  styleUrls: ['./dialog-edit.component.scss']
})
export class DialogEditComponent implements OnInit {

  form: FormGroup;
  loadingIndicator: Boolean;
  reorderable = true;
  saveData: Boolean;
  exportTemplate: Boolean;
  valueChange: Boolean;
  selected = [];
  name: string;
  id: number;
  status: string;

  nameChange = false;
  statusChange = false;
  isColor: boolean = false;
  colorCopywriting: string;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<DialogEditComponent>,
    private dataService: DataService,
    private pengaturanAttributeMisiService: PengaturanAttributeMisiService,
    private dialogService: DialogService,
    private audienceService: AudienceService,
    private ls: LanguagesService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.name = data.name;
    this.id = data.id;
    this.status = data.status;
    
    if (data.color) {
      this.colorCopywriting = data.color;
      this.isColor = true;
    }
    if (data.color === null) {
      this.colorCopywriting = '#000000';
      this.isColor = true;
    }
   }

  ngOnInit() {
    this.form = this.formBuilder.group({
      name: this.name,
      id: this.id,
      status: this.status,
      color: this.colorCopywriting
    });
    this.form.patchValue({
      name: this.name,
      status: this.status,
      // id: this.id
    });
    
    this.form.get('name').valueChanges.subscribe(x => {
      this.nameChange = true;
    })
    this.form.get('status').valueChanges.subscribe(x => {
      this.statusChange = true;
    });
    this.form.get('color').disable();
  }

  submit(form) {
    if (this.nameChange) {
      this.form.removeControl('status');
    }
    if (this.statusChange) {
      this.form.removeControl('name');
    }

    this.dialogRef.close(`${form.value}`);

    this.pengaturanAttributeMisiService[this.data.methodPut](form.value, { [this.data.paramsId]: this.id }).subscribe(res => {
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
      this.dialogService.openSnackBar({ message: err.error.message })
    });
  }

}
