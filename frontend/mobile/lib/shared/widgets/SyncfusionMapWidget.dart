import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile/shared/entities/Record.dart';
import 'package:syncfusion_flutter_maps/maps.dart';

class SyncfusionMapWidget extends StatefulWidget {
  Records records;
  String country;

  SyncfusionMapWidget({Key key, this.records, this.country}) : super(key: key);

  @override
  State<StatefulWidget> createState() =>
      new _SyncfusionMapWidgetState(records, country);
}

class _SyncfusionMapWidgetState extends State<SyncfusionMapWidget> {
  MapShapeSource _dataSource;
  Records records;
  String country;

  _SyncfusionMapWidgetState(this.records, this.country);

  List<MapItemCount> _mapItemCounts;

  // The format which is used for formatting the tooltip text.
  final NumberFormat _numberFormat = NumberFormat('#.#');

  get mapData {
    String filePath = 'assets/config/';
    if (country == '') {
      filePath = filePath + 'world_data.geojson';
    } else {
      filePath = filePath + country + '.geojson';
    }
    return filePath;
  }

  @override
  void initState() {
    if (this.country == '') {
      _mapItemCounts =
          records.getMapItemCounts().getAllCountriesFor(DISPLAYTYPE.CONFIRMED);
    } else {
      _mapItemCounts =
          records.getMapItemCounts().getAllStateData(DISPLAYTYPE.CONFIRMED);
    }
    _dataSource = MapShapeSource.asset(mapData,
        shapeDataField: 'name',
        dataCount: _mapItemCounts.length,
        //dataLabelMapper: (int index) => _mapItemCounts[index].name,
        primaryValueMapper: (int index) => _mapItemCounts[index].name,
        shapeColorValueMapper: (int index) => _mapItemCounts[index].count,
        shapeColorMappers: const <MapColorMapper>[
          MapColorMapper(
              from: 0,
              to: 50000,
              color: Color.fromRGBO(1, 50, 32, 1),
              text: '{0},{50000}'),
          MapColorMapper(
              from: 50000,
              to: 100000,
              color: Color.fromRGBO(0, 100, 0, 1),
              text: '100000'),
          MapColorMapper(
              from: 100000,
              to: 500000,
              color: Color.fromRGBO(239, 101, 72, 1),
              text: '500k'),
          MapColorMapper(
              from: 500000,
              to: 1000000,
              color: Color.fromRGBO(255, 87, 51, 1),
              text: '>500k'),
          MapColorMapper(
              from: 1000000,
              to: 2000000,
              color: Color.fromRGBO(199, 0, 57, 1),
              text: '>1m'),
          MapColorMapper(
              from: 2000000,
              to: 5000000,
              color: Color.fromRGBO(144, 12, 63, 1),
              text: '>2m'),
          MapColorMapper(
              from: 5000000,
              to: 200000000,
              color: Color.fromRGBO(67, 13, 27, 1),
              text: '>5m'),
        ]);
    super.initState();
  }

  @override
  void dispose() {
    _mapItemCounts?.clear();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return _getMapsWidget();
  }

  Widget _getMapsWidget() {
    return SfMaps(
      title: const MapTitle(
        'World Daily Records',
        padding: EdgeInsets.only(top: 15, bottom: 30),
      ),
      layers: <MapLayer>[
        MapShapeLayer(
          loadingBuilder: (BuildContext context) {
            return Container(
              height: 25,
              width: 25,
              child: const CircularProgressIndicator(
                strokeWidth: 3,
              ),
            );
          },
          source: _dataSource,
          // Returns the custom tooltip for each shape.
          shapeTooltipBuilder: (BuildContext context, int index) {
            return Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(
                  _mapItemCounts[index].name +
                      ' : ' +
                      _numberFormat
                          .format(_mapItemCounts[index].count)
                          .toString(),
                  style: Theme.of(context)
                      .textTheme
                      .caption
                      .copyWith(color: Theme.of(context).colorScheme.surface)),
            );
          },
          strokeColor: Colors.white30,
          legend: MapLegend.bar(MapElement.shape,
              position: MapLegendPosition.bottom,
              overflowMode: MapLegendOverflowMode.wrap,
              labelsPlacement: MapLegendLabelsPlacement.betweenItems,
              padding: EdgeInsets.only(top: 15),
              spacing: 1.0,
              segmentSize: Size(55.0, 9.0)),
          tooltipSettings: MapTooltipSettings(
            color: const Color.fromRGBO(0, 32, 128, 1),
          ),
        ),
      ],
    );
  }
}
