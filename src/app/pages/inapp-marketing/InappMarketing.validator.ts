import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export interface ValidationResult {
    [key: string]: boolean;
}

export class InappMarketingValidator {

    public static requiredIf(predicate) {
        return (control: FormControl): ValidationResult => {
            if (!control.parent) {
                return null;
            }
            if (predicate()) {
                return Validators.required(control); 
            }
            return null;
        }
    }
}