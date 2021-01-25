import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export interface ValidationResult {
    [key: string]: boolean;
}

export class PasswordValidator {

    public static strong(control: FormControl): ValidationResult {
        let hasNumber = /\d/.test(control.value);
        let hasUpper = /[A-Z]/.test(control.value);
        // let hasLower = /[a-z]/.test(control.value);
        let hasSpecialChars = (!/^[^`~!@#$%\^&*()_+={}|[\]\\:';"<>?,./]*$/.test(control.value));
        // let hasSpecialChars = /^[a-zA-Z0-9!@#$%^&*()]+$/.test(control.value)
        // console.log('Num, Upp, Low', hasNumber, hasUpper, hasLower);
        const valid = (hasNumber && hasUpper) || (hasNumber && hasSpecialChars) || (hasUpper && hasSpecialChars);
        if (!valid) {
            // return what´s not valid
            return { strong: true };
        }
        return null;
    }
    public static specialChar(control: FormControl): ValidationResult {
        if (!/^[^`~!@#$%\^&*()_+={}|[\]\\:';"<>?,./]*$/.test(control.value)) {
            return null;
        }
        return { specialchar: true };
    }
    public static matchValues(val1: string, val2: string) {
        return (group: FormGroup) => {
            let _val1 = group.get(val1).value;
            let _val2 = group.get(val2).value;

            return _val1 === _val2 ? null : { notMatch: true }
            // console.log({ group, val1, val2 });
            // return null
        }
    }
    // public static matchValues(matchTo: string): (AbstractControl) => ValidationErrors | null {
    //     return (control: AbstractControl): ValidationErrors | null => {
    //         return !!control.parent &&
    //             !!control.parent.value &&
    //             control.value === control.parent.controls[matchTo].value
    //             ? null
    //             : { notMatch: true };
    //     };
    // }
}