import 'package:mobile/shared/entities/Record.dart';
import 'package:syncfusion_flutter_maps/maps.dart';

class MapWidgetService {
  MapShapeSource generateMapWidgetShapeSource(
      String countryName, Records records) {
    List<MapItemCount> _mapItemCounts;
    String fileName = 'assets/config/';



    if (countryName == '') {
      _mapItemCounts =
          records.getMapItemCounts().getAllCountriesFor(DISPLAYTYPE.CONFIRMED);
      fileName = fileName + 'world_data.json';
    }

  }
}
