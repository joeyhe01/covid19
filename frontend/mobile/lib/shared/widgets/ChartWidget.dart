import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';
import 'package:mobile/shared/entities/Record.dart';

// ignore: must_be_immutable
class DailyProgressionChart extends StatelessWidget {
  List<charts.Series> dailyDataList;
  bool animate;
  List<charts.Series<TimeSeriesRecord, DateTime>> recordSeries;

  DailyProgressionChart({Key key, this.recordSeries, this.animate})
      : super(key: key);

  static getDailyProgressionChart(
      List<charts.Series<TimeSeriesRecord, DateTime>> _recordSeries) {
    return new DailyProgressionChart(
      recordSeries: _recordSeries,
      // Disable animations for image tests.
      animate: false,
    );
  }

  @override
  Widget build(BuildContext context) {
    print(recordSeries[0].data[0].count);
    return new charts.TimeSeriesChart(
      recordSeries,
      animate: animate,

      // Configure the default renderer as a line renderer. This will be used
      // for any series that does not define a rendererIdKey.
      //
      // This is the default configuration, but is shown here for  illustration.
      defaultRenderer: new charts.LineRendererConfig(),
      // Custom renderer configuration for the point series.
      customSeriesRenderers: [
        new charts.PointRendererConfig(
            // ID used to link series to this renderer.
            customRendererId: 'customPoint')
      ],

      primaryMeasureAxis: new charts.NumericAxisSpec(
          tickProviderSpec:
              new charts.BasicNumericTickProviderSpec(desiredTickCount: 6)),
      secondaryMeasureAxis: new charts.NumericAxisSpec(
          tickProviderSpec:
              new charts.BasicNumericTickProviderSpec(desiredTickCount: 6)),

      // Optionally pass in a [DateTimeFactory] used by the chart. The factory
      // should create the same type of [DateTime] as the data provided. If none
      // specified, the default creates local date time.
      dateTimeFactory: const charts.LocalDateTimeFactory(),
    );
  }
}
