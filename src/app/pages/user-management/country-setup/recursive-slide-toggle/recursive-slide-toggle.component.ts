import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

@Component({
  selector: 'recursive-slide-toggle',
  templateUrl: './recursive-slide-toggle.component.html',
  styleUrls: ['./recursive-slide-toggle.component.scss']
})
export class RecursiveSlideToggleComponent implements OnInit {
  
  @Input() items: FormArray;
  @Input() depth: number;

  constructor() { }

  ngOnInit() {
    // console.log(this.items);
  }

  onChange({checked}, item, depth) {
    // console.log({checked, item, depth});
    // this.toggleAllChild(item, checked);

  }

  // toggleAllChild(item, checked) {
  //   const childs = item.get('children') as FormArray;
  //   childs.controls.map((item: FormGroup) => {
  //     item.get('checked').setValue(checked, {emitEvent: false});
  //     if(childs.controls && childs.controls.length) {
  //       this.toggleAllChild(item, checked);
  //     }

  //   });
  // }

}
