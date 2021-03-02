// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  server: 'https://dev.ayo-api.dxtr.asia',
  server_service: 'https://dev.ayo-api.dxtr.asia',
  label: 'DEVELOPMENT',
  show_label: true,
  image: 'assets/images/ayo/icon/dev.png',
  image_2x: 'assets/images/ayo/icon/dev@2x.png 2x',
  backgroundImage: 'assets/images/ayo/header/Header-Color-Blue@2x.jpg',
  localDev: 'http://sampoerna.local',
  qiscus_appIdMC: 'zova-efc1mal9p9cjurph', //Staging
  qiscus_appId: 'ayosrc-8lv9mbp2ce6iwr',
  cognito_login_url: 'https://ayo-principal-qa.auth.ap-southeast-1.amazoncognito.com/oauth2/authorize?identity_provider=ayo-principal-qa&redirect_uri=https://hms.dev.src.id/login&response_type=CODE&client_id=3h4042k701id4jimgf4or1jd14&scope=aws.cognito.signin.user.admin email openid phone profile'
};

export const serviceServer = (server) => {
  return `https://${server}.ayo-micro.dxtr.asia`;
};

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
};


/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
