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
import api.covid19.repository.CountryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CountryService {

    @Autowired
    CountryRepository countryRepository;

    public Country get(String name, String code, String slug) {
        Country country = this.countryRepository.findOneByCode(code);
        if (country == null) {
            country = new Country();
            country.setCode(code);
            country.setName(name);
            country.setSlug(slug);
            this.countryRepository.save(country);
        }
        return country;
    }

    public Country get(String name) {
        return this.getCountry(name);
    }

    public Country getBySlug(String slug) {
        return this.countryRepository.findOneBySlug(slug);
    }

    public Country getByCode(String code) {
        return this.countryRepository.findOneByCode(code);
    }

    public Iterable<Country> getAllCountries() {
        return countryRepository.findAll();
    }

    public long getTotalCountries() {
        return countryRepository.count();
    }

    public Country getCountry(String name) {
        List<Country> countryList = countryRepository.findByName(name);
        if (countryList.size() > 0) {
            return countryList.get(0);
        } else {
            return null;
        }
    }

    public Country getByName(String name) {
        Country country = this.get(name);
        if (country == null) {
            country = new Country();
            country.setCode(name.replaceAll(" ", ""));
            country.setName(name);
            country.setSlug(name.toLowerCase().replaceAll(" ", "-"));
            this.countryRepository.save(country);
        }
        return country;
    }
}
