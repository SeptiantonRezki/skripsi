export class Utils {
  static formatPhoneNumber(phone) {
    if (phone.length <= 2) return phone;
    let sliceCodeNumber = parseInt(phone).toString();

    if ((phone.slice(0, 2) === "62")) {
      return sliceCodeNumber.slice(0, 2);
    }
    return phone;
  }

  static getPhoneCode(country_code, phone_code?){
    const temp = {
      'ID' : {phone_code: '+62'},
      'KH' : {phone_code: '+855'},
      'PH' : {phone_code: '+63'},
    };

    if (phone_code) {
      const code = Object.keys(temp).find(item => phone_code.includes(temp[item].phone_code));
      return temp[code].phone_code;
    }

    return temp[country_code].phone_code;
  }

  static reMaskInput(value, totalShowChar) {
    let newValue = '';
    for (let i = 0; i < value.length; i++) {
      newValue += (i >= (value.length - totalShowChar)) ? value[i] : '*';
    }
    return newValue;
  }
}
