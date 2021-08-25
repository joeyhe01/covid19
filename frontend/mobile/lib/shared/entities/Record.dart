import 'dart:convert';

import 'package:charts_flutter/flutter.dart' as charts;

class Record {
  int active, confirmed, deaths, recovered, countryId, provinceId, cityId, id;
  int dailyActiveGrowth,
      dailyConfirmedGrowth,
      dailyDeathGrowth,
      dailyRecoveredGrowth;
  String countryCode,
      countryName,
      countrySlug,
      provinceName,
      provinceSlug,
      cityCode,
      cityName;
  String date;
  dynamic lat, lon;

  static Record fromMap(Map<String, dynamic> data) {
    //final Map<String, dynamic> data = jsonDecode(jsonString);
    Record rcd = Record()
      ..active = data['active']
      ..confirmed = data['confirmed']
      ..deaths = data['deaths']
      ..recovered = data['recovered']
      ..dailyActiveGrowth = data['dailyActiveGrowth'] ?? 0
      ..dailyConfirmedGrowth = data['dailyConfirmedGrowth'] ?? 0
      ..dailyDeathGrowth = data['dailyDeathGrowth'] ?? 0
      ..dailyRecoveredGrowth = data['dailyRecoveredGrowth'] ?? 0
      ..countryId = data['countryId']
      ..provinceId = data['provinceId'] ?? 0
      ..cityId = data['cityId'] ?? 0
      ..id = data['id']
      ..countryCode = data['countryCode']
      ..countryName = data['countryName']
      ..countrySlug = data['countrySlug']
      ..provinceName = data['provinceName'] ?? ''
      ..provinceSlug = data['provinceSlug'] ?? ''
      ..cityCode = data['cityCode'] ?? ''
      ..cityName = data['cityName'] ?? ''
      ..date = data['date']
      ..lat = data['lat']
      ..lon = data['lon'];

    if (data['country'] != null) {
      rcd.countrySlug = data['country']['slug'];
      rcd.countryId = data['country']['id'];
      rcd.countryName = data['country']['name'];
      rcd.countryCode = data['country']['code'];
    }
    if (data['province'] != null) {
      rcd.provinceId = data['province']['id'];
      rcd.provinceSlug = data['province']['slug'];
      rcd.provinceName = data['province']['name'];
    }
    if (data['city'] != null) {
      rcd.cityId = data['city']['id'];
      rcd.cityName = data['city']['name'];
      rcd.cityCode = data['city']['code'];
    }
    return rcd;
  }

  get name {
    return countryName;
  }

  get code {
    return countryCode;
  }

  get slug {
    return countrySlug;
  }
}

class Records {
  List<Record> records;

  Records() {
    records = [];
  }

  filterByCountry(String term) {
    List<Record> findResults = [];
    records.forEach((r) {
      if (r.countryName.toLowerCase().contains(term.toLowerCase()) ||
          r.countrySlug.toLowerCase().contains(term.toLowerCase()) ||
          r.countryCode.toLowerCase().contains(term.toLowerCase())) {
        findResults.add(r);
      }
    });
    return findResults;
  }

  filterByProvince(String term) {
    List<Record> findResults = [];
    records.forEach((r) {
      if (r.provinceName.toLowerCase().contains(term.toLowerCase()) ||
          r.provinceSlug.toLowerCase().contains(term.toLowerCase())) {
        findResults.add(r);
      }
    });
    return findResults;
  }

  filterByCity(String term) {
    List<Record> findResults = [];
    records.forEach((r) {
      if (r.cityName.toLowerCase().contains(term.toLowerCase()) ||
          r.cityCode.toLowerCase().contains(term.toLowerCase())) {
        findResults.add(r);
      }
    });
    return findResults;
  }

