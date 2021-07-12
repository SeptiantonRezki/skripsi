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
  cognito_login_url: 'https://ayo-principal-dev.auth.ap-southeast-1.amazoncognito.com/oauth2/authorize?identity_provider=ayo-principal-dev&redirect_uri=https://hms.dev.src.id/login&response_type=CODE&client_id=1oe00f63c64c3lpseof1bgcuah&scope=aws.cognito.signin.user.admin email openid phone profile',
  show_gtm: false,
  SRC_KATALOG_KOIN_BASE_IFRAME_URL: 'https://hms-react.ayo-micro.dxtr.asia'
  // SRC_KATALOG_KOIN_BASE_IFRAME_URL: 'http://localhost:3000'
};

export const serviceServer = (server) => {
  return `https://${server}.ayo-micro.dxtr.asia`;
}

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
}