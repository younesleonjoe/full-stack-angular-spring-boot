import { FormControl, ValidationErrors } from '@angular/forms';

export class CustomValidators {
  static notOnlyWhitespace(control: FormControl): ValidationErrors | null {
    /*
      If validation check fails then return ValidationErrors
      If validation check passes return null
     */

    if (control.value != null && control.value.trim().length === 0) {
      // Invalid, return error object
      return { notOnlyWhitespace: true };
    }

    return null;
  }
}
