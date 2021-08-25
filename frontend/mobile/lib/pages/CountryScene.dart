import 'package:flutter/material.dart';
import 'package:mobile/shared/entities/Record.dart';
import 'package:mobile/shared/entities/ScreenArguments.dart';
import 'package:mobile/shared/widgets/ChartWidget.dart';
import 'package:mobile/shared/widgets/ItemsWidgets.dart';
import 'package:mobile/shared/widgets/SyncfusionMapWidget.dart';

import 'CountrySceneService.dart';

class CountryScene extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => new _CountrySceneState();
}

class _CountrySceneState extends State<CountryScene>
    with SingleTickerProviderStateMixin {
  bool loading = true;
  CountrySceneService countrySceneService = new CountrySceneService();
  List<Record> records;
  Records recordsObj;
  Widget bodyWidget;
  Widget chartWidget;
  BuildContext ctx;
  Widget mapWidget;

  TabController _tabController;

  @override
  void initState() {
    super.initState();
    buildBodyWidget();
    _tabController = new TabController(vsync: this, length: 3);
  }

  @override
  Widget build(BuildContext context) {
    ctx = context;

    final ScreenArguments args = ModalRoute.of(context).settings.arguments;
    if (args != null && loading) {
      countrySceneService.getStateRecordsFor(args.country).then((Records resp) {
        loading = false;
        recordsObj = resp;
        records = resp.records;
        countrySceneService
            .getDailyForCountry(args.country)
            .then((Records countryResp) {
          print(countryResp);
          mapWidget = SyncfusionMapWidget(
            records: countryResp,
            country: args.country,
          );
          buildBodyWidget();
        });
      });
    }
    return getTabWidget(
        context, bodyWidget, WIDGETTYPE.COUNTRY, _tabController);
  }

  buildBodyWidget() {
    if (loading) {
      bodyWidget = Text('Loading...');
      chartWidget = Text('Loading...');
    } else {
      bodyWidget = TabBarView(controller: _tabController, children: <Widget>[
        getListingWidgetsBody(
            _search, records, ctx, WIDGETTYPE.COUNTRY, _gotoTab),
        mapWidget,
        chartWidget,
      ]);
    }
    setState(() {});
  }

  _search(term) {
    records = recordsObj.filterByProvince(term);
    buildBodyWidget();
  }

  _gotoTab(int tabIndex, Record record) {
    countrySceneService
        .getProgressionFor(record.countrySlug, record.provinceSlug)
        .then((Records resp) {
      chartWidget = DailyProgressionChart.getDailyProgressionChart(
          resp.generateTimeSeriesRecords());
      buildBodyWidget();
    });
    _tabController.animateTo(tabIndex);
  }
}
