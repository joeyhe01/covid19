import 'package:flutter/material.dart';
import 'package:mobile/pages/ProvinceSceneService.dart';
import 'package:mobile/shared/entities/Record.dart';
import 'package:mobile/shared/entities/ScreenArguments.dart';
import 'package:mobile/shared/widgets/ChartWidget.dart';
import 'package:mobile/shared/widgets/ItemsWidgets.dart';

class ProvinceScene extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => new _ProvinceSceneState();
}

class _ProvinceSceneState extends State<ProvinceScene>
    with SingleTickerProviderStateMixin {
  bool loading = true;
  ProvinceSceneService provinceSceneService = new ProvinceSceneService();
  List<Record> records;
  Records recordsObj;
  Widget bodyWidget;
  Widget chartWidget;
  BuildContext ctx;

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
      provinceSceneService
          .getProvinceRecordsFor(args.country, args.province)
          .then((Records resp) {
        loading = false;
        recordsObj = resp;
        records = resp.records;
        buildBodyWidget();
      });
    }
    return getTabWidget(
        context, bodyWidget, WIDGETTYPE.PROVINCE, _tabController);
  }

  buildBodyWidget() {
    if (loading) {
      bodyWidget = Text('Loading...');
      chartWidget = Text('Loading...');
    } else {
      bodyWidget = TabBarView(controller: _tabController, children: <Widget>[
        getListingWidgetsBody(
            _search, records, ctx, WIDGETTYPE.PROVINCE, _gotoTab),
        _mapWidgetBody,
        chartWidget,
      ]);
    }
    setState(() {});
  }

  get _mapWidgetBody {
    return Text('GEO Mapping...');
  }

  _search(term) {
    records = recordsObj.filterByCity(term);
    buildBodyWidget();
  }

  _gotoTab(int tabIndex, Record record) {
    provinceSceneService
        .getProgressionFor(
            record.countrySlug, record.provinceSlug, record.cityCode)
        .then((Records resp) {
      chartWidget = DailyProgressionChart.getDailyProgressionChart(
          resp.generateTimeSeriesRecords());
      buildBodyWidget();
    });
    _tabController.animateTo(tabIndex);
  }
}
