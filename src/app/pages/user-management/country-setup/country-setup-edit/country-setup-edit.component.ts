import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { CountrySetupService } from 'app/services/user-management/country-setup.service';
import { LanguageSetupService } from 'app/services/user-management/language-setup.service';
import * as _ from 'underscore';

@Component({
  selector: 'app-country-setup-edit',
  templateUrl: './country-setup-edit.component.html',
  styleUrls: ['./country-setup-edit.component.scss']
})
export class CountrySetupEditComponent implements OnInit {

  ACCESS_MENU_MAX_DEPTH = 0;
  formCountry: FormGroup;
  statuses: any[] = [
    { name: this.ls.locale.global.label.status + " " + this.ls.locale.global.label.active, value: "active" },
    { name: this.ls.locale.global.label.status + " " + this.ls.locale.global.label.inactive, value: "inactive" }
  ];
  country;
  languages = [];
  submiting = false;
  isDetail = false;
  horizontal = false;

  constructor(
    private router: Router,
    private ls: LanguagesService,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private languageSetupService: LanguageSetupService,
    private countrySetupService: CountrySetupService,
    private activatedRoute: ActivatedRoute,
  ) {
    
    this.country = dataService.getFromStorage("country_setup_data");
    
    activatedRoute.url.subscribe(params => {
      console.log({params});
      this.isDetail = params[1].path === 'detail' ? true : false;
    });

    this.formCountry = formBuilder.group({
      status: [(this.country.status) ? this.country.status : 'inactive', Validators.required],
      name: [this.country.name, Validators.required],
      code: [this.country.country_code, Validators.required],
      locale: [this.country.locale_code, Validators.required],
      customer_service: formBuilder.array([
        formBuilder.group({
          telepon: [(this.country.customer_services) ? this.country.customer_services.telepon : '', Validators.required],
          email: [(this.country.customer_services) ? this.country.customer_services.email : '', Validators.required],
          whatsapp: [(this.country.customer_services) ? this.country.customer_services.whatsapp : false, Validators.required],
          whatsapp_number: [(this.country.customer_services) ? this.country.customer_services.whatsapp_number : null],
          bude: [(this.country.customer_services) ? this.country.customer_services.bude : false, Validators.required]
        })
      ]),
      currencies: formBuilder.group({
        symbol: [(this.country.currencies) ? this.country.currencies.symbol : '', Validators.required],
        decimal: [(this.country.currencies) ? this.country.currencies.decimal : '', Validators.required],
        decimal_separator: [(this.country.currencies) ? this.country.currencies.decimal_separator : '', Validators.required],
        thousand_separator: [(this.country.currencies) ? this.country.currencies.thousand_separator : '', Validators.required],
      }),
      point_valuation: [this.country.point_valuation, Validators.required],
      phone_code: [this.country.phone_code.replace('+', ''), Validators.required],
      phone_min_length: [this.country.phone_min_length, Validators.required],
      phone_max_length: [this.country.phone_max_length, Validators.required],
      language_id: [(this.country.language && this.country.language.id) ? this.country.language.id : null, Validators.required],
      access_menu: formBuilder.group({
        type: ["retailer", Validators.required],
        fullaccess: false,
        abilities: formBuilder.array([])
      })
    })

    const customerService = this.formCountry.get('customer_service') as FormArray;
    customerService.at(0).get('whatsapp').valueChanges.subscribe(val => {

      if(val) {
        customerService.at(0).get('whatsapp_number').setValidators(Validators.required);
      } else {
        customerService.at(0).get('whatsapp_number').setValue(null);
        customerService.at(0).get('whatsapp_number').setValidators([]);
      }
      customerService.at(0).get('whatsapp_number').updateValueAndValidity();
      
    });

    this.formCountry.get('access_menu').get('abilities').valueChanges.debounceTime(500).subscribe(menus => {
      this.onAccessMenuChange(menus);
    });

  }

  ngOnInit() {



    this.languageSetupService.get().subscribe(({data}) => {
      this.languages = data
    }, err => {

    })

    this.countrySetupService.getRetailerMenus().subscribe(({data}) => {
      
      const abilities = this.getAbilitiesByType(this.country.access_menus, "retailer");

      const flatMasterAbilities = this.flatenedAbilities(data, (item) => item.name, this.ACCESS_MENU_MAX_DEPTH );
      const flatabilities = this.flatenedAbilities(abilities, (item) => item.title, this.ACCESS_MENU_MAX_DEPTH );

      const filtered = this.assignTrueIfExists(flatMasterAbilities, flatabilities, (left, right) => left.title === right.title);
      const access_menus = this.formCountry.get('access_menu').get('abilities') as FormArray;

      access_menus.push(this.buildFullAccessTogle());
      
      access_menus.at(0).valueChanges.subscribe(fullaccess => {
        this.onFullAccessChange(fullaccess);
      })

      this.setAbilities(this.nested(filtered), access_menus);

    }, err => {

    })

    if(this.isDetail) {
      this.formCountry.disable();
    }

  }

  buildFullAccessTogle() {
    return this.formBuilder.group({
      title: 'Full Access',
      children: this.formBuilder.array([]),
      checked: false,
      depth: 0
    })
  }

