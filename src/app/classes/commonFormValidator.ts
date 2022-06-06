import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  FormArray,
  ValidatorFn,
  ValidationErrors
} from "@angular/forms";

export class commonFormValidator {
  public static parseFormChanged(form, formError) {
    {
      for (const field in formError) {
        if (!formError.hasOwnProperty(field)) {
          continue;
        }

        // Clear previous errors
        formError[field] = {};

        // Get the control
        const control = form.get(field);

        if (control && control.dirty && !control.valid) {
          formError[field] = control.errors;
        }
      }
    }
  }

  public static passwordConfirming(c: AbstractControl): { invalid: boolean } {
    if (c.get("password").value !== c.get("confirm_password").value) {
      return { invalid: true };
    }
  }

  public static validateAllFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFields(control);
      } else if (control instanceof FormArray) {
        if (control.controls.length > 0) this.validateFormArray(control);
      }
    });
  }

  public static validateFormArray(formArray: FormArray) {
    for (let control of formArray.controls) {
      if (control instanceof FormControl) {
        // is a FormControl
        control.markAsTouched({ onlySelf: true });
      }
      if (control instanceof FormGroup) {
        // is a FormGroup
        this.validateAllFields(control);
      }
      if (control instanceof FormArray) {
        // is a FormArray
        if (control.controls.length > 0) this.validateFormArray(control);
      }
    }
  }

  public static validateFormControl(formControl: FormControl) {
    if (formControl instanceof FormControl) {
      formControl.markAsTouched({ onlySelf: true });
    }
  }

  public static passwordRequirement(control: AbstractControl) {
    const password: string = control.value;
    console.log('password value');
    if (control.value && control.value.length > 0) {
      if (password.match(/[a-z]/g) && password.match(
        /[A-Z]/g) && password.match(
          /[0-9]/g) && password.length >= 8) {
        console.log('ist oke 2?');
        return null;
      } else {
        // control.setErrors({ notValid: true });
        console.log('control', control);
        return { notValid: true };
      }
    } else {
      console.log('ist oke ?');
      return null;
    }
  }

  public static markAllAsTouched(formGroup: FormGroup): void {
    (Object as any).values(formGroup.controls).forEach((control: any) => {
      control.markAsTouched();
      if (control.controls) {
        this.markAllAsTouched(control);
      }
    });
  }

  public static isEqual(control1: string, control2: string): ValidatorFn {
    return (control: AbstractControl): null => {
      const form = control as FormGroup;
      const controlValue1 = form.get(control1).value;
      const controlValue2 = form.get(control2).value;

      if (controlValue1 && controlValue2 && controlValue1 !== controlValue2) {
        form.get(control2).setErrors({ notEqual: true });
      }

      return null;
    };
  }

  public static validators(form: AbstractControl, field: string, rules?: any) {
    if (rules) form.get(field).setValidators(rules);
    else form.get(field).clearValidators();
    form.get(field).updateValueAndValidity();
  }
}
