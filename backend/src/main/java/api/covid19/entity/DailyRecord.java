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

package api.covid19.entity;

import lombok.Data;

import javax.persistence.*;

@Entity
@Data
public class DailyRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @OneToOne
    private Country country;
    @OneToOne
    private Province province;
    @OneToOne
    private City city;

    private Float lat;
    private Float lon;
    private Integer confirmed;
    private Integer deaths;
    private Integer recovered;
    private Integer active;
    private String date;
    private int dailyConfirmedGrowth;
    private int dailyDeathGrowth;
    private int dailyRecoveredGrowth;
    private int dailyActiveGrowth;

    public boolean compareOrigin(DailyRecord dailyRecord){
        if(country.equals(dailyRecord.country)) {
            if (this.city != null) {
                if(dailyRecord.getCity()==null){
                    return false;
                }
                if (this.province != null) {
                    if(dailyRecord.getProvince()==null)
                        return false;
                    return (province.equals(dailyRecord.getProvince()) && city.equals(dailyRecord.getCity()));
                } else {
                    return (city.equals(dailyRecord.getCity()));
                }
            } else {
                if(dailyRecord.getCity()!=null){
                    return false;
                }
                if (this.province != null) {
                    if(dailyRecord.getProvince()==null){
                        return false;
                    }
                    return (province.equals(dailyRecord.getProvince()));
                } else {
                    return true;
                }
            }
        }else{
            return false;
        }

    }

}
