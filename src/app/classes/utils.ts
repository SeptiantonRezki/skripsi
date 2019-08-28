export class Utils {
  static formatPhoneNumber(phone) {
    if (phone.length <= 2) return phone;
    let sliceCodeNumber = parseInt(phone).toString();

    if ((phone.slice(0, 2) === "62")) {
      return sliceCodeNumber.slice(0, 2);
    }
    return phone;
  }
}
