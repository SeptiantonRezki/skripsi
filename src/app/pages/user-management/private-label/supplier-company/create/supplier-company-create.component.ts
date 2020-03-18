import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged, switchMap, finalize, tap } from 'rxjs/operators';

import { DialogService } from "../../../../../services/dialog.service";
import { commonFormValidator } from "../../../../../classes/commonFormValidator";
import { SupplierCompanyService } from "app/services/user-management/private-label/supplier-company.service";
import { Router } from '@angular/router';

@Component({
  selector: 'app-supplier-company-create',
  templateUrl: './supplier-company-create.component.html',
  styleUrls: ['./supplier-company-create.component.scss']
})
export class SupplierCompanyCreateComponent implements OnInit {
  onLoad: boolean;
  createForm: FormGroup;
  createFormError: any;
  @ViewChild('chipList') chipList: MatChipList;
  productControl= new FormControl();
  catatanControl = new FormControl();

  supplierStatusList: any[] = [
    { name: 'Status Aktif', status: 'active' },
    { name: 'Status Non-Aktif', status: 'non-active' }
  ];
  supplierStatusSelected: any;
  products: any[];
  productVisible: boolean = true;
  productSelectable: boolean = true;
  productRemovable: boolean = true;
  productAddOnBlur: boolean = true;
  readonly productSeparatorKeysCodes: number[] = [COMMA];
  // keywords: string[] = [];
  productOptions: Observable<any[]>;
  isLoadingProduct: boolean;
  isProductFound: boolean;
  isLoadingSave: boolean;
  catatan: String;

  constructor(
    private formBuilder: FormBuilder,
    private supplierCompanyService: SupplierCompanyService,
    private dialogService: DialogService,
    private router: Router,
  ) {
    this.onLoad = true;
    this.isLoadingProduct = false;
    this.isProductFound = false;
    this.products = [];
    this.isLoadingSave = false;
  }

  ngOnInit() {
    this.createForm = this.formBuilder.group({
      namasupplier: ["", Validators.required],
      alamat: ["", Validators.required],
      telepon: ["", [Validators.required, Validators.minLength(6)]],
      ponsel: ["", [Validators.required, Validators.minLength(6)]],
      // catatan: "", 
    })
    this.catatan = '';
    this.catatanControl.setValue('');

    this.createForm.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.createForm, this.createFormError);
    })

    this.productOptions = this.productControl.valueChanges.pipe(
        startWith(''),
        debounceTime(400),
        tap(() => this.isLoadingProduct = true),
        distinctUntilChanged(),
        switchMap(value => this._filter(value)
        )
      )
  }

  private _filter(value: string) {
    // console.log('value', value);
    // if (value) {
    return this.supplierCompanyService.search({ param: value, isAll: true }).pipe(
      map((option: any) => {
        // console.log('option', option);
        if (option.data.length > 0) {
          this.isProductFound = true;
          return option.data;
        } else {
          this.isProductFound = false;
          return [{
            id: null,
            title: "",
            text: "HASIL PENCARIAN untuk \"" + value + "\" tidak ditemukan. Mohon hubungi tim Digital Care untuk pertanyaan ini.",
            value: value,
            disabled: true
          }];
        }
      })
    );
    // } else { this.productValue = ''; return []; }
  }

  addChip(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    // Add keyword
    if ((value || '').trim()) {
      // this.products.push(value.trim());
    }
    // Reset the input value
    if (input) {
      input.value = '';
      if (this.products.length > 0) {
        // this.formHelp.get('otherkeyword').setValue(value);
        this.chipList.errorState = false;
      } else {
        this.chipList.errorState = true;
      }
    }
  }

  addProductChip(item: any): void {
    // Add keyword
    if (item.name) {
      item.name = item.name.trim();
      this.products.push(item);
    }
  }

  removeChip(keyword: string): void {
    const index = this.products.indexOf(keyword);
    //remove keyword
    if (index >= 0) {
      this.products.splice(index, 1);
    }
  }

  checkError() {
    console.log('statusError', this.createForm.status)
    if (!this.createForm.get('namasupplier').valid) {
      this.createForm.get('namasupplier').markAsTouched({ onlySelf: true });     
    } else if (this.products.length == 0) {
      this.chipList.errorState = true;
      this.chipList.focus();
    } else if (!this.createForm.get('alamat').valid) {
      this.createForm.get('alamat').markAsTouched({ onlySelf: true });  
    } else if (!this.createForm.get('telepon').valid) {
      this.createForm.get('telepon').markAsTouched({ onlySelf: true });  
    } else if (!this.createForm.get('ponsel').valid) {
      this.createForm.get('ponsel').markAsTouched({ onlySelf: true }); 
    }
  }

  onSave() {
    this.isLoadingSave = true;
    if (this.createForm.valid && this.products.length > 0) {
      const products = this.products.map((item) => item.id);
      const body = {
        name: this.createForm.get("namasupplier").value,
        address: this.createForm.get("alamat").value,
        telephone: this.createForm.get("telepon").value,
        cellphone: this.createForm.get("ponsel").value,
        // note: this.createForm.get("catatan").value,
        note: this.catatanControl.value,
        products: products
      };
      this.supplierCompanyService.create(body).subscribe(res => {
        this.dialogService.openSnackBar({
          message: "Data Berhasil Disimpan"
        });
        this.products = [];
        this.createForm.reset();
        this.catatanControl.reset();
        this.router.navigate(["user-management", "supplier-company"]);
        }, err => {
          console.log('err', err);
          this.isLoadingSave = false;
          this.dialogService.openSnackBar({
            message: err.error.message
          });
        }
      );
    } else {
      console.log('failed to Save - Data Belum Lengkap',);
      this.isLoadingSave = false;
      this.dialogService.openSnackBar({
        message: "Data Belum Lengkap"
      });
      commonFormValidator.validateAllFields(this.createForm);
      this.checkError();
    }
  }
}
