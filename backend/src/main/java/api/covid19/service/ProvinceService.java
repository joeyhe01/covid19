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
import api.covid19.entity.Province;
import api.covid19.repository.ProvinceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProvinceService {

    @Autowired
    ProvinceRepository provinceRepository;
    @Autowired
    CountryService countryService;

    public Province get(String name, Country country) {

        Province province = provinceRepository.findOneByNameAndCountry(name, country);
        if (province == null) {
            province = new Province();
            province.setName(name);
            province.setCountry(country);
            province.setSlug(name.toLowerCase().replaceAll(" ", "-"));
            provinceRepository.save(province);
        }
        return province;
    }

    public Province getProvince(String name, Country c) {
        return provinceRepository.findOneByNameAndCountry(name, c);
    }

    public Province getProvinceBySlug(String slug, Country c) {
        return provinceRepository.findOneBySlugAndCountry(slug, c);
    }

    public List<Province> provinces(String country) {

        Country c = countryService.get(country);
        return provinceRepository.findAllByCountry(c);

    }
}
