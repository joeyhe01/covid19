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

import api.covid19.entity.City;
import api.covid19.entity.Country;
import api.covid19.entity.DailyRecord;
import api.covid19.entity.Province;
import com.opencsv.CSVReader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class JHUDataProcessorService {

    @Autowired
    public UtilService utilService;

    @Autowired
    public CountryService countryService;
    @Autowired
    public ProvinceService provinceService;
    @Autowired
    public CityService cityService;
    @Autowired
    public DailyRecordService dailyRecordService;

    static String usCountryDataPrefix = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports_us/";
    static String allCountryDataPrefix = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/";
    private int maxDataDays = 30;

    private static Logger LOG = LoggerFactory.getLogger(JHUDataProcessorService.class);

    private class CountryRecord{
        String country;
        int totalConfirmed;
        int totalActive;
        int totalDeaths;
        int totalRecovered;
        private CountryRecord(String co, int c, int a, int d, int r){
            this.country = co;
            totalConfirmed = c;
            totalActive = a;
            totalDeaths = d;
            totalRecovered = r;
        }
    }
    //yyyy-MM-DD
    public void processUSCountryData(String date) throws IOException, ParseException {
        LOG.info("Processing US Data: " + date);
        //BufferedReader reader = getBufferedReaderForUrl(usCountryDataPrefix + getFileName(date));
        CSVReader reader = getBufferedReaderForUrl(usCountryDataPrefix + getFileName(date));
        if (reader == null)
            return;
        String line;
        Boolean bTitle = true;
        String[] lineParts = null;

        Integer totalConfirmed = 0;
        Integer totalDeaths = 0;
        Integer totalRecovered = 0;
        Integer totalActive = 0;
        String country = "US";
        String lastUpdate = "";
        while ((lineParts = reader.readNext()) != null) {
            if (bTitle) {
                bTitle = false;
                continue;
            }
            List<String> values = Arrays.asList(lineParts);
            //System.out.println(values);
            String province = values.get(0);
            country = values.get(1);
            lastUpdate = date; // values.get(2).substring(0, 10);

            float lat;
            if (values.get(3).equalsIgnoreCase("")) {
                lat = 0;
            } else {
                lat = Float.parseFloat(values.get(3));
            }

            float lon;
            if (values.get(4).equalsIgnoreCase("")) {
                lon = 0;
            } else {
                lon = Float.parseFloat(values.get(4));
            }

            Integer confirmed;
            if (values.get(5).equalsIgnoreCase("")) {
                confirmed = 0;
            } else {
                confirmed = Math.round(Float.parseFloat(values.get(5)));
            }
            Integer deaths;
            if (values.get(6).equalsIgnoreCase("")) {
                deaths = 0;
            } else {
                deaths = Math.round(Float.parseFloat(values.get(6)));
            }

            Integer recovered;
            if (values.get(7).equalsIgnoreCase("")) {
                recovered = 0;
            } else {
                recovered = Math.round(Float.parseFloat(values.get(7)));
            }

            Integer active;
            if (values.get(7).equalsIgnoreCase("")) {
                active = 0;
            } else {
                active = Math.round(Float.parseFloat(values.get(8)));
            }
            totalConfirmed += confirmed;
            totalActive += active;
            totalDeaths += deaths;
            totalRecovered += recovered;
            addRecord(null, province, country,
                    lastUpdate, lat, lon, confirmed, deaths, recovered, active);
        }
        //adding total here
        addRecord(null, null, country, lastUpdate, 0, 0, totalConfirmed, totalDeaths,
                totalRecovered, totalActive);
    }

    public void processData() throws ParseException, IOException {
        //first we need to clean db to keey only maxDataDays to obain best performance
        //if we already have data in db, do not do below, we just need to add more data
        String lastDate;
        if (dailyRecordService.getTotalRecords() > 0) {
            //first we need to clean db to keey only maxDataDays to obain best performance
            this.dailyRecordService.removeDataBefore(maxDataDays);
            DailyRecord latestRecord = dailyRecordService.findFirstByOrderByDateDesc();
            lastDate = latestRecord.getDate();
            LOG.info("Last Date in DB: " + lastDate);
        } else {
            Calendar cal = Calendar.getInstance();
            Date today = cal.getTime();
            cal.add(Calendar.DATE, -1 * maxDataDays);
            java.sql.Date dt = new java.sql.Date(cal.getTimeInMillis());
            lastDate = new SimpleDateFormat("yyyy-MM-dd").format(cal.getTime());
            LOG.info("No data, start from beginning of: " + lastDate);
        }

        Calendar calCalculate = Calendar.getInstance();
        Date dt = new SimpleDateFormat("yyyy-MM-dd").parse(lastDate);
        calCalculate.setTime(dt);

        while (calCalculate.getTime().getTime() < new Date().getTime()) {
            calCalculate.add(Calendar.DATE, 1);
            String newDate = new SimpleDateFormat("yyyy-MM-dd").format(calCalculate.getTime());
            LOG.info("Processing for date: " + newDate);

            processUSCountryData(newDate);
            processDailyReportFor(newDate);

        }
    }

    // yyyy-MM-DD
    public void processDailyReportFor(String date) throws IOException, ParseException {
        System.out.println(date);
        String downloadUrl = allCountryDataPrefix + getFileName(date);
        //BufferedReader reader = getBufferedReaderForUrl(downloadUrl);
        CSVReader reader = getBufferedReaderForUrl(downloadUrl);
        if (reader == null)
            return;
        String line;
        Boolean bTitle = true;
        LOG.info("Process daily report for: " + date);
        String[] lineParts = null;
        Map countryRecords = new HashMap<String, CountryRecord>();

        while ((lineParts = reader.readNext()) != null) {
            if (bTitle) {
                bTitle = false;
                continue;
            }
            List<String> values = Arrays.asList(lineParts);
            //System.out.println(values);
            String city = values.get(1);
            String province = values.get(2);
            String country = values.get(3);
            String lastUpdate = date;// values.get(4).substring(0, 10);

            float lat;

            if (values.get(5).equalsIgnoreCase("")) {
                lat = 0;
            } else {
                lat = Float.parseFloat(values.get(5));
            }

            float lon;
            if (values.get(6).equalsIgnoreCase("")) {
                lon = 0;
            } else {
                lon = Float.parseFloat(values.get(6));
            }

            Integer confirmed;
            if (values.get(7).equalsIgnoreCase("")) {
                confirmed = 0;
            } else {
                confirmed = Math.round(Float.parseFloat(values.get(7)));
            }
            Integer deaths;
            if (values.get(8).equalsIgnoreCase("")) {
                deaths = 0;
            } else {
                deaths = Math.round(Float.parseFloat(values.get(8)));
            }

            Integer recovered;
            if (values.get(9).equalsIgnoreCase("")) {
                recovered = 0;
            } else {
                recovered = Math.round(Float.parseFloat(values.get(9)));
            }

            Integer active;
            if (values.get(10).equalsIgnoreCase("")) {
                active = 0;
            } else {
                active = Math.round(Float.parseFloat(values.get(10)));
            }
            addRecord(city, province, country,
                    lastUpdate, lat, lon, confirmed, deaths, recovered, active);
            if(!country.equals("US")){
                if(!province.equals("")){
                    if(!countryRecords.containsKey(country)){
                        countryRecords.put(country, new CountryRecord(country, confirmed, deaths, recovered, active));
                    }else{
                        CountryRecord c= (CountryRecord) countryRecords.get(country);
                        c.totalConfirmed += confirmed;
                        c.totalDeaths += deaths;
                        c.totalRecovered += recovered;
                        c.totalActive += active;
                        countryRecords.put(country,c);
                    }


                }


            }

//
        }
        for(Object country:countryRecords.keySet()){
            String s = (String) country;
            CountryRecord c= (CountryRecord) countryRecords.get(country);
            addRecord(null, null, c.country, date, 0, 0, c.totalConfirmed, c.totalDeaths, c.totalRecovered, c.totalActive);
        }
    }

    // data fileName is one day before
    private String getFileName(String date) throws ParseException {
        Date dt = new SimpleDateFormat("yyyy-MM-dd").parse((date));
        Calendar cal = Calendar.getInstance();
        cal.setTime(dt);
        String strDate = new SimpleDateFormat("MM-dd-yyyy").format(cal.getTime());
        return strDate + ".csv";
    }

    private void addRecord(String cityName, String provinceName, String countryName,
            String lastUpdate,
            float lat, float lon, Integer confirmed, Integer deaths, Integer receovered,
            Integer active) {

        Country country = countryService.getByName(countryName);
        Province province;
        if (provinceName == null || provinceName.equalsIgnoreCase("")) {
            province = null;
        } else {
            province = provinceService.get(provinceName, country);
        }

        City city = null;
        if (cityName != null && !cityName.equalsIgnoreCase("") && province != null) {
            city = cityService.getCity(cityName, province);
        }

        dailyRecordService.upsertDailyRecord(
                city, province, country, lat, lon, confirmed, deaths, receovered, active, lastUpdate
        );
    }

    private CSVReader getBufferedReaderForUrl(String downloadUrl)
            throws IOException {
        LOG.info("Getting from: " + downloadUrl);
        CSVReader csvReader;
        try {
            URL u = new URL(downloadUrl);
            URLConnection uc = u.openConnection();
            InputStream in = uc.getInputStream();
            BufferedReader reader = new BufferedReader(new InputStreamReader(in));

            csvReader = new CSVReader(reader);
        } catch (Exception e) {
            csvReader = null;
            LOG.error("File not found at: " + downloadUrl);
        }

        return csvReader;

        //        this.utilService.downloadWithJavaIO(downloadUrl, this.localFileName);
        //        //now process this file
        //        InputStream input = new FileInputStream(localFileName);
        //        BufferedReader reader = new BufferedReader(new InputStreamReader(input));
        //        return reader;
    }

}
