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

package api.covid19.repository;

import api.covid19.entity.City;
import api.covid19.entity.Country;
import api.covid19.entity.DailyRecord;
import api.covid19.entity.Province;
import api.covid19.repository.QueryEntities.DailyMaxByCountry;
import api.covid19.repository.QueryEntities.DailyMaxByCountryProvince;
import api.covid19.repository.QueryEntities.DailyMaxByCountryProvinceCity;
import api.covid19.repository.QueryEntities.RecordProgression;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

//import java.sql.Date;

public interface DailyRecordRepository extends CrudRepository<DailyRecord, Long> {
    long count();

    DailyRecord findFirstByCountryOrderByDateDesc(Country country);

    DailyRecord findFirstByCountryAndProvinceOrderByDateDesc(Country country, Province p);

    DailyRecord findFirstByCountryAndProvinceAndCityOrderByDateDesc(Country country, Province p,
            City cty);

    //    @Query(value = "select max(date), max(confirmed), max(deaths),  country_id, province_id, city_id from daily_record  group by country_id, province_id, city_id", nativeQuery = true)
    //    record findLastData();

    @Query(value =
            "select tmp.*, dr.lat, dr.lon from (select max(daily_record.id) as id, country_id as countryId, max(confirmed) as confirmed, max(active) as active, max(`deaths`) as deaths, max(`recovered`) as recovered, max(date) as date, country.`name` as countryName, country.`slug` as countrySlug,  country.`code` as countryCode from daily_record join country on country_id=country.id group by country_id order by confirmed desc ) as tmp "
                    + "join `daily_record` as dr on tmp.id = dr.id", nativeQuery = true)
    List<DailyMaxByCountry> getDailyMaxForAllCountries();

    @Query(value =
            "select tmp.*, dr.lat, dr.lon from ( select max(`id`) as id, max(confirmed) as confirmed, max(active) as active, max(`deaths`) as deaths, max(`recovered`) as recovered, date from daily_record \n"
                    + "where country_id=?1 group by date order by date desc) as tmp join `daily_record` as dr on tmp.id = dr.id", nativeQuery = true)
    List<DailyMaxByCountry> getDailyMaxStatsForCountry(Long countryId);

    @Query(value =
            "select tmp.*, dr.lat, dr.lon from ( select max(daily_record.id) as id, province_id as provinceId, province.name as provinceName, province.`slug` as provinceSlug, max(confirmed) as confirmed, max(active) as active, max(`deaths`) as deaths, max(`recovered`) as recovered,  max(date) as date, country.id as countryId, country.`name` as countryName, country.`code` as countryCode, country.`slug` as countrySlug "
                    + "from daily_record  join country on country_id=country.id join province on province_id=province.id and daily_record.country_id=?1 group by province_id order by confirmed desc) as tmp join `daily_record` as dr on tmp.id = dr.id", nativeQuery = true)
    List<DailyMaxByCountryProvince> getDailyMaxForAllProvincesInCountry(Long countryId);

    @Query(value =
            "select tmp.*, dr.lat, dr.lon from            \n" +
                    "\t(select max(daily_record.id) as id, daily_record.city_id as cityId, city.name as cityName, max(confirmed) as confirmed, country.`name` as countryName, country.`code` as countryCode, country.`slug` as countrySlug,\n" +
                    "\t\t\t\t\t\tmax(active) as active, max(`deaths`) as deaths, max(`recovered`) as recovered,  max(date) as date,\n" +
                    "\t\t\t\t\t\tprovince.id as provinceId, province.`name` as provinceName, province.`slug` as provinceSlug, \n" +
                    "\t\t\t\t\t\tcity.code as cityCode\n" +
                    "\t\t\t\t\t\tfrom daily_record\n" +
                    "\t\t\t\t\t\tjoin country on country_id=country.id\n" +
                    "\t\t\t\t\t\tjoin province on province_id=province.id\n" +
                    "\t\t\t\t\t\tjoin city on city.id=city_id\n" +
                    "\t\t\t\t\t\tand daily_record.country_id=?1\n" +
                    "\t\t\t\t\t\tand daily_record.province_id=?2\n" +
                    "\t\t\t\t\t\tgroup by city_id\n" +
                    "\t\t\t\t\t\torder by confirmed desc) \n" +
                    "\t \t\tas tmp join `daily_record` as dr on tmp.id = dr.id", nativeQuery = true)
    List<DailyMaxByCountryProvinceCity> getDailyMaxForAllCitiesInProvince(Long countryId, Long provinceId);

    @Query(value = "select tmp.*, dr.lat, dr.lon from ( select max(id) as id, country_id as countryId, max(confirmed) as confirmed, max(active) as active, max(`deaths`) as deaths, max(`recovered`) as recovered from daily_record where country_id = ?1) as tmp join `daily_record` as dr on tmp.id = dr.id", nativeQuery = true)
    DailyMaxByCountry getDailyMaxForCountry(Long countryId);

    @Query(value = "select tmp.*, dr.lat, dr.lon from (select max(id) as id, country_id as countryId, province_id as provinceId, max(confirmed) as confirmed, max(active) as active, max(`deaths`) as deaths, max(`recovered`) as recovered from daily_record group by country_id, `province_id` ) as tmp join `daily_record` as dr on tmp.id = dr.id", nativeQuery = true)
    List<DailyMaxByCountryProvince> getDailyMaxByCountriesAndProvinces();

