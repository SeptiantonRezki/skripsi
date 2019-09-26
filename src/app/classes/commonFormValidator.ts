import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  FormArray
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
}
