import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { commonFormValidator } from '../../../../classes/commonFormValidator';




@Component({
    selector   : 'admin-user-create',
    templateUrl: './admin-user-create.component.html',
    styleUrls  : ['./admin-user-create.component.scss']
})
export class AdminUserCreateComponent
{
	// Vertical Stepper
    verticalStepperStep1: FormGroup;
	verticalStepperStep2: FormGroup;
	
    verticalStepperStep1Errors: any;
    verticalStepperStep2Errors: any;
    constructor(private formBuilder:FormBuilder)
    {
    	this.verticalStepperStep1Errors = {
    		nama:'',
    		email:''
    	};
    	this.verticalStepperStep2Errors = {
    		role:''
    	};
        
    }

    ngOnInit(){
    	this.verticalStepperStep1 = this.formBuilder.group({
    		nama:['',Validators.required],
    		email:['',Validators.required]
    	});
		
		this.verticalStepperStep2 = this.formBuilder.group({
    		role:['',Validators.required]
    	});

    	this.verticalStepperStep1.valueChanges.subscribe(() => {
            commonFormValidator.parseFormChanged(this.verticalStepperStep1,this.verticalStepperStep1Errors);
		});
		
        this.verticalStepperStep2.valueChanges.subscribe(() => {
        	commonFormValidator.parseFormChanged(this.verticalStepperStep2,this.verticalStepperStep2Errors);
        });
        
        // this.verticalStepperStep3.valueChanges.subscribe(() => {
        // 	commonFormValidator.parseFormChanged(this.verticalStepperStep3,this.verticalStepperStep3Errors);
        // });
    }

}