    @Query(value = "select tmp.*, dr.lat, dr.lon from (select max(id) as id, country_id as countryId, province_id as provinceId, max(confirmed) as confirmed, max(active) as active, max(`deaths`) as deaths, max(`recovered`) as recovered from daily_record where country_id = ?1 and province_id = ?2 ) as tmp join `daily_record` as dr on tmp.id = dr.id", nativeQuery = true)
    DailyMaxByCountryProvince getDailyMaxByCountryAndProvince(Long countryId, Long provinceId);

    @Query(value = "select tmp.*, dr.lat, dr.lon from ( select max(id) as id, country_id as countryId,province_id as provinceId, city_id as cityId, max(confirmed) as confirmed, max(active) as active, max(`deaths`) as deaths, max(`recovered`) as recovered from daily_record group by country_id, `province_id`, `city_id`) as tmp join `daily_record` as dr on tmp.id = dr.id", nativeQuery = true)
    List<DailyMaxByCountryProvinceCity> getDailyMaxByCountriesAndProvincesAndCities();

    @Query(value = "select tmp.*, dr.lat, dr.lon from (select max(id) as id, country_id as countryId,province_id as provinceId, city_id as cityId, max(confirmed) as confirmed, max(active) as active, max(`deaths`) as deaths, max(`recovered`) as recovered from daily_record where country_id = ?1 and province_id = ?2 and city_id = ?3) as tmp join `daily_record` as dr on tmp.id = dr.id", nativeQuery = true)
    DailyMaxByCountryProvinceCity getDailyMaxByCountryAndProvinceAndCity(Long countryId,
            Long provinceId, Long cityId);

    List<DailyRecord> findAllByCountry(Country c);

    List<DailyRecord> findAllByCountryAndProvinceIsNullAndCityIsNullOrderByDateDesc(Country c);

    List<DailyRecord> findAllByCountryAndProvinceAndCityIsNullOrderByDateDesc(Country c, Province p);

    List<DailyRecord> findAllByCountryAndCityIsNullOrderByDateDesc(Country c);

    List<DailyRecord> findAllByCountryAndProvince(Country c, Province p);

    List<DailyRecord> findAllByCountryAndProvinceAndCityOrderByDateDesc(Country c, Province p, City cty);

    List<DailyRecord> findAllByCountryAndProvinceAndCityAndDate(Country c, Province p, City cty,
            String date);

    DailyRecord findFirstByCountryAndProvinceAndCityAndDateLessThanOrderByDateDesc(Country c,
            Province p, City cty, String date);

    DailyRecord findFirstByOrderByDateDesc();

    //    @Query(value = "SELECT daily_active_growth as dailyActiveGrowth,daily_confirmed_growth as dailyConfirmedGrowth,daily_death_growth as dailyDeathGrowth,daily_recovered_growth as dailyRecoveredGrowth FROM covid19.daily_record where country_id = ?1", nativeQuery = true)
    //    List<RecordProgression> getOriginProgression(Long CountryId);
    //
    //    @Query(value = "SELECT daily_active_growth as dailyActiveGrowth,daily_confirmed_growth as dailyConfirmedGrowth,daily_death_growth as dailyDeathGrowth,daily_recovered_growth as dailyRecoveredGrowth FROM covid19.daily_record where country_id = ?1 and province_id = ?2", nativeQuery = true)
    //    List<RecordProgression> getOriginProgression(Long CountryId, Long provinceId);
    //
    //    @Query(value = "SELECT daily_active_growth as dailyActiveGrowth,daily_confirmed_growth as dailyConfirmedGrowth,daily_death_growth as dailyDeathGrowth,daily_recovered_growth as dailyRecoveredGrowth FROM covid19.daily_record where country_id = ?1 and province_id = ?2 and city_id = ?3", nativeQuery = true)
    //    List<RecordProgression> getOriginProgression(Long CountryId, Long provinceId, Long cityId);

    @Query(value = "SELECT SUM(daily_active_growth) as dailyActiveGrowth, SUM(daily_confirmed_growth) as dailyConfirmedGrowth, SUM(daily_death_growth) as dailyDeathGrowth, SUM(daily_recovered_growth) as dailyRecoveredGrowth FROM covid19.daily_record where date = ?2 and country_id = ?1", nativeQuery = true)
    RecordProgression getTotalForCountry(Long CountryID, String date);

    @Query(value = "SELECT SUM(daily_active_growth) as dailyActiveGrowth, SUM(daily_confirmed_growth) as dailyConfirmedGrowth, SUM(daily_death_growth) as dailyDeathGrowth, SUM(daily_recovered_growth) as dailyRecoveredGrowth FROM covid19.daily_record where date = ?3 and country_id = ?1 and province_id = ?2", nativeQuery = true)
    RecordProgression getTotalForProvince(Long CountryID, Long ProvinceID, String date);

    @Modifying
    @Transactional
    @Query("delete from DailyRecord where date<= ?1")
    void deleteByDateBefore(String preDate);

}
