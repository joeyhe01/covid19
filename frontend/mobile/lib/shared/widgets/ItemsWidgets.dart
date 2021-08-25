import 'package:flutter/material.dart';
import 'package:flutter_slidable/flutter_slidable.dart';
import 'package:mobile/shared/Layout.dart';
import 'package:mobile/shared/entities/Record.dart';
import 'package:mobile/shared/entities/ScreenArguments.dart';

enum WIDGETTYPE { GLOBAL, COUNTRY, PROVINCE }

Widget getTabWidget(BuildContext context, Widget bodyWidget, WIDGETTYPE type,
    TabController controller) {
  String title = '';
  if (type == WIDGETTYPE.GLOBAL) {
    title = 'Global View';
  } else if (type == WIDGETTYPE.COUNTRY) {
    title = 'Country View';
  } else if (type == WIDGETTYPE.PROVINCE) {
    title = 'Province View';
  }

  return Scaffold(
    appBar: LayoutAppBar().toPreferredSizeWidget(context, title),
    //drawer: LayoutDrawer(),
    body: SafeArea(
      child: bodyWidget,
    ),
    bottomNavigationBar: Material(
      color: Theme.of(context).colorScheme.primary,
      child: TabBar(
        controller: controller,
        tabs: <Widget>[
          Tab(
            icon: Icon(Icons.list),
            child: Text('List'),
          ),
          Tab(
            icon: Icon(Icons.map),
            child: Text('Map'),
          ),
          Tab(
            icon: Icon(Icons.bar_chart),
            child: Text('Chart'),
          ),
        ],
      ),
    ),
  );

//
//  return DefaultTabController(
//      length: 3,
//      child: Scaffold(
//        appBar: LayoutAppBar().toPreferredSizeWidget(context, title),
//        //drawer: LayoutDrawer(),
//        body: SafeArea(
//          child: bodyWidget,
//        ),
//        bottomNavigationBar: Material(
//          color: Theme.of(context).colorScheme.primary,
//          child: TabBar(
//            tabs: <Widget>[
//              Tab(
//                icon: Icon(Icons.list),
//                child: Text('List'),
//              ),
//              Tab(
//                icon: Icon(Icons.map),
//                child: Text('Map'),
//              ),
//              Tab(
//                icon: Icon(Icons.bar_chart),
//                child: Text('Chart'),
//              ),
//            ],
//          ),
//        ),
//      ));
}

Widget getListingWidgetsBody(Function searchFunction, List<Record> records,
    BuildContext context, WIDGETTYPE type, Function gotoTabFunc) {
  return Column(
    children: [
      Align(
          alignment: Alignment.centerLeft,
          child: Container(
            width: 350,
            padding: EdgeInsets.only(left: 30),
            child: TextField(
              onChanged: (val) => searchFunction(val),
              decoration:
                  InputDecoration(labelText: 'Search:', icon: Icon(Icons.book)),
            ),
          )),
      Align(
          alignment: Alignment.centerLeft,
          child: Padding(
            padding: EdgeInsets.only(left: 30.0, top: 10.0),
            child: Text('Total Records: ' + records.length.toString()),
          )),
      Expanded(
          child: ListView.builder(
        scrollDirection: Axis.vertical,
        itemCount: records.length,
        itemBuilder: (ctx, int i) {
          return getSlidableItemWidget(ctx, records[i], type, gotoTabFunc);
        },
      ))
    ],
  );
}

Widget getSlidableItemWidget(BuildContext context, Record record,
    WIDGETTYPE type, Function gotoTabFunc) {
  return Slidable(
    actionPane: SlidableDrawerActionPane(),
    actionExtentRatio: 0.25,
    child: getItemWidget(context, record, type),
    actions: <Widget>[
      IconSlideAction(
        caption: 'Daily',
        color: Colors.blue,
        icon: Icons.show_chart,
        onTap: () {
          gotoTabFunc(2, record);
        },
      ),
    ],
    secondaryActions: <Widget>[
      IconSlideAction(
        caption: type == WIDGETTYPE.GLOBAL ? 'Province View' : 'City View',
        color: Colors.orange,
        icon: Icons.details,
        onTap: () {
          if (type == WIDGETTYPE.GLOBAL) {
            Navigator.pushNamed(context, '/countryDetail',
                arguments: ScreenArguments(record.countrySlug, ''));
          } else if (type == WIDGETTYPE.COUNTRY) {
            Navigator.pushNamed(context, '/provinceDetail',
                arguments:
                    ScreenArguments(record.countrySlug, record.provinceSlug));
          }
        },
      ),
    ],
  );
}

Widget getItemWidget(BuildContext context, Record record, WIDGETTYPE type) {
  String name = '';
  if (type == WIDGETTYPE.GLOBAL) {
    name = record.countryName;
  } else if (type == WIDGETTYPE.COUNTRY) {
    name = record.provinceName;
  } else {
    name = record.cityName;
  }
  return InkWell(
      child: GestureDetector(
    onTap: () {
      if (type == WIDGETTYPE.GLOBAL) {
        Navigator.pushNamed(context, '/countryDetail',
            arguments: ScreenArguments(record.countrySlug, ''));
      } else if (type == WIDGETTYPE.COUNTRY) {
        Navigator.pushNamed(context, '/provinceDetail',
            arguments:
                ScreenArguments(record.countrySlug, record.provinceSlug));
      }
    },
    child: Container(
        padding: EdgeInsets.all(10.0),
        margin: EdgeInsets.only(left: 30.0, right: 30.0, top: 10.0),
        decoration: BoxDecoration(border: Border.all(width: 1.0)),
        child: Column(children: [
          Padding(
            padding: EdgeInsets.only(bottom: 5),
            child: Text(name,
                style: Theme.of(context)
                    .textTheme
                    .subtitle
                    .copyWith(decoration: TextDecoration.underline)),
          ),
          Table(
            children: <TableRow>[
              TableRow(children: [
                Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    'Confirmed:  ',
                    style: Theme.of(context).textTheme.bodyText1,
                  ),
                ),
                Text(record.confirmed.toString())
              ]),
              TableRow(children: [
                Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    'Active:  ',
                    style: Theme.of(context).textTheme.bodyText1,
                  ),
                ),
                Text(record.active.toString())
              ]),
              TableRow(children: [
                Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    'Deaths:  ',
                    style: Theme.of(context).textTheme.bodyText1,
                  ),
                ),
                Text(record.deaths.toString())
              ]),
              TableRow(children: [
                Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    'Recorvered:  ',
                    style: Theme.of(context).textTheme.bodyText1,
                  ),
                ),
                Text(record.recovered.toString())
              ]),
            ],
          ),
        ])),
  ));
}
