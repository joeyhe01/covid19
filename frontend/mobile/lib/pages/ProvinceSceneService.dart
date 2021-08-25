import 'package:http/http.dart';
import 'package:mobile/shared/entities/Record.dart';
import 'package:mobile/shared/services/AppConfig.dart';

class ProvinceSceneService {
  Records records;

  Future<Records> getProvinceRecordsFor(
      String countrySlug, String provinceCode) async {
    final String url =
        AppConfig.apiUrl + 'daily_stat/country/$countrySlug/$provinceCode';
    Response resp = await get(url);
    return Records.fromJson(resp.body);
  }

  Future<Records> getProgressionFor(
      String countrySlug, String provinceSlug, String cityCode) async {
    final String url = AppConfig.apiUrl +
        'getProgression/$countrySlug/$provinceSlug/$cityCode';
    Response resp = await get(url);
    return Records.fromJson(resp.body);
  }
}
