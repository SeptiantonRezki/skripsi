export class commonFormValidator{
   
   public static parseFormChanged(form,formError){
   	 {
        for ( const field in formError )
        {
            if ( !formError.hasOwnProperty(field) )
            {
                continue;
            }

            // Clear previous errors
            formError[field] = {};

            // Get the control
            const control = form.get(field);

            if ( control && control.dirty && !control.valid )
            {
                formError[field] = control.errors;
            }
        }
    }
   }
}