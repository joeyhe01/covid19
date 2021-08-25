import 'package:flutter/material.dart';

import 'pages/CountryScene.dart';
import 'pages/HomeScene.dart';
import 'pages/LandingScene.dart';
import 'pages/ProvinceScene.dart';
import 'shared/services/AppConfig.dart';

void main() async {
  String env = 'dev'; // 'prod' | 'dev'
  WidgetsFlutterBinding.ensureInitialized();
  await AppConfig.setEnvironmentConfig(env);
  runApp(AppStarter());
}

class AppStarter extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Covid19 Tracker',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      initialRoute: '/',
      routes: <String, WidgetBuilder>{
        '/': (BuildContext context) => LandingScene(),
        '/home': (BuildContext context) => HomeScene(),
        '/countryDetail': (BuildContext context) => CountryScene(),
        '/provinceDetail': (BuildContext context) => ProvinceScene(),
      },
      debugShowCheckedModeBanner: false,
    );
  }
}
