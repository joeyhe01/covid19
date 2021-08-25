import 'package:http/http.dart';
import 'package:mobile/shared/entities/Record.dart';
import 'package:mobile/shared/services/AppConfig.dart';

class CountrySceneService {
  Records records;

  Future<Records> getStateRecordsFor(String countrySlug) async {
    final String url = AppConfig.apiUrl + 'daily_stat/country/$countrySlug';
    Response resp = await get(url);
    return Records.fromJson(resp.body);
  }

  Future<Records> getProgressionFor(
      String countrySlug, String provinceCode) async {
    final String url =
        AppConfig.apiUrl + 'getProgression/$countrySlug/$provinceCode';
    Response resp = await get(url);
    return Records.fromJson(resp.body);
  }

  Future<Records> getDailyForCountry(String countryCode) async {
    final String url = AppConfig.apiUrl + 'daily_stat/country/' + countryCode;
    Response resp = await get(url);
    return Records.fromJson(resp.body);
  }
}
