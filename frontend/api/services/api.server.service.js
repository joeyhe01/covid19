var wrapper = require('./api_request_wrapper.server.service');

var sidecar = require('./sidecar.server.service');
const getUserInfoFromToken = function(token) {
    return sidecar.getUserInfoFromToken(token);
};

exports.post_sign_auth =  function(token, req, cb){
    wrapper.postRaw('/aws/sign_auth', token, req.query.to_sign, cb);
}

exports.post_pre_signed_url = function(token, s3Url, cb){
    wrapper.postRaw('/aws/presigned_s3_url', token, s3Url, cb);
}

exports.getS3UploaderSettings = function(token, cb) {
    let userObj = getUserInfoFromToken(token);
    let clientName = userObj['company'];
    let userName = userObj['name'];
    let url = '/aws/s3_config_settings';
    wrapper.get(url, token, cb);
}
exports.getActivate = function(hashedPassword,  cb){
    wrapper.get('/auth/activate/' + hashedPassword , null, cb);
}
exports.postUserSignUp = function(body,  cb){
    wrapper.post('/auth/signup', null, body, cb);
}
exports.postUserLogin = function(body,  cb){
    wrapper.post('/auth/login', null, body, cb);
}

exports.getCountryDaily = function(cb){
    wrapper.get('/daily_stat/country', null, cb );
}
exports.getProvinceDailyRor = function(countrySlug, cb){
    wrapper.get(`/daily_stat/country/${countrySlug}`, null, cb );
}
exports.getCityDailyRor = function(countrySlug, provinceSlug, cb){
    wrapper.get(`/daily_stat/country/${countrySlug}/${provinceSlug}`, null, cb );
}
exports.getDailyMaxStatsForCountry = function(countrySlug, cb){
    wrapper.get(`/daily_stat/country/${countrySlug}/dailystats`, null, cb );
}
exports.getProgressionForCountry= function(countrySlug, cb){
    wrapper.get(`/getProgression/${countrySlug}`, null, cb );
}
exports.getProgressionForProvince= function(countrySlug, provinceSlug, cb){
    wrapper.get(`/getProgression/${countrySlug}/${provinceSlug}`, null, cb );
}
exports.getProgressionForCity= function(countrySlug, provinceSlug, citySlug, cb){
    wrapper.get(`/getProgression/${countrySlug}/${provinceSlug}/${citySlug}`, null, cb );
}
