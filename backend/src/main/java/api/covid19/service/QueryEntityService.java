package api.covid19.service;

import api.covid19.entity.City;
import api.covid19.entity.Country;
import api.covid19.entity.Province;
import api.covid19.repository.CityRepository;
import api.covid19.repository.CountryRepository;
import api.covid19.repository.DailyRecordRepository;
import api.covid19.repository.ProvinceRepository;
import api.covid19.repository.QueryEntities.DailyMaxByCountry;
import api.covid19.repository.QueryEntities.DailyMaxByCountryProvince;
import api.covid19.repository.QueryEntities.DailyMaxByCountryProvinceCity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
@Service
public class QueryEntityService {
    @Autowired
    CountryService countryService;
    @Autowired
    ProvinceService provinceService;
    @Autowired
    CityService cityService;
    @Autowired
    DailyRecordRepository dailyRecordRepository;

    public DailyMaxByCountry getStats(String country) {
        Country c = countryService.getCountry(country);
        return dailyRecordRepository.getDailyMaxForCountry(c.getId());

    }
    public DailyMaxByCountryProvince getStats(String country, String province) {
        Country c = countryService.getCountry(country);
        Province p = provinceService.getProvince(province, c);
        return dailyRecordRepository.getDailyMaxByCountryAndProvince(c.getId(),p.getId());
    }
    public DailyMaxByCountryProvinceCity getStats(String country, String province, String city){
        Country c = countryService.getCountry(country);
        Province p = provinceService.getProvince(province, c);
        City cty = cityService.getCity(city, p);
        return dailyRecordRepository.getDailyMaxByCountryAndProvinceAndCity(c.getId(),p.getId(),cty.getId());
    }
}