  onFullAccessChange({checked, value}) {
    let menus = this.formCountry.get('access_menu').get('abilities') as FormArray;
    this.recurseCheck(menus.controls, checked);
  }

  toggleFullAccess(checked) {
    const abilities = this.formCountry.get('access_menu').get('abilities') as FormArray;
    abilities.at(0).get('checked').setValue(checked, {emitEvent: false});
  }

  recurseCheck(items, checked) {
    items.map( (item: FormGroup) => {
        
      if(item.get('title').value !== 'Full Access') {
        item.get('checked').setValue(checked, {emitEvent: false});
        const childs = item.get('children') as FormArray;

        if(childs && childs.length) {
          this.recurseCheck(childs, checked);
        }
      }

    })
  }

  onAccessMenuChange(menus) {

    const menusWithoutFullaccess = menus.filter(item => item.title !== 'Full Access');
    const allChecked = _.pluck(menusWithoutFullaccess, 'checked');
    
    if(allChecked.includes(false)) this.toggleFullAccess(false);
    else this.toggleFullAccess(true);
  }

  setAbilities(values, form: FormArray, depth = 0) {

    values.map(item => {
      let menu = this.formBuilder.group({
        title: item.title,
        children: this.formBuilder.array([]),
        checked: item.checked,
        depth: depth,
      });
      form.push(menu);
      if(item.children && item.children.length) {
        let child = menu.controls['children'] as FormArray;
        this.setAbilities(item.children, child, depth + 1);
      }
    })

  }

  nested(flat) {

    function checkLeftOvers(leftOvers, possibleParent){
      for (let i = 0; i < leftOvers.length; i++) {
        if(leftOvers[i].parent_id === possibleParent.id) {
          delete leftOvers[i].parent_id
          possibleParent.children ? possibleParent.children.push(leftOvers[i]) : possibleParent.children = [leftOvers[i]]
          possibleParent.count = possibleParent.children.length
          const addedObj = leftOvers.splice(i, 1)
          checkLeftOvers(leftOvers, addedObj[0])
        }
      }
    }
    
    function findParent(possibleParents, possibleChild) {
      let found = false
      for (let i = 0; i < possibleParents.length; i++) {
        if(possibleParents[i].id === possibleChild.parent_id) {
          found = true
          delete possibleChild.parent_id
          if(possibleParents[i].children) possibleParents[i].children.push(possibleChild)
          else possibleParents[i].children = [possibleChild]
          possibleParents[i].count = possibleParents[i].children.length
          return true
        } else if (possibleParents[i].children) found = findParent(possibleParents[i].children, possibleChild)
      } 
      return found;
    }

    const nested = flat.reduce((initial, value, index, original) => {
      if (value.parent_id === null) {
        if (initial.left.length) checkLeftOvers(initial.left, value)
        delete value.parent_id;
        initial.nested.push(value)
      }
      else {
         let parentFound = findParent(initial.nested, value)
         if (parentFound) checkLeftOvers(initial.left, value)
         else initial.left.push(value)
      }
      return index < original.length - 1 ? initial : initial.nested
    }, {nested: [], left: []})
    
   return nested;

  }

  getAbilitiesByType(menus, type) {
    
    const data = _.find(menus, (item) => item.type === type);
    if(data && data.abilities) {
      return data.abilities;
    }
    return [];

  }

  flatenedAbilities(abilities, parseName: Function, maxDepth = 0) {
    
    const flatitems = [];
    let id = 0;

    const recurse = (items, depth = 0, parentId = null) => {
      
      items.map((item, i) => {
        
        id += 1;
        const menu = {title: parseName(item), depth: depth, id: id, parent_id: parentId};
        
        flatitems.push(menu);

        if(item.children && maxDepth > depth) {
          recurse(item.children, depth +1, menu.id);
        }
      });
    }

    recurse(abilities);

    return flatitems;

  }

  assignTrueIfExists(left, right, compare: Function) {

    const result = _.map(left, (leftItem) => {
      if( right.some(rightItem => compare(leftItem, rightItem) ) ) {
        leftItem.checked = true
      } else {
        leftItem.checked = false
      }
      return leftItem;
    })
    return result;

  }

  getAbilities(menus, child) {

    menus.map(item => {
      
      if(item.checked) {
        item.children = this.getAbilities(item.children, []);

        child.push({title: item.title, children: item.children });

      }

    });
    return child;

  }

  submit() {
    
    this.dataService.showLoading(true);

    let body = this.formCountry.getRawValue();

    let fullaccess = _.find(body.access_menu.abilities, item => item.title === 'Full Access');
    let abilitiesWithoutFullAccess = body.access_menu.abilities.filter(item => item.title !== 'Full Access');

    body.access_menu = [{
      ...body.access_menu,
      fullaccess: fullaccess.checked,
      abilities: this.getAbilities(abilitiesWithoutFullAccess, []),
    }]
    
    this.countrySetupService.update(body, {id: this.country.id}).subscribe(res => {
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
      this.router.navigate(["user-management", "countries"]);

    }, err => {
      
      this.dataService.showLoading(false);

    });

  }

}
