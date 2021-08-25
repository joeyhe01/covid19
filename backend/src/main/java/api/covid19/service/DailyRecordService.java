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

package api.covid19.service;

import api.covid19.entity.*;
import api.covid19.repository.DailyRecordRepository;
import api.covid19.repository.QueryEntities.DailyMaxByCountry;
import api.covid19.repository.QueryEntities.DailyMaxByCountryProvince;
import api.covid19.repository.QueryEntities.DailyMaxByCountryProvinceCity;
import api.covid19.repository.QueryEntities.RecordProgression;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DailyRecordService {
    @Autowired
    CountryService countryService;
    @Autowired
    CityService cityService;
    @Autowired
    ProvinceService provinceService;
    @Autowired
    DailyRecordRepository dailyRecordRepository;

    public long getTotalRecords() {
        return this.dailyRecordRepository.count();
    }

    private HashMap<Id, DailyRecordMapper> recentMap = new HashMap<>();

    public DailyRecord getLatestRecordForCountry(Country country) {
        return dailyRecordRepository.findFirstByCountryOrderByDateDesc(country);
    }

    @Data
    private class Id {
        String country;
        String province;
        String city;

        public Id(DailyRecordMapper record) {
            this.country = record.getCountry();
            this.province = record.getProvince();
            this.city = record.getCity();
        }
    }

    public void removeDataBefore(Integer days) {
        Calendar cal = Calendar.getInstance();
        Date today = cal.getTime();
        cal.add(Calendar.DATE, -1 * days);
        java.sql.Date lastDate = new java.sql.Date(cal.getTimeInMillis());
        System.out.println("remove data before: " + lastDate.toString());
        this.dailyRecordRepository.deleteByDateBefore(lastDate.toString());
    }

    public void processDailyRecords(List<DailyRecordMapper> dailyRecordMappers) {

        List<DailyRecord> dailyRecords = new ArrayList<>();

        for (DailyRecordMapper dailyRecordMapper : dailyRecordMappers) {

            Country country = countryService.getByCode(dailyRecordMapper.getCountryCode());
            Province province = null;
            if (!dailyRecordMapper.getProvince().equals("")) {
                province = provinceService.get(dailyRecordMapper.getProvince(), country);
            }
            City city = null;
            if (!dailyRecordMapper.getCity().equals("")) {
                city = cityService
                        .get(dailyRecordMapper.getCity(), dailyRecordMapper.getCityCode(),
                                province);
            }

            DailyRecord dailyRecord = new DailyRecord();
            dailyRecord.setCountry(country);
            dailyRecord.setProvince(province);
            dailyRecord.setCity(city);
            dailyRecord.setLat(Float.parseFloat(dailyRecordMapper.getLat()));
            dailyRecord.setLon(Float.parseFloat(dailyRecordMapper.getLon()));
            dailyRecord.setActive(dailyRecordMapper.getActive());
            dailyRecord.setConfirmed(dailyRecordMapper.getConfirmed());
            dailyRecord.setDeaths(dailyRecordMapper.getDeaths());
            dailyRecord.setRecovered(dailyRecordMapper.getRecovered());
            dailyRecord.setDate(dailyRecordMapper.getDate().substring(0, 10));
            setDailyConfirmed(dailyRecordMapper);

            dailyRecord.setDailyRecoveredGrowth(dailyRecordMapper.getDailyRecovered());
            dailyRecord.setDailyDeathGrowth(dailyRecordMapper.getDailyDeaths());
            dailyRecord.setDailyActiveGrowth(dailyRecordMapper.getDailyActive());
            dailyRecord.setDailyConfirmedGrowth(dailyRecordMapper.getDailyConfirmed());

            dailyRecords.add(dailyRecord);
            //System.out.println(dailyRecord.compareOrigin(prevRecord));

        }

        dailyRecordRepository.saveAll(dailyRecords);
    }

    private DailyRecordMapper getRecent(DailyRecordMapper record) {

        Id id = new Id(record);
        if (recentMap.get(id) != null) {
            return recentMap.get(id);
        }
        return null;
    }

    public DailyRecordMapper setDailyConfirmed(DailyRecordMapper record) {
        DailyRecordMapper prev = getRecent(record);
        if (prev == null) {
            record.setDailyConfirmed(record.getConfirmed());
            record.setDailyDeaths(record.getDeaths());
            record.setDailyRecovered(record.getRecovered());
            record.setDailyActive(record.getActive());

        } else {
            record.setDailyConfirmed(record.getConfirmed() - prev.getConfirmed());
            record.setDailyDeaths(record.getDeaths() - prev.getDeaths());
            record.setDailyRecovered(record.getRecovered() - prev.getRecovered());
            record.setDailyActive(record.getActive() - prev.getActive());

        }
        recentMap.put(new Id(record), record);
        return record;
    }

    public void fillMap(DailyRecordMapper record) {
        recentMap.put(new Id(record), record);
    }

    public List<DailyMaxByCountry> getDailyStatCountry() {
        return this.dailyRecordRepository.getDailyMaxForAllCountries();
    }

    public List<DailyMaxByCountryProvince> getDailyMaxStatForProvinceOfCountry(Country country) {
        return this.dailyRecordRepository.getDailyMaxForAllProvincesInCountry(country.getId());
    }

    public List<DailyMaxByCountryProvinceCity> getDailyMaxStatForCityOfProvince(Country country, Province province) {
        return this.dailyRecordRepository.getDailyMaxForAllCitiesInProvince(country.getId(), province.getId());
    }

    public List<DailyMaxByCountryProvince> getDailyStatProvinces() {
        return this.dailyRecordRepository.getDailyMaxByCountriesAndProvinces();
    }

    public List<DailyMaxByCountryProvinceCity> getDailyStatCities() {
        return this.dailyRecordRepository.getDailyMaxByCountriesAndProvincesAndCities();
    }

    public List<DailyRecord> getRecords(String countryslug) {
        Country c = countryService.getBySlug(countryslug);
        return dailyRecordRepository
                .findAllByCountryAndProvinceIsNullAndCityIsNullOrderByDateDesc(c);

    }

    public List<DailyRecord> getRecords(String country, String province) {
        Country c = countryService.getCountry(country);
        Province p = provinceService.getProvince(province, c);
        return dailyRecordRepository.findAllByCountryAndProvinceAndCityIsNullOrderByDateDesc(c, p);
    }

    public List<DailyRecord> getRecords(String country, String province, String city) {
        Country c = countryService.getCountry(country);
        Province p = provinceService.getProvince(province, c);
        City cty = cityService.getCityByCode(city, p);
        return dailyRecordRepository.findAllByCountryAndProvinceAndCityOrderByDateDesc(c, p, cty);
    }

    public RecordProgression getRecentProgression(String country, String date) {
        Country c = countryService.getCountry(country);
        return dailyRecordRepository.getTotalForCountry(c.getId(), date);
    }

    public RecordProgression getRecentProgression(String country, String province, String date) {
        Country c = countryService.getCountry(country);
        Province p = provinceService.getProvince(province, c);
        return dailyRecordRepository.getTotalForProvince(c.getId(), p.getId(), date);
    }

    public List<DailyMaxByCountry> getDailyMaxStatsForCountry(String countrySlug) {
        return this.dailyRecordRepository.getDailyMaxStatsForCountry(
                this.countryService.getBySlug(countrySlug).getId()
        );
    }

    public DailyRecord upsertDailyRecord(City c, Province p, Country ctr, float lat, float lon,
            Integer confirmed, Integer deaths, Integer recovered, Integer active,
            String lastUpdate) {
        List<DailyRecord> dailyRecords = this.dailyRecordRepository
                .findAllByCountryAndProvinceAndCityAndDate(
                        ctr, p, c, lastUpdate
                );
        DailyRecord dailyRecord;
        if (dailyRecords.size() == 0) {
            dailyRecord = new DailyRecord();
            dailyRecord.setCountry(ctr);
            dailyRecord.setProvince(p);
            dailyRecord.setCity(c);
            dailyRecord.setLon(lon);
            dailyRecord.setLat(lat);
        } else {
            dailyRecord = dailyRecords.get(0);
        }
        dailyRecord.setConfirmed(confirmed);
        dailyRecord.setDeaths(deaths);
        dailyRecord.setRecovered(recovered);
        dailyRecord.setActive(active);
        dailyRecord.setDate(lastUpdate);

        DailyRecord preDailyRecord = dailyRecordRepository
                .findFirstByCountryAndProvinceAndCityAndDateLessThanOrderByDateDesc(
                        ctr, p, c, lastUpdate
                );
        if (preDailyRecord == null) {
            dailyRecord.setDailyConfirmedGrowth(confirmed);
            dailyRecord.setDailyActiveGrowth(active);
            dailyRecord.setDailyDeathGrowth(deaths);
            dailyRecord.setDailyRecoveredGrowth(recovered);
        } else {
            dailyRecord.setDailyConfirmedGrowth(confirmed - preDailyRecord.getConfirmed());
            dailyRecord.setDailyActiveGrowth(active - preDailyRecord.getActive());
            dailyRecord.setDailyDeathGrowth(deaths - preDailyRecord.getDeaths());
            dailyRecord.setDailyRecoveredGrowth(recovered - preDailyRecord.getRecovered());
        }
        dailyRecordRepository.save(dailyRecord);

        return dailyRecord;

    }

    DailyRecord findFirstByOrderByDateDesc() {
        return this.dailyRecordRepository.findFirstByOrderByDateDesc();
    }

}
