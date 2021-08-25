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

import api.covid19.entity.Country;
import api.covid19.entity.Province;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface ProvinceRepository extends CrudRepository<Province, Long> {
    Province findOneByNameAndCountry(String name, Country country);

    Province findOneBySlugAndCountry(String slug, Country country);

    List<Province> findAllByCountry(Country country);

}
