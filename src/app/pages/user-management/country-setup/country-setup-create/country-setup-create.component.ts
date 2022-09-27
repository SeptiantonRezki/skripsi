import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { DialogService } from 'app/services/dialog.service';
import { Router, ActivatedRoute } from "@angular/router";
import { DataService } from "app/services/data.service";
import { LanguagesService } from 'app/services/languages/languages.service';
import { commonFormValidator } from "../../../../classes/commonFormValidator";
import { CountrySetupService } from 'app/services/user-management/country-setup.service';
import { LanguageSetupService } from 'app/services/user-management/language-setup.service';
import * as _ from 'underscore';
@Component({
  selector: 'app-country-setup-create',
  templateUrl: './country-setup-create.component.html',
  styleUrls: ['./country-setup-create.component.scss']
})
export class CountrySetupCreateComponent implements OnInit {

  step1: FormGroup;
  step2: FormGroup;
  step3: FormGroup;
  step4: FormGroup;
  step5: FormGroup;
  step6: FormGroup;
  step7: FormGroup;
  step8: FormGroup;
  step9: FormGroup;

  languages = [];

  submiting = false;

  ACCESS_MENU_MAX_DEPTH = 1;
  horizontal = true;
  listApps: any[] = [{ name: 'Retailer', value: 'retailer' }];
  constructor(
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private ls: LanguagesService,
    private countrySetupService: CountrySetupService,
    private languageSetupService: LanguageSetupService,
  ) {
    this.toggleFullAccess = this.toggleFullAccess.bind(this);
    this.togglecFullAccess = this.togglecFullAccess.bind(this);
    this.step1 = formBuilder.group({

      name: ['', Validators.required],
      country_id: ['', Validators.required],
      locale: ['', Validators.required]

    });

    this.step2 = formBuilder.group({

      phone_code: ['', Validators.required],
      phone_code_min_length: [null, Validators.required],
      phone_code_max_length: [null, Validators.required],

    });

    this.step3 = formBuilder.group({

      symbol: ['', Validators.required],
      decimal: [null, Validators.required],
      // currency_min_length: [null, Validators.required],
      // currency_max_length: [null, Validators.required],
      currency_decimal_separator: ['', Validators.required],
      currency_thousand_separator: ['', Validators.required],

    });

    
    this.step4 = formBuilder.group({
      point_valuation: ['', Validators.required]
    })

    this.step5 = formBuilder.group({
      language_id: ['', Validators.required],
    });

    this.step6 = formBuilder.group({
      telepon: ['', Validators.required],
      email: [''],
      whatsapp: [false, Validators.required],
      whatsapp_number: [null],
      bude: [false, Validators.required],
    })

    this.step7 = formBuilder.group({
      abilities: formBuilder.array([])
    });
    this.step8 = formBuilder.group({
      cabilities: formBuilder.array([])
    });
    this.step9 = formBuilder.group({
      force_logout_status: [false, Validators.required],
      version_number: [null],
      version_message: [null],
      apk_type:[null]
    })

    this.step6.get('whatsapp').valueChanges.subscribe(val => {

      if(val) {
        
        this.step6.get('whatsapp_number').setValidators(Validators.required);

      } else {

        this.step6.get('whatsapp_number').setValue(null);
        this.step6.get('whatsapp_number').setValidators([]);
        
      }
      this.step6.get('whatsapp_number').updateValueAndValidity();
    });
    
    this.step7.get('abilities').valueChanges.subscribe(menus => {
      this.onAccessMenuChange(menus);
    });
    this.step8.get('cabilities').valueChanges.subscribe(menus => {
       this.oncAccessMenuChange(menus);
    });
    this.step9.get('force_logout_status').valueChanges.subscribe(val => {
      if(val) {
        this.step9.get('version_number').setValidators(Validators.required);
        this.step9.get('version_message').setValidators([Validators.maxLength(150) ,Validators.required]);
        this.step9.get('apk_type').setValidators([Validators.required]);
      } else {
        this.step9.get('version_number').setValue(null);
        this.step9.get('version_number').setValidators([]);
        this.step9.get('version_message').setValue(null);
        this.step9.get('version_message').setValidators([]);
        this.step9.get('apk_type').setValidators([]);
        this.step9.get('apk_type').setValue(null);
      }
      this.step9.get('version_number').updateValueAndValidity();
      this.step9.get('version_message').updateValueAndValidity();
      this.step9.get('apk_type').updateValueAndValidity();
    });
  
  
    

  }

