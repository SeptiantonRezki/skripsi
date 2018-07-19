import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { commonFormValidator } from '../../../../classes/commonFormValidator';




@Component({
    selector   : 'admin-role-edit',
    templateUrl: './admin-role-edit.component.html',
    styleUrls  : ['./admin-role-edit.component.scss']
})
export class AdminRoleEditComponent
{   
    formdata: any;
    formdataErrors: any;
    constructor(private formBuilder:FormBuilder)
    {
    	this.formdata = {
    		nama:'Arisyi Zimah',
            email:'arisyi.zimah@gmail.com',
            role:'b'
    	};
        
        this.formdataErrors = {
    		nama:'',
            email:'',
            role:''
    	};
    }

    ngOnInit(){

    	this.formdataErrors = this.formBuilder.group({
    		nama:['',Validators.required],
            email:['',Validators.required],
    		role:['',Validators.required]            
    	});
		
    }
}
