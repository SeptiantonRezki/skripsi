import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import * as _ from 'underscore';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { CategoryService } from '../../../../services/newsfeed-management/category.service';
import { DateAdapter } from '@angular/material';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from '../../../../services/data.service';

@Component({
  selector: 'app-category-create',
  templateUrl: './category-create.component.html',
  styleUrls: ['./category-create.component.scss']
})
export class CategoryCreateComponent{

  onLoad: boolean;
  loadingIndicator: boolean;

  formCategoryGroup: FormGroup;
  formCategoryErrors: any;

  rssIndex: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private CategoryService: CategoryService,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder
  ) { 
    this.adapter.setLocale('id');
    
  }

  ngOnInit() {
    this.createFormGroup();

    this.formCategoryErrors = {
      name: {},
      link: []
    }
    
    // this.formCategoryGroup = this.formBuilder.group({
    //   name: ["", Validators.required],
    //   link: []
    // })

  }

  addItemLink(): FormGroup {
    return this.formBuilder.group({
      url: [
        "", 
        [
          Validators.required, 
          Validators.pattern("(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?")
        ]
      ]
    });
  }

  addNewRSS(){
    console.log('add new row');
    let linkItem = this.formCategoryGroup.get("link") as FormArray;
    linkItem.push(this.addItemLink());
  }

  removeRSS(param?, id?): void {
    this.rssIndex = id;
    let data = {
      titleDialog: "Hapus RSS",
      captionDialog: `Apakah anda yakin untuk menghapus RSS ${param.value.url}?`,
      confirmCallback: this.confirmRemoveRSS.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmRemoveRSS(): void {
    let packaging = this.formCategoryGroup.get("link") as FormArray;
    packaging.removeAt(this.rssIndex);
    
    this.dialogService.openSnackBar({ message: 'Data Berhasil Dihapus' });
    this.dialogService.brodcastCloseConfirmation();
  }


  createFormGroup(): void {
    this.formCategoryGroup = this.formBuilder.group({
      name: ["", Validators.required],
      link: this.formBuilder.array([this.addItemLink()])
    });
  }  


  submit(status?: string): void {
    console.log(this.formCategoryGroup);
    if (this.formCategoryGroup.valid) {
      let links = this.formCategoryGroup.get("link").value.map(item => item.url);
      // console.log(links); return;

      let body = {
        name: this.formCategoryGroup.get("name").value,
        link: links,
        status: 'active'
      };

      this.CategoryService
        .create(body)
        .subscribe(
          res => {
            this.dialogService.openSnackBar({
              message: "Data Berhasil Disimpan"
            });
            this.router.navigate(["newsfeed-management", "category"]);
          },
          err => {}
        );
    } else {
      this.dialogService.openSnackBar({
        message: "Silakan lengkapi data terlebih dahulu!"
      });
    }
  }

}