  ngOnInit() {

    this.countrySetupService.getRetailerMenus().subscribe(({data}) => {
      
      // console.log({data});
      
      const abilities = this.step7.controls['abilities'] as FormArray;
      
      abilities.push(this.buildFullAccessTogle());
      
      abilities.at(0).valueChanges.subscribe(fullaccess => {
        this.onFullAccessChange(fullaccess);
      })

      this.recurseMenus(data, abilities, this.ACCESS_MENU_MAX_DEPTH);

    }, err => {
      
      console.log({err});

    });
    this.countrySetupService.getRetailerCategoryMenus().subscribe(({data}) => {
      
      const cabilities = this.step8.controls['cabilities'] as FormArray;
      
      cabilities.push(this.buildFullAccessTogle());
      
      cabilities.at(0).valueChanges.subscribe(fullaccess => {
        this.oncFullAccessChange(fullaccess);
      })

      this.recursecMenus(data, cabilities, this.ACCESS_MENU_MAX_DEPTH);

    }, err => {
      
      console.log({err});

    });
    this.languageSetupService.get().subscribe(({data}) => {
      this.languages = data
    }, err => {

    })
  }

  onFullAccessChange({checked, value}) {
    let menus = this.step7.get('abilities') as FormArray;
    this.recurseCheck(menus.controls, checked);
  }
  oncFullAccessChange({checked, value}) {
    let menus = this.step8.get('cabilities') as FormArray;
    this.recurseCheck(menus.controls, checked);
  }

  toggleFullAccess(checked) {
    const abilities = this.step7.get('abilities') as FormArray;
    abilities.at(0).get('checked').setValue(checked, {emitEvent: false});
  }
  togglecFullAccess(checked) {
    const cabilities = this.step8.get('cabilities') as FormArray;
    cabilities.at(0).get('checked').setValue(checked, {emitEvent: false});
  }

  recurseCheck(items, checked) {
    items.map( (item: FormGroup) => {
        
      if(item.get('title').value !== 'full_access') {
        item.get('checked').setValue(checked, {emitEvent: false});
        const childs = item.get('children') as FormArray;

        if(childs && childs.length) {
          this.recurseCheck(childs.controls, checked);
        }
      }

    })
  }

