export const environment = {
  production: true,
  server: 'https://dev.ayo-api.dxtr.asia',
  server_service: 'https://dev.ayo-api.dxtr.asia',
  label: "DEVELOPMENT",
  show_label: true,
  image: "assets/images/ayo/icon/dev.png",
  image_2x: "assets/images/ayo/icon/dev@2x.png 2x",
  backgroundImage: "assets/images/ayo/header/Header-Color-Blue@2x.jpg",
  qiscus_appIdMC: 'zova-efc1mal9p9cjurph', //Staging
  qiscus_appId: 'ayosrc-8lv9mbp2ce6iwr',
  cognito_login_url: 'https://ayo-principal-dev.auth.ap-southeast-1.amazoncognito.com/oauth2/authorize?identity_provider=ayo-principal-dev&redirect_uri=https://hms.dev.src.id/login&response_type=CODE&client_id=1oe00f63c64c3lpseof1bgcuah&scope=aws.cognito.signin.user.admin email openid phone profile'
};

export const serviceServer = (server) => {
  return `https://${server}.ayo-micro.dxtr.asia`;
}
// export const serviceServer = (server, paths = [], env='ayo-micro') => {
//   let path = (paths.length) ? `${paths.join('.')}.` : '';
//   let _env = (env) ? `${env}.` : '';
//   return `https://${server}.${path}${_env}dxtr.asia`;
// }

export const server = {
  user: 'user',
  business: 'business',
  area: 'area',
  auth: 'auth',
  newsfeed: 'newsfeed',
  banner: 'banner',
  content: 'content',
  product: 'product',
  task: 'task',
  submission: 'submission',
  coin: 'coin',
  community: 'community',
  order: 'order',
  orderCashier: 'cashier-order',
  productCashier: "cashier-product",
  export: 'export',
};


/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

