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


@Component({
  selector: 'app-dialog-kesulitan-misi-edit',
  templateUrl: './dialog-kesulitan-misi-edit.component.html',
  styleUrls: ['./dialog-kesulitan-misi-edit.component.scss']
})
export class DialogKesulitanMisiEditComponent implements OnInit {

  form: FormGroup;
  loadingIndicator: Boolean;
  reorderable = true;
  saveData: Boolean;
  exportTemplate: Boolean;
  valueChange: Boolean;
  selected = [];
  name:string;
  id: number;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<DialogKesulitanMisiEditComponent>,
    private dataService: DataService,
    private pengaturanAttributeMisiService: PengaturanAttributeMisiService,
    private dialogService: DialogService,
    private audienceService: AudienceService,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.name = data.name;
    this.id = data.id;
   }

  ngOnInit() {
    this.form = this.formBuilder.group({
      // id: "",
      // name: ""
      name: this.name,
      id: this.id
    });
    this.form.patchValue({
      name: this.name,
      // status: this.status,
      // id: this.id
    });
    console.log(this.form.value);
  }

  submit(form) {
    this.dialogRef.close(`${form.value}`);
    // console.log(`${form.value.name}`);
    console.log(form.value);
    this.pengaturanAttributeMisiService.putKesulitanMisi(form.value, { kesulitan_misi_id: this.id }).subscribe(res => {
      this.dataService.showLoading(false);
      if (res.success) {
        this.dialogService.openSnackBar({
          message: "Data berhasil disimpan!"
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
