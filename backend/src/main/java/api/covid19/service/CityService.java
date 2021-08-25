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
import api.covid19.entity.Province;
import api.covid19.repository.CityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CityService {
    @Autowired
    CityRepository cityRepository;
    @Autowired
    CountryService countryService;
    @Autowired
    ProvinceService provinceService;

    public City get(String name, String code, Province province) {
        City city = cityRepository.findOneByNameAndCodeAndProvince(name, code, province);
        if (city == null) {
            city = new City();
            city.setCode(code);
            city.setName(name);
            city.setProvince(province);
            cityRepository.save(city);
        }
        return city;
    }

    public List<City> cities(String province, String country) {
        Country c = countryService.get(country);
        Province p = provinceService.get(province, c);
        return cityRepository.findAllByProvince(p);
    }

    public City getCity(String name, Province p) {
        City c = cityRepository.findOneByNameAndProvince(name, p);
        if (c == null) {
            c = new City();
            c.setCode(name.toLowerCase().replaceAll(" ", "-"));
            c.setName(name);
            c.setProvince(p);
            cityRepository.save(c);
        }
        return c;
    }

    public City getCityByCode(String code, Province p) {
        City c = cityRepository.findOneByCodeAndProvince(code, p);
        if (c == null) {
            c = new City();
            c.setCode(code.toLowerCase().replaceAll(" ", "-"));
            c.setName(code);
            c.setProvince(p);
            cityRepository.save(c);
        }
        return c;
    }


}
