/**
 * AYO Sampoerna Base Endpoint class
 * DXTR ASIA
 *
 */

// Define API URL and API Version Here
/**
 * AYO Sampoerna Staging
 *
 */
//const AYO_API = 'http://192.168.2.228/api';
const AYO_API = "https://ayo-api.dxtr.asia";
const type_api = "principal";

export class Endpoint {
  getUrl(namespace, key, context) {
    /**
     * Endpoint Object you can create object based on endpoint namespace
     * example the namespace of endpoint is user you can create user object on endpoint base object
     * You can create key inside endpoint namespace, key is defined as endpoint namespace key
     * example url is user/profile
     * you can create object like this
     * user : {
     *   profile:`${AYO_API}/api/${API_VERSION}/user/profile`
     * }
     * @type {Object}
     */

    const ENDPOINT = {
      // page: {
      //   pages: `${AYO_API}/api/${API_VERSION}/pages`,
      //   subpages: `${AYO_API}/api/${API_VERSION}/pages/${context.slug_name}/subpages`,
      //   detail: `${AYO_API}/api/${API_VERSION}/pages/${context.page_id}`
      // }
      authentication: {
        verify_isms: `${AYO_API}/api/source/customer/${context.business_code}/${
          context.phone
        }`,
        store_user: `${AYO_API}/api/${type_api}/user`,
        //login: `${AYO_API}/oauth/token` ,
        login: `${AYO_API}/api/${type_api}/token`,
        verify_code: `${AYO_API}/api/general/otp/verify-account`,
        me: `${AYO_API}/oauth/user`,
        resend_otp: `${AYO_API}/api/general/otp/send`,
        reset_password: `${AYO_API}/api/general/otp/reset-password`,
        change_password: `${AYO_API}/api/general/otp/change-password`,
        logout: `${AYO_API}/oauth/token/revoke`
      },
      retailer: {
        list_level: `${AYO_API}/api/${type_api}/level`,
        list_shipping: `${AYO_API}/api/${type_api}/shipping`,
        create: `${AYO_API}/api/${type_api}/retailer`,
        get: `${AYO_API}/api/${type_api}/retailer`,
        deactivate: `${AYO_API}/api/${type_api}/${
          context.retailer_id
        }/deactivate`,
        update: `${AYO_API}/api/${type_api}/retailer/${context.retailer_id}`
      },
      admin_principal: {
        get: `${AYO_API}/api/${type_api}/user/principal`,
        create: `${AYO_API}/api/${type_api}/user/principal`,
        put: `${AYO_API}/api/${type_api}/user/principal/${
          context.principal_id
        }`,
        delete: `${AYO_API}/api/${type_api}/user/principal/${
          context.principal_id
        }`,
        list_role: `${AYO_API}/api/${type_api}/user/role`
      }
    };
    return ENDPOINT[namespace] && ENDPOINT[namespace][key];
  }
}
