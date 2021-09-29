import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { DataService } from "../../../../../services/data.service";
import { AudienceService } from "../../../../../services/dte/audience.service";
import { DialogService } from "../../../../../services/dialog.service";
import { Router } from "@angular/router";
import { Subject, Observable, ReplaySubject } from "rxjs";
import { PengaturanAttributeMisiService } from 'app/services/dte/pengaturan-attribute-misi.service';
import { Page } from 'app/classes/laravel-pagination';
import { LanguagesService } from "app/services/languages/languages.service";


@Component({
  selector: "app-dialog-edit-project",
  templateUrl: "./dialog-edit-project.component.html"
})
export class DialogEditProjectComponent implements OnInit {
  form: FormGroup;
  pagination: Page = new Page();
  offsetPagination: Number = null;
  dataTmp: any[];
  condition: boolean;
  loadingIndicator: Boolean;
  name: string;
  id: number;
  status: string;
  nameChange = false;
  statusChange = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogEditProjectComponent>,
    private dataService: DataService,
    private pengaturanAttributeMisiService: PengaturanAttributeMisiService,
    private dialogService: DialogService,
    private audienceService: AudienceService,
    @Inject(MAT_DIALOG_DATA) data,
    private ls: LanguagesService
  ) {
    this.condition = false;
    this.name = data.name;
    this.id = data.id;
    this.status = data.status;
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
        // id: "",
        // name: ""
        name: this.name,
        id: this.id,
        status: this.status
      });
      this.form.patchValue({
        name: this.name,
        status: this.status,
        // id: this.id
      });
      console.log(this.form.value);
      this.form.get('name').valueChanges.subscribe(x => {
        this.nameChange = true;
      });
      this.form.get('status').valueChanges.subscribe(x => {
        this.statusChange = true;
    });
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.pengaturanAttributeMisiService.getProject(this.pagination).subscribe(
      res => {
        this.dataTmp = res.data.data;
      },
    );
  }

  submit(form) {
    this.dataService.showLoading(true);
    this.loadingIndicator = true;
    this.condition = false;
    if (this.nameChange) {
      this.form.removeControl('status');
    }
    if (this.statusChange) {
      this.form.removeControl('name');
  }
    if (this.condition === false) {
    this.dialogRef.close(`${form.value.name}`);
    this.pengaturanAttributeMisiService.putProjectMisi(form.value, { project_misi_id: this.id }).subscribe(res => {
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
      });
    }
  }
}
