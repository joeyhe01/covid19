module.exports = function(app) {
    var apiController = require('../controllers/api.server.controller');
    //this is to use signAuth soluiton, UI is evaporateJS
    app.route('/api/aws/sign_auth').get(apiController.get_sign_auth);
    app.route('/api/aws/presigned_s3_url').post(apiController.post_pre_signed_url);

    app.route('/api/daily_stat/country').get(apiController.get_country_daily);
    app.route('/api/daily_stat/country/:countrySlug').get(apiController.getProvinceDailyRor);
    app.route('/api/daily_stat/country/:countrySlug/dailystats').get(apiController.getDailyMaxStatsForCountry);
    app.route('/api/daily_stat/country/:countrySlug/:provinceSlug').get(apiController.getCityDailyRor);

    
    app.route('/api/getProgression/:countrySlug').get(apiController.getProgressionForCountry);
    app.route('/api/getProgression/:countrySlug/:provinceSlug').get(apiController.getProgressionForProvince);
    app.route('/api/getProgression/:countrySlug/:provinceSlug/:citySlug').get(apiController.getProgressionForCity);
};
