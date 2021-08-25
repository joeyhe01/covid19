import 'package:http/http.dart';
import 'package:mobile/shared/entities/Record.dart';
import 'package:mobile/shared/services/AppConfig.dart';

class HomeSceneService {
  Records countryRecords;

  Future<Records> getCountryRecords() async {
    final String url = AppConfig.apiUrl + 'daily_stat/country';
    Response resp = await get(url);
    return Records.fromJson(resp.body);
  }

  Future<Records> getPregression(String countrySlug) async {
    final String url = AppConfig.apiUrl + 'getProgression/$countrySlug';
    Response resp = await get(url);
    return Records.fromJson(resp.body);
  }

  Future<Records> getDailyCountry() async {
    final String url = AppConfig.apiUrl + 'daily_stat/country';
    Response resp = await get(url);
    return Records.fromJson(resp.body);
  }
}
