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

package api.covid19.repository.QueryEntities;

public interface DailyMaxByCountry {
    public Integer getId();

    public Integer getCountryId();

    public Integer getConfirmed();

    public Integer getActive();

    public Integer getDeaths();

    public Integer getRecovered();

    public String getCountryName();

    public String getCountrySlug();

    public String getCountryCode();

    public String getDate();

    public float getLat();

    public float getLon();
}
