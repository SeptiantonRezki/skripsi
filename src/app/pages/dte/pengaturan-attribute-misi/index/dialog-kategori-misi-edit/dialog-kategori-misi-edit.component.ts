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

@Component({
  selector: 'app-dialog-kategori-misi-edit',
  templateUrl: './dialog-kategori-misi-edit.component.html',
  styleUrls: ['./dialog-kategori-misi-edit.component.scss']
})
export class DialogKategoriMisiEditComponent implements OnInit {

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

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<DialogKategoriMisiEditComponent>,
    private dataService: DataService,
    private pengaturanAttributeMisiService: PengaturanAttributeMisiService,
    private dialogService: DialogService,
    private audienceService: AudienceService,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.name = data.name;
    this.id = data.id;
    this.status = data.status;
  }

  ngOnInit() {
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
    this.pengaturanAttributeMisiService.putKategoriMisi(form.value, { kategori_misi_id: this.id }).subscribe(res => {
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
