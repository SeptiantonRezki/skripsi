import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { FeatureLevelService } from 'app/services/settings/feature-level.service';
import { TingkatFiturTreeData, TingkatFiturNode } from '../tree/tingkat-fitur-tree-data.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';

@Component({
  selector: 'app-tingkat-fitur-form',
  templateUrl: './tingkat-fitur-form.component.html',
  styleUrls: ['./tingkat-fitur-form.component.scss'],
})
export class TingkatFiturFormComponent implements OnInit {
  id = null;
  form: FormGroup;
  actionType: string = 'create';
  onLoad:boolean;
  availablePermissions: any[];
  disabled: boolean = false;


  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private featureLevelService: FeatureLevelService,
    private dataService: DataService,
    private tingkatFiturTreeData: TingkatFiturTreeData,
    private dialogService: DialogService,
    private router: Router
  ) {

    this.onLoad = true;


    this.form = formBuilder.group({

      name: ['', Validators.required],
      type: ['wholesaler', Validators.required],
      permissions: [[], Validators.required],
    });

    activatedRoute.params.subscribe(({id}) => {
      if (id) {

            this.id = id;
            this.getDetails(id);

      } else {
        this.featureLevelService.getAvailablePermissions().subscribe(({data}) => {
          this.initCheckboxRoles(data);
        });
      }

    })
    activatedRoute.url.subscribe(params => {
      const actionType = params[1].path
      this.actionType = actionType;
      if (actionType === 'detail') this.disable();

    });

  }

  ngOnInit() {
    
  }
  disable() {
    this.form.disable();
    this.disabled = true;
  }

  initCheckboxRoles(roles: any[]) {
    
    const tingkatFiturNode = this.tingkatFiturTreeData.buildFileTree(roles, 0, ['menu','value']) as TingkatFiturNode[];
    this.tingkatFiturTreeData.dataChange.next(tingkatFiturNode);

  }



  getDetails(id) {
    this.featureLevelService.getDetail({id}).subscribe(({data}) => {
      if (data) {

        const selectedPermissions = this.flatenSelectedPermissions(data.role, 0, ['menu', 'value', 'value'], []);
        this.form.setValue({
          name: data.nama_akses,
          type: 'wholesaler',
          permissions: selectedPermissions
        });
        const permissions = this.tingkatFiturTreeData.buildFileTree(data.role, 0, ['menu', 'value', 'value']);
        
        this.tingkatFiturTreeData.dataChange.next(permissions);
        
        this.tingkatFiturTreeData.defaultSelectedChange.next(permissions);

        setTimeout(() => { this.onLoad = false }, 1000);
      }
      
    })
  }

  get permissions() {
    return this.form.get('permissions').value;
  }
  flatenSelectedPermissions(roles:any[], level:number, childKeys: any[], selected: any[]) {
    roles.map( role => {
      
      const targetChilds = role[childKeys[level]];

      if (role[childKeys[level]] && typeof role[childKeys[level]] === 'object' ) {
        
        this.flatenSelectedPermissions(targetChilds, level+1, childKeys, selected);

      } else {
        selected.push(role[childKeys[level]]);
      }
    });
    return selected;
  }
  onChecklistSelectionChange(selected) {
    this.form.get('permissions').setValue(selected);
    this.form.updateValueAndValidity();
  }
  submit(): void {

    if (this.form.valid) {
    
      this.dataService.showLoading(true);
      const payload = this.form.getRawValue();
      let handlerAction = this.featureLevelService.create(payload);
      
      if (this.actionType === 'edit') handlerAction = this.featureLevelService.put(payload, this.id);

      handlerAction.subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({ message: 'Data berhasil disimpan' });
        this.router.navigate(['settings', 'feature-level']);

      }, err => {

        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({ message: 'Terjadi kesalahan saat menyimpan data' });
      })

    } else {
      commonFormValidator.validateAllFields(this.form);
    }
  }

}
