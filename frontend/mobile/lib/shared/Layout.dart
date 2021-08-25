import 'package:flutter/material.dart';

class LayoutAppBar extends StatelessWidget {
  @override
  PreferredSizeWidget build(BuildContext context) {
    return AppBar(
      title: Text('Covid Daily Tracker'),
    );
  }

  PreferredSizeWidget toPreferredSizeWidget(
      BuildContext context, String title) {
    return AppBar(
      title: Text(title),
    );
  }
}

class LayoutDrawer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Drawer(
      elevation: 5.0,
      child: ListView(
        children: <Widget>[
          DrawerHeader(
            child: Text('Go to...'),
          ),
          ListTile(
            title: Text('Home Page'),
            onTap: () {
              Navigator.pushNamed(context, '/home');
            },
          ),
        ],
      ),
    );
  }
}
