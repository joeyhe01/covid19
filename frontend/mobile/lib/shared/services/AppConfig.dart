import 'dart:convert';

import 'package:flutter/services.dart';

class AppConfig {
  static String _apiUrl;

  AppConfig(json) {
    _apiUrl = json['apiUrl'];
  }

  static get apiUrl {
    return _apiUrl;
  }

  static setEnvironmentConfig(String env) async {
    env = env ?? 'dev';
    final json =
        jsonDecode(await rootBundle.loadString('assets/config/$env.json'));
    _apiUrl = json['apiUrl'];
  }
}
