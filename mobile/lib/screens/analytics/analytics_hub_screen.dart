/// Analytics hub screen — 3 tabs mirroring the web's analytics pages:
/// Overview, Products, and Categories. All metrics computed client-side
/// from transactions + products via [analyticsDataProvider].

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/analytics_providers.dart';
import 'tabs/analytics_overview_tab.dart';
import 'tabs/analytics_products_tab.dart';
import 'tabs/analytics_categories_tab.dart';
import 'tabs/analytics_sales_tab.dart';

class AnalyticsHubScreen extends ConsumerStatefulWidget {
  const AnalyticsHubScreen({super.key});

  @override
  ConsumerState<AnalyticsHubScreen> createState() => _AnalyticsHubScreenState();
}

class _AnalyticsHubScreenState extends ConsumerState<AnalyticsHubScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  AnalyticsPeriod _period = AnalyticsPeriod.d30;

  static const _tabs = [
    Tab(icon: Icon(Icons.insights_outlined), text: 'Overview'),
    Tab(icon: Icon(Icons.inventory_2_outlined), text: 'Products'),
    Tab(icon: Icon(Icons.category_outlined), text: 'Categories'),
    Tab(icon: Icon(Icons.receipt_long_outlined), text: 'Sales'),
  ];

  static const _periodLabels = {
    AnalyticsPeriod.today: 'Today',
    AnalyticsPeriod.d7: '7D',
    AnalyticsPeriod.d30: '30D',
    AnalyticsPeriod.thisMonth: 'Month',
    AnalyticsPeriod.d90: '90D',
  };

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Analytics'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(104),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Period selector
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                child: Row(
                  children: AnalyticsPeriod.values.map((p) {
                    final selected = _period == p;
                    return Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: ChoiceChip(
                        label: Text(_periodLabels[p]!),
                        selected: selected,
                        onSelected: (_) => setState(() => _period = p),
                      ),
                    );
                  }).toList(),
                ),
              ),
              TabBar(
                controller: _tabController,
                tabs: _tabs,
                isScrollable: true,
                tabAlignment: TabAlignment.start,
                indicatorSize: TabBarIndicatorSize.label,
              ),
            ],
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          AnalyticsOverviewTab(period: _period),
          AnalyticsProductsTab(period: _period),
          AnalyticsCategoriesTab(period: _period),
          AnalyticsSalesTab(period: _period),
        ],
      ),
    );
  }
}