  onAccessMenuChange(menus) {

    const menusWithoutFullaccess = menus.filter(item => item.title !== 'full_access');
    
    const allChecked = [];
    const debounceChecked = _.debounce(this.toggleFullAccess, 100);

    const recurseChecked = function(_menus: Array<any>, _checked) {

      if(_menus && _menus.length) {

        _menus.map(i => {

          _checked.push(i.checked);

          if(_checked.includes(false)) {
            debounceChecked(false);
          } else {
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
  oncAccessMenuChange(menus) {

    const menusWithoutFullaccess = menus.filter(item => item.title !== 'full_access');
    
    const allChecked = [];
    const debounceChecked = _.debounce(this.togglecFullAccess, 100);

    const recurseChecked = function(_menus: Array<any>, _checked) {

      if(_menus && _menus.length) {

        _menus.map(i => {

          _checked.push(i.checked);

          if(_checked.includes(false)) {
            debounceChecked(false);
          } else {
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

  buildFullAccessTogle() {
    return this.formBuilder.group({
      title: 'full_access',
      name: 'Full Access',
      value: 'full_access',
      children: this.formBuilder.array([]),
      checked: false,
      depth: 0
    })
  }

  recurseMenus(menus, form: FormArray, maxDepth = 0, depth = 0) {

    menus.map(item => {
      
      let menu = this.formBuilder.group({
        title: item.value,
        name: item.name,
        value: item.value,
        children: this.formBuilder.array([]),
        checked: false,
        depth: depth,
      });

      form.push(menu);

      if(item.children && item.children.length && maxDepth > depth) {
        let child = menu.controls['children'] as FormArray;
        this.recurseMenus(item.children, child, maxDepth, depth + 1);
      }

    })
  }
  recursecMenus(menus, form: FormArray, maxDepth = 0, depth = 0) {

    menus.map(item => {
      
      let menu = this.formBuilder.group({
        title: item.value,
        name: item.name,
        id:item.id,
        value: item.value,
        children: this.formBuilder.array([]),
        checked: false,
        depth: depth,
      });

      form.push(menu);

      if(item.children && item.children.length && maxDepth > depth) {
        let child = menu.controls['children'] as FormArray;
        this.recursecMenus(item.children, child, maxDepth, depth + 1);
      }

    })
  }

  validateStep(currentStep) {
    let field;
    switch (currentStep) {
      case 1: this.step1; break;
      case 2: this.step2; break;
      case 3: this.step3; break;
      case 4: this.step4; break;
      case 5: this.step5; break;
      case 6: this.step6; break;
      case 7: this.step7; break;
      case 8: this.step8; break;
      case 9: this.step9; break;
    }

    if (!field) return;

    commonFormValidator.validateAllFields(field);
  }

  onToggle({checked, item, depth}) {
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
  getcAbilities(menus, child) {

    menus.map(item => {
      
      if(item.checked) {
        item.children = this.getcAbilities(item.children, []);
        child.push({title: item.title,id:item.id ,children: item.children });

      }

    });
    return child;

  }

  mapingBody(body) {
    let fullaccess = _.find(body.abilities, item => item.value === 'full_access');
    let abilities = body.abilities.filter(item => item.value !== 'full_access');
    let cfullaccess = _.find(body.cabilities, item => item.value === 'full_access');
    let cabilities = body.cabilities.filter(item => item.value !== 'full_access');
    let _body = {
      code: body.country_id,
      locale: body.locale,
      name: body.name,
      language_id: body.language_id,
      phone_code: body.phone_code,
      phone_min_length: body.phone_code_min_length,
      phone_max_length: body.phone_code_max_length,
      currencies: {
        symbol: body.symbol,
        decimal: body.decimal,
        thousand_separator: body.currency_thousand_separator,
        decimal_separator: body.currency_decimal_separator
      },
      point_valuation: body.point_valuation,
      customer_service: body.customer_service,
      access_menu: [
        {
          type: "retailer",
          fullaccess: fullaccess.checked,
          abilities: this.getAbilities(abilities, []),
        }
      ],
      categories_menu : [
        {
          type: "retailer",
          fullaccess: cfullaccess.checked,
          cabilities: this.getcAbilities(cabilities, []),
        }
      ],
      force_logout_service: body.force_logout_service,
    }

    return _body;
  }

  submit() {
    
    this.submiting = true;

    let rawValues = {};
    Object.assign(rawValues, this.step1.getRawValue());
    Object.assign(rawValues, this.step2.getRawValue());
    Object.assign(rawValues, this.step3.getRawValue());
    Object.assign(rawValues, this.step4.getRawValue());
    Object.assign(rawValues, this.step5.getRawValue());
    Object.assign(rawValues, {customer_service: [this.step6.getRawValue()] });
    Object.assign(rawValues, this.step7.getRawValue());
    Object.assign(rawValues, this.step8.getRawValue());
    Object.assign(rawValues, {force_logout_service: [this.step9.getRawValue()] });
    let body = this.mapingBody(rawValues);

    this.countrySetupService.create(body).subscribe(res => {
      
      this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
      this.router.navigate(["user-management", "countries"]);

    }, err => {

      this.submiting = false;

    });

  }

}
