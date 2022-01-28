import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import * as _ from 'underscore';
@Component({
  selector: 'recursive-slide-toggle',
  templateUrl: './recursive-slide-toggle.component.html',
  styleUrls: ['./recursive-slide-toggle.component.scss']
})
export class RecursiveSlideToggleComponent implements OnInit {
  
  @Input() items: FormArray;
  @Input() parent: FormGroup;
  @Input() fullAccess: FormGroup;
  @Input() depth: number;
  @Input() horizontal: boolean;

  constructor() {
    this.toggleParent = this.toggleParent.bind(this);
  }

  ngOnInit() {

    if(this.parent.get('children')) {
      this.onAccessMenuChange(this.parent.get('children').value);
    }
  }

  onAccessMenuChange(menus) {
    const menusWithoutFullaccess = menus.filter(item => item.title !== 'Full Access');
    
    const allChecked = [];
    const debounceChecked = _.debounce(this.toggleParent, 300);

    const recurseChecked = function(_menus: Array<any>, _checked) {

      if(_menus && _menus.length) {

        _menus.map(i => {

          _checked.push(i.checked);

          if( _checked.includes(true)) {
            debounceChecked(true);
          }

          if(i.children && i.children.length) {
            recurseChecked(i.children, _checked);
          }
        });  
      }

    };

    recurseChecked(menusWithoutFullaccess, allChecked);
    
  }

  toggleParent(checked) {
    this.parent.get('checked').setValue(checked, {emitEvent: false});
  }

  onChange({checked}, item, depth) {
    
    const items = this.items;

    const target = _.find(items, (i) => i.get('title').value === item.get('title').value);
  
    this.recurseToggleChilds(target, checked);
    if(checked && this.parent.get('checked')) {
      this.parent.get('checked').setValue(true, {emitEvent: false});
    }

    if(this.parent.get('checked')) {
      const parentChild = this.parent.get('children') as FormArray;
      this.isCheckedParent(parentChild.getRawValue());
    }

    if(!checked && this.fullAccess) {
      this.fullAccess.get('checked').setValue(false, {emitEvent: false});
    }

  }

  isCheckedParent(menus) {
    console.log({menus});
    if(menus && menus.length) {
      const menusWithoutFullaccess = menus.filter(item => item.title !== 'Full Access');
      const allChecked = _.pluck(menusWithoutFullaccess, 'checked');
      
      if(!allChecked.includes(true)) {
        this.parent.get('checked').setValue(false, {emitEvent: false});
      }

    }
  }

  recurseToggleChilds(target: FormGroup, checked) {
    const childs = target.get('children') as FormArray;
    if(childs && childs.length) {

      childs.controls.map(child => {
        
        child.get('checked').setValue(checked);

      })

    }

  }

}
