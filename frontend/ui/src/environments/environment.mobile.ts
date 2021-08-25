
export const environment = {
  production: true,
  panoImageSizes: {
      preview: 256, // for web preview
      mobile: 1024, // for mobile pano
      web: 2048   // for desktop pano
  },
   apiUrl: '',
   socketServerEndPoint: 'http://www.guoyi5d.com/socket',
   mode: 'mobile', // web|mobile
   clientId: 1, // this is the real merchantId
   cacheTTL: 60 * 5 * 1000, // 5 minutes
};
