import 'package:flutter/material.dart';
import 'package:mobile/shared/Layout.dart';

class LandingScene extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: LayoutAppBar()
          .toPreferredSizeWidget(context, 'Covid19 Daily Tracker'),
      drawer: LayoutDrawer(),
      body: _landingWidget(context),
    );
  }

  Widget _landingWidget(context) {
    return Align(
        child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          'Welcome to Covid19 Daily Tracker',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 24),
        ),
        Padding(
          padding: EdgeInsets.only(left: 30.0, top: 20, bottom: 30),
          child: Text(
            'Corona virus tracker app created by Joey He, with data collected from Johns Hopkins University CSSE\'s Github.',
          ),
        ),
        RaisedButton(
            color: Colors.blue,
            child: Text(
              'Enter',
              style: TextStyle(color: Colors.white),
            ),
            onPressed: () {
              gotoDetail(context);
            })
      ],
    ));
  }

  gotoDetail(BuildContext context) {
    Navigator.pushNamed(context, '/home');
  }
}
