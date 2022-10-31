import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-tier-price-dialog',
  templateUrl: './tier-price-dialog.component.html',
  styleUrls: ['./tier-price-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TierPriceDialogComponent implements OnInit {
  formTier: FormGroup;
  levels: any[] = [];
  tiers: any[] = [];
  stateUpdated: Boolean;

  constructor(
    public dialogRef: MatDialogRef<TierPriceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private ls: LanguagesService
  ) {
    console.log('data', data);
    this.levels = data && data.levels ? data.levels : []
    this.tiers = data && data.tiers ? data.tiers : [];
  }

  ngOnInit() {
    let levelList = this.getFormTiers();

    this.formTier = this.formBuilder.group({
      tiers: this.formBuilder.array(
        // this.tiers.map((item, index) => {
        //   return this.formBuilder.group({
        //     id: item.id,
        //     name: [{ value: item.name, disabled: true }],
        //     price: this.levels[index].price
        //   });
        // })
        levelList.map((item, index) => {
          return this.formBuilder.group({
            id: this.tiers[index].id,
            name: [{ value: this.tiers[index].name, disabled: true }],
            price: item.price
          })
        })
      )
    });
  }

  getFormTiers() {
    let levels = [...this.levels];
    let listLevels = [];
    this.levels.map((item, index) => {
      if (this.tiers[index]) {
        listLevels.push(item);
      }
    })

    return listLevels;
  }

  submit() {
    let tiers = this.formTier.get('tiers') as FormArray;
    let touched = tiers.controls.find(tier => tier.touched);
    if (touched) {
      this.stateUpdated = true;
    }
    tiers.value.map((tier, index) => {
      this.levels[index].price = tier.price
    });
    this.dialogRef.close({ levels: this.levels, stateUpdated: this.stateUpdated });
  }

}
