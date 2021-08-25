import 'package:flutter/material.dart';
import 'package:flutter_map/plugin_api.dart';
import "package:latlong/latlong.dart";

class MapWidget extends StatelessWidget {
  final double centerLat = 40.8;
  final double centerLon = -100;

  final double minZoom = 1;
  final double maxZoom = 10;

  @override
  Widget build(BuildContext context) {
    return new FlutterMap(
      options: new MapOptions(
          center: new LatLng(centerLat, centerLon),
          minZoom: minZoom,
          maxZoom: maxZoom,
          zoom: 3.8),
      layers: [
        new TileLayerOptions(
            urlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            subdomains: ['a', 'b', 'c']),
        new MarkerLayerOptions(
          markers: [
            new Marker(
              width: 80.0,
              height: 80.0,
              point: new LatLng(centerLat, centerLon),
              builder: (ctx) => new Container(
                child: new FlutterLogo(),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
