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

import api.covid19.entity.Country;
import api.covid19.entity.CountryMapper;
import api.covid19.entity.DailyRecord;
import api.covid19.entity.DailyRecordMapper;
import com.google.gson.Gson;
import com.google.gson.stream.JsonReader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class DataProcessService {

    @Autowired
    private DailyRecordService dailyRecordService;
    @Autowired
    private CountryService countryService;
    @Autowired
    private UtilService utilService;

    private Logger LOG = LoggerFactory.getLogger(DataProcessService.class);
    private Gson gson = new Gson();

    private int maxDataDays = 30;

    public void processData() throws IOException {

        //step 1, process countries
        processCountries();
        //step 2. regular daily records
        initAllData();
        //step 3, get data for each county after last date
        processNewData();
    }

    private void processCountries() throws IOException {
        if (countryService.getTotalCountries() > 0)
            return;
        JsonReader reader = getReader("https://api.covid19api.com/countries");
        List<CountryMapper> countryMappers = new ArrayList<>();
        reader.beginArray();
        LOG.info("processCountries - started");
        while (reader.hasNext()) {
            CountryMapper countryMapper = gson.fromJson(reader, CountryMapper.class);
            countryService.get(countryMapper.getCountry(), countryMapper.getISO2(),
                    countryMapper.getSlug());
        }
        LOG.info("processCountries - finished");
    }

    private void initAllData() throws IOException {
        LOG.info("initAllData - started");
        //if we already have data in db, do not do below, we just need to add more data
        if (dailyRecordService.getTotalRecords() > 0) {
            //first we need to clean db to keey only maxDataDays to obain best performance
            this.dailyRecordService.removeDataBefore(maxDataDays);
            LOG.info("initAllData - only for filling map");
            fillMap();
            return;
        }
        processAPIResponse("https://api.covid19api.com/all");
    }

    private void fillMap() throws IOException {
        JsonReader reader = getReader("https://api.covid19api.com/all");
        reader.beginArray();
        while (reader.hasNext()) {
            DailyRecordMapper mapper = gson.fromJson(reader, DailyRecordMapper.class);
            dailyRecordService.fillMap(mapper);
        }
    }

    private void processNewData() throws IOException {
        Iterable<Country> countries = countryService.getAllCountries();
        Iterator<Country> countryIterator = countries.iterator();
        while (countryIterator.hasNext()) {
            Country country = countryIterator.next();
            DailyRecord dailyRecord = dailyRecordService.getLatestRecordForCountry(country);
            System.out.println("Process new data for: " + country.getName());
            String fromDT;
            if (dailyRecord == null) {
                Calendar cal = Calendar.getInstance();
                Date today = cal.getTime();
                cal.add(Calendar.DATE, -1 * maxDataDays);
                java.sql.Date lastDate = new java.sql.Date(cal.getTimeInMillis());
                fromDT = lastDate.toString() + "T12:00:00Z";
            } else {
                fromDT = dailyRecord.getDate() + "T23:00:00Z";
            }

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            LocalDateTime now = LocalDateTime.now();//.plusDays(1);
            System.out.println(dtf.format(now));
            String toDT = dtf.format(now);
            toDT = toDT.substring(0, 10) + "T" + toDT.substring(11, 19) + "Z";
            String url =
                    "https://api.covid19api.com/country/" + country.getSlug() + "?from=" + fromDT
                            + "&to=" + toDT;
            System.out.println("New URl:" + url);
            processAPIResponse(url);
        }
    }

    private void processAPIResponse(String url) throws IOException {
        JsonReader reader = getReader(url);
        List<DailyRecordMapper> dailyRecords = new ArrayList<DailyRecordMapper>();
        reader.beginArray();
        Integer batchSize = 5000; //200;
        List<DailyRecordMapper> dailyRecordMappers = new ArrayList<>();
        Integer count = 0;
        LOG.info("processAPIResponse - started looping");
        while (reader.hasNext()) {
            DailyRecordMapper mapper = gson.fromJson(reader, DailyRecordMapper.class);
            dailyRecordMappers.add(mapper);
            LOG.info("count: {}", count++);
            LOG.info(mapper.getCountry() + ", pro: " + mapper.getProvince() + ", city=" + mapper
                    .getCity());
            if (dailyRecordMappers.size() == batchSize) {
                LOG.info("Batch Process started: ");
                dailyRecordService.processDailyRecords(dailyRecordMappers);
                LOG.info("Batch Process end: ");
                //now clean the list
                dailyRecordMappers = new ArrayList<>();
            }
        }

        if (dailyRecordMappers.size() > 0) {
            dailyRecordService.processDailyRecords(dailyRecordMappers);
        }
    }

    private JsonReader getReader(String url) throws IOException {
        return getReaderThroughFile(url);
        //        URL u = new URL(url);
        //        URLConnection uc = u.openConnection();
        //        InputStream in = uc.getInputStream();
        //        JsonReader reader = new JsonReader(new InputStreamReader(in, "UTF-8"));
        //        return reader;
    }

    private JsonReader getReaderThroughFile(String url)
            throws FileNotFoundException, UnsupportedEncodingException {
        String localFilename = "tmp";
        //        try (InputStream in = new URL(url).openStream()) {
        //            Files.copy(in, Paths.get(localFilename), StandardCopyOption.REPLACE_EXISTING);
        //            InputStream input = new FileInputStream(localFilename);
        //            JsonReader reader = new JsonReader(new InputStreamReader(input, "UTF-8"));
        //            return reader;
        //        } catch (IOException e) {
        //            e.printStackTrace();
        //        }

        this.utilService.downloadWithJavaIO(url, localFilename);
        InputStream input = new FileInputStream(localFilename);
        JsonReader reader = new JsonReader(new InputStreamReader(input, "UTF-8"));
        return reader;

    }

}
