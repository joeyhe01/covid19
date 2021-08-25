var apiService = require('../services/api.server.service');
var sidecar = require('../services/sidecar.server.service');

exports.get_sign_auth=function(req, res, next){
    apiService.post_sign_auth(sidecar.getToken(req),req, function(err, data) {
        if (err) {
            return next(err);
        }
        res.send(data);
    });
}

exports.post_pre_signed_url = function(req, res, next){
    console.log('requ body is: ', req.body)
    apiService.post_pre_signed_url(sidecar.getToken(req), req.body.url, function(err, data) {
        if (err) {
            return next(err);
        }
        res.send(data);
    });
}

exports.get_country_daily=function(req, res, next){
    apiService.getCountryDaily((err,data)=>{
        if (err) {
            return next(err);
        }
        res.send(data);
    });
}

exports.getProvinceDailyRor = function(req, res, next){
    apiService.getProvinceDailyRor(req.params.countrySlug, (err,data)=>{
        if (err) {
            return next(err);
        }
        res.send(data);
    });
}


exports.getCityDailyRor = function(req, res, next){
    apiService.getCityDailyRor(req.params.countrySlug, req.params.provinceSlug, (err,data)=>{
        if (err) {
            return next(err);
        }
        res.send(data);
    });
}


exports.getDailyMaxStatsForCountry = function(req, res, next){
    apiService.getDailyMaxStatsForCountry(req.params.countrySlug, (err,data)=>{
        if (err) {
            return next(err);
        }
        res.send(data);
    });
}
exports.getDailyMaxStatsForProvince = function(req, res, next){
    apiService.getDailyMaxStatsForProvince(req.params.provinceSlug, (err,data)=>{
        if (err) {
            return next(err);
        }
        res.send(data);
    });
}

exports.getProgressionForCountry = function(req, res, next){
    apiService.getProgressionForCountry(req.params.countrySlug, (err,data)=>{
        if (err) {
            return next(err);
        }
        res.send(data);
    });
}
exports.getProgressionForProvince = function(req, res, next){
    apiService.getProgressionForProvince(req.params.countrySlug, req.params.provinceSlug, (err,data)=>{
        if (err) {
            return next(err);
        }
        res.send(data);
    });
}
exports.getProgressionForCity = function(req, res, next){
    apiService.getProgressionForCity(req.params.countrySlug, req.params.provinceSlug, req.params.citySlug, (err,data)=>{
        if (err) {
            return next(err);
        }
        res.send(data);
    });
}
