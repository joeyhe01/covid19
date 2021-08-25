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

package api;

import api.covid19.service.DataProcessService;
import api.covid19.service.JHUDataProcessorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.io.IOException;
import java.text.ParseException;

@SpringBootApplication
@EnableScheduling
public class ApiApplication implements CommandLineRunner {

    private static Logger LOG = LoggerFactory.getLogger(ApiApplication.class);

    @Autowired
    DataProcessService dataProcessService;
    @Autowired
    JHUDataProcessorService jhuDataProcessorService;

    public static void main(String[] args) {
        LOG.info("STARTING THE APPLICATION");
        SpringApplication.run(ApiApplication.class, args);
    }

    // When running in command line, set WEB_APPLICATION_TYPE environment to NONE
    @Override public void run(String... args) throws Exception {
        LOG.info("Executing: command line runner");
        for (int i = 0; i < args.length; ++i) {
            LOG.info("args[{}]: {}", i, args[i]);
            //            if (args[0].equalsIgnoreCase("importdata")) {
            //                this.dataProcessService.processData();
            //            }
//            if (args[0].equalsIgnoreCase("importdata")) {
            //                this.jhuDataProcessorService.processData();
            //            }
        }
        //jhuDataProcessorService.processDailyReportFor("2020-09-04");
    }

    @Scheduled(fixedRate = 3600 * 5 * 1000) //every 5 hours
    public void scheduledTask() throws IOException, ParseException {
        this.jhuDataProcessorService.processData();
    }

}
