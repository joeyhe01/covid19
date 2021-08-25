/*************************************************************************
 *
 * Copyright (c) 2016, DATAVISOR, INC.
 * All rights reserved.
 * __________________
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of DataVisor, Inc.
 * The intellectual and technical concepts contained
 * herein are proprietary to DataVisor, Inc. and
 * may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from DataVisor, Inc.
 */

package api.covid19.controllers;

import api.covid19.entity.City;
import api.covid19.entity.DailyRecord;
import api.covid19.entity.Province;
import api.covid19.repository.QueryEntities.DailyMaxByCountry;
import api.covid19.repository.QueryEntities.DailyMaxByCountryProvince;
import api.covid19.repository.QueryEntities.DailyMaxByCountryProvinceCity;
import api.covid19.repository.QueryEntities.RecordProgression;
import api.covid19.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class Controllers {
    @Autowired
    DailyRecordService dailyRecordService;
    @Autowired
    CountryService countryService;
    @Autowired
    ProvinceService provinceService;
    @Autowired
    CityService cityService;
    @Autowired
    QueryEntityService queryEntityService;

    @GetMapping("/daily_stat/country")
    public List<DailyMaxByCountry> getDailyStatCountry() {
        return dailyRecordService.getDailyStatCountry();
    }

    @GetMapping("/daily_stat/country/{countrySlug}/dailystats")
    public List<DailyMaxByCountry> getDailyMaxStatsForCountry(@PathVariable String countrySlug) {
        return dailyRecordService.getDailyMaxStatsForCountry(countrySlug);
    }

    @GetMapping("/daily_stat/country/{countrySlug}")
    public List<DailyMaxByCountryProvince> getDailyMaxStatForProvinceOfCountry(
            @PathVariable String countrySlug) {
        return dailyRecordService.getDailyMaxStatForProvinceOfCountry(
                countryService.getBySlug(countrySlug)
        );
    }

    @GetMapping("/daily_stat/country/{countrySlug}/{provinceSlug}")
    public List<DailyMaxByCountryProvinceCity> getDailyMaxStatForCityOfProvince(
            @PathVariable String provinceSlug, @PathVariable String countrySlug) {
        return dailyRecordService.getDailyMaxStatForCityOfProvince(
                countryService.getBySlug(countrySlug), provinceService.getProvinceBySlug(provinceSlug, countryService.getBySlug(countrySlug))
        );
    }

    @GetMapping("/daily_stat/provinces")
    public List<DailyMaxByCountryProvince> getDailyStatProvinces() {
        return dailyRecordService.getDailyStatProvinces();
    }

    @GetMapping("/daily_stat/cities")
    public List<DailyMaxByCountryProvinceCity> getDailyStatCities() {
        return dailyRecordService.getDailyStatCities();
    }

    @GetMapping("/getProvinces/{country}")
    List<Province> provinces(@PathVariable String country) {
        return provinceService.provinces(country);
    }

    @GetMapping("/getCities/{country}/{province}")
    List<City> cities(@PathVariable String province, @PathVariable String country) {
        return cityService.cities(province, country);
    }

    @GetMapping("/getStats/{country}")
    public DailyMaxByCountry getStats(@PathVariable String country) {
        return queryEntityService.getStats(country);
    }

    @GetMapping("getStats/{country}/{province}")
    public DailyMaxByCountryProvince getStats(@PathVariable String country,
            @PathVariable String province) {
        return queryEntityService.getStats(country, province);
    }

    @GetMapping("getStats/{country}/{province}/{city}")
    public DailyMaxByCountryProvinceCity getStats(@PathVariable String country,
            @PathVariable String province, @PathVariable String city) {
        return queryEntityService.getStats(country, province, city);
    }

    @GetMapping("getProgression/{countryslug}")
    public List<DailyRecord> recordProgression(@PathVariable String countryslug) {
        return dailyRecordService.getRecords(countryslug);
    }

    @GetMapping("getProgression/{country}/{province}")
    public List<DailyRecord> recordProgression(@PathVariable String country,
            @PathVariable String province) {
        return dailyRecordService.getRecords(country, province);
    }

    @GetMapping("getProgression/{country}/{province}/{city}")
    public List<DailyRecord> recordProgression(@PathVariable String country,
            @PathVariable String province, @PathVariable String city) {
        return dailyRecordService.getRecords(country, province, city);
    }

    @GetMapping("recentTotal/{country}/{date}")
    public RecordProgression getTotal(@PathVariable String country, @PathVariable String date) {
        return dailyRecordService.getRecentProgression(country, date);
    }

    @GetMapping("recentTotal/{country}/{province}/{date}")
    public RecordProgression getTotal(@PathVariable String country, @PathVariable String province,
            @PathVariable String date) {
        return dailyRecordService.getRecentProgression(country, province, date);
    }
}
