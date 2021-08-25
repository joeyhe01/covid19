import 'package:flutter/material.dart';
import 'package:mobile/shared/entities/Record.dart';
import 'package:mobile/shared/widgets/ChartWidget.dart';
import 'package:mobile/shared/widgets/ItemsWidgets.dart'; //import 'package:mobile/shared/widgets/MapWidget.dart';
import 'package:mobile/shared/widgets/SyncfusionMapWidget.dart';

import 'HomeSceneService.dart';

class HomeScene extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => new _HomeSceneState();
}

class _HomeSceneState extends State<HomeScene>
    with SingleTickerProviderStateMixin {
  bool loading = true;
  HomeSceneService homeSceneService = new HomeSceneService();
  List<Record> records;
  Records recordsObj;
  Widget bodyWidget;
  Widget chartWidget;
  Widget mapWidget;
  BuildContext ctx;

  TabController _tabController;

  @override
  void initState() {
    super.initState();
    buildBodyWidget();
    _tabController = new TabController(vsync: this, length: 3);

    homeSceneService.getCountryRecords().then((Records resp) {
      loading = false;
      recordsObj = resp;
      records = resp.records;

      homeSceneService.getPregression('us').then((Records resp)  {
        chartWidget = DailyProgressionChart.getDailyProgressionChart(
          resp.generateTimeSeriesRecords(),
        );
        homeSceneService.getDailyCountry().then((Records resp) {
          //mapWidget = MapWidget();
          //print(resp);
          mapWidget = SyncfusionMapWidget(
            records: resp,
            country: '',
          );
          buildBodyWidget();
        });
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    ctx = context;
    return getTabWidget(context, bodyWidget, WIDGETTYPE.GLOBAL, _tabController);
  }

  buildBodyWidget() {
    if (loading) {
      bodyWidget = Text('Loading...');
      chartWidget = Text('Loading...');
    } else {
      bodyWidget = TabBarView(controller: _tabController, children: <Widget>[
        getListingWidgetsBody(
            _search, records, ctx, WIDGETTYPE.GLOBAL, _gotoTab),
        mapWidget,
        chartWidget,
      ]);
    }
    setState(() {});
  }

  _search(term) {
    records = recordsObj.filterByCountry(term);
    buildBodyWidget();
  }

  _gotoTab(int tabIndex, Record record) {
    homeSceneService.getPregression(record.countrySlug).then((Records resp) {
      chartWidget = DailyProgressionChart.getDailyProgressionChart(
          resp.generateTimeSeriesRecords());
      buildBodyWidget();
      _tabController.animateTo(tabIndex);
    });
  }
}
