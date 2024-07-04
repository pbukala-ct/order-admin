/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptionsForCustomView}
 */
const config = {
  name: 'Integration Views',
  cloudIdentifier: '${env:CLOUD_IDENTIFIER}',
  env: {
    development: {
      initialProjectKey: 'country-road',
      hostUriPath: '/country-road/orders/7c3af889-d1b3-45d7-b260-4994a0d11eca/general'
      // hostUriPath: '/tech-sales-fashion-store/customers/d4245e5d-a986-4307-ac9a-df2246736d3a/general'
    },
    production: {
      customViewId: '${env:CUSTOM_VIEW_ID}',
      url: '${env:APPLICATION_URL}',
    },
  },
  headers: {
    csp: {
      'connect-src': [
        'https://www.google.com/',
      ],
      'frame-src': [
        'https://www.google.com/',
      ],
    }
  },
  oAuthScopes: {
    view: ['view_orders', 'view_customers'],
    manage: ['manage_orders'],
  },
  type: 'CustomPanel',
  typeSettings: {
    size: 'LARGE',
  },
  locators: ['orders.order_details.general'],
};

export default config;