  List<charts.Series<TimeSeriesRecord, DateTime>> generateTimeSeriesRecords() {
    List<TimeSeriesRecord> dailyActive = [];
    List<TimeSeriesRecord> dailyConfirmed = [];
    List<TimeSeriesRecord> dailyDeaths = [];
    List<TimeSeriesRecord> dailyRecovered = [];

    List<TimeSeriesRecord> dailyActiveGrowth = [];
    List<TimeSeriesRecord> dailyConfirmedGrowth = [];
    List<TimeSeriesRecord> dailyDeathsGrowth = [];
    List<TimeSeriesRecord> dailyRecoveredGrowth = [];

    records.forEach((Record r) {
      int yyyy = int.parse(r.date.substring(0, 4));
      int mm = int.parse(r.date.substring(5, 7));
      int dd = int.parse(r.date.substring(8, 10));
      dailyActive
          .add(new TimeSeriesRecord(new DateTime(yyyy, mm, dd), r.active));
      dailyConfirmed
          .add(new TimeSeriesRecord(new DateTime(yyyy, mm, dd), r.confirmed));
      dailyDeaths
          .add(new TimeSeriesRecord(new DateTime(yyyy, mm, dd), r.deaths));
      dailyRecovered
          .add(new TimeSeriesRecord(new DateTime(yyyy, mm, dd), r.recovered));

      dailyActiveGrowth.add(new TimeSeriesRecord(
          new DateTime(yyyy, mm, dd), r.dailyActiveGrowth));
      dailyConfirmedGrowth.add(new TimeSeriesRecord(
          new DateTime(yyyy, mm, dd), r.dailyConfirmedGrowth));
      dailyDeathsGrowth.add(
          new TimeSeriesRecord(new DateTime(yyyy, mm, dd), r.dailyDeathGrowth));
      dailyRecoveredGrowth.add(new TimeSeriesRecord(
          new DateTime(yyyy, mm, dd), r.dailyRecoveredGrowth));
    });

    return [
      new charts.Series<TimeSeriesRecord, DateTime>(
        id: 'Daily Active',
        colorFn: (_, __) => charts.MaterialPalette.green.shadeDefault,
        domainFn: (TimeSeriesRecord record, _) => record.time,
        measureFn: (TimeSeriesRecord record, _) => record.count,
        data: dailyActive,
      ),
      new charts.Series<TimeSeriesRecord, DateTime>(
        id: 'Daily Confirmed',
        colorFn: (_, __) => charts.MaterialPalette.red.shadeDefault,
        domainFn: (TimeSeriesRecord record, _) => record.time,
        measureFn: (TimeSeriesRecord record, _) => record.count,
        data: dailyConfirmed,
      ),
      new charts.Series<TimeSeriesRecord, DateTime>(
        id: 'Daily Deaths',
        colorFn: (_, __) => charts.MaterialPalette.blue.shadeDefault,
        domainFn: (TimeSeriesRecord record, _) => record.time,
        measureFn: (TimeSeriesRecord record, _) => record.count,
        data: dailyDeaths,
      ),
      new charts.Series<TimeSeriesRecord, DateTime>(
        id: 'Daily Recovered',
        colorFn: (_, __) => charts.MaterialPalette.indigo.shadeDefault,
        domainFn: (TimeSeriesRecord record, _) => record.time,
        measureFn: (TimeSeriesRecord record, _) => record.count,
        data: dailyRecovered,
      ),
      new charts.Series<TimeSeriesRecord, DateTime>(
        id: 'Daily Active Growth',
        colorFn: (_, __) => charts.MaterialPalette.pink.shadeDefault,
        domainFn: (TimeSeriesRecord record, _) => record.time,
        measureFn: (TimeSeriesRecord record, _) => record.count,
        data: dailyActiveGrowth,
      )
        // Configure our custom point renderer for this series.
        ..setAttribute(charts.measureAxisIdKey, 'customPoint')
        ..setAttribute(charts.rendererIdKey, 'customPoint'),
      new charts.Series<TimeSeriesRecord, DateTime>(
        id: 'Daily Confirmed Growth',
        colorFn: (_, __) => charts.MaterialPalette.cyan.shadeDefault,
        domainFn: (TimeSeriesRecord record, _) => record.time,
        measureFn: (TimeSeriesRecord record, _) => record.count,
        data: dailyConfirmedGrowth,
      ) // Configure our custom point renderer for this series.
        ..setAttribute(charts.measureAxisIdKey, 'customPoint')
        ..setAttribute(charts.rendererIdKey, 'customPoint'),
      new charts.Series<TimeSeriesRecord, DateTime>(
        id: 'Daily Deaths Growth',
        colorFn: (_, __) => charts.MaterialPalette.purple.shadeDefault,
        domainFn: (TimeSeriesRecord record, _) => record.time,
        measureFn: (TimeSeriesRecord record, _) => record.count,
        data: dailyDeathsGrowth,
      ) // Configure our custom point renderer for this series.
        ..setAttribute(charts.measureAxisIdKey, 'customPoint')
        ..setAttribute(charts.rendererIdKey, 'customPoint'),
      new charts.Series<TimeSeriesRecord, DateTime>(
        id: 'Daily Recovered Growth',
        colorFn: (_, __) => charts.MaterialPalette.teal.shadeDefault,
        domainFn: (TimeSeriesRecord record, _) => record.time,
        measureFn: (TimeSeriesRecord record, _) => record.count,
        data: dailyRecoveredGrowth,
      ) // Configure our custom point renderer for this series.
        ..setAttribute(charts.measureAxisIdKey, 'customPoint')
        ..setAttribute(charts.rendererIdKey, 'customPoint'),
    ];
  }

  static Records fromJson(String jsonString) {
    final List<dynamic> dataList = jsonDecode(jsonString);
    Records records = Records();
    dataList.forEach((element) {
      records.records.add(Record.fromMap(element));
    });
    return records;
  }

  getMapItemCounts() {
    return MapItemCounts(this);
  }
}

/// Sample time series data type.
class TimeSeriesRecord {
  final DateTime time;
  final int count;

  TimeSeriesRecord(this.time, this.count);
}

class MapItemCount {
  final String name;
  final int count;

  MapItemCount(this.name, this.count);
}

class MapItemCounts {
  final Records records;

  MapItemCounts(this.records) {}

  getAllCountriesFor(DISPLAYTYPE type) {
    List<MapItemCount> mapItemCounts = [];
    records.records.forEach((Record rcd) {
      mapItemCounts.add(MapItemCount(
          rcd.countryCode == "US"
              ? "United States of America"
              : rcd.countryCode,
          type == DISPLAYTYPE.CONFIRMED ? rcd.confirmed : 0));
    });
    return mapItemCounts;
  }

  getAllStateData(DISPLAYTYPE type) {
    List<MapItemCount> mapItemCounts = [];
    records.records.forEach((Record rcd) {
      mapItemCounts.add(MapItemCount(
          rcd.provinceName, type == DISPLAYTYPE.CONFIRMED ? rcd.confirmed : 0));
    });
    return mapItemCounts;
  }
}

enum DISPLAYTYPE {
  CONFIRMED,
}
