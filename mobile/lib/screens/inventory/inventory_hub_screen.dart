/// Inventory hub screen — tabbed container for all inventory sections.
/// Mirrors the web app's `/inventory` pages: Stock on Hand, Adjustments,
/// Movements, Low Stock, and Stock Analysis.

import 'package:flutter/material.dart';

import 'tabs/stock_on_hand_tab.dart';
import 'tabs/stock_adjustments_tab.dart';
import 'tabs/stock_movements_tab.dart';
import 'tabs/low_stock_tab.dart';
import 'tabs/stock_analysis_tab.dart';

class InventoryHubScreen extends StatefulWidget {
  final int initialTab;
  const InventoryHubScreen({super.key, this.initialTab = 0});

  @override
  State<InventoryHubScreen> createState() => _InventoryHubScreenState();
}

class _InventoryHubScreenState extends State<InventoryHubScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  static const _tabs = [
    Tab(icon: Icon(Icons.inventory_2_outlined), text: 'Stock'),
    Tab(icon: Icon(Icons.tune_rounded), text: 'Adjustments'),
    Tab(icon: Icon(Icons.swap_vert_rounded), text: 'Movements'),
    Tab(icon: Icon(Icons.warning_amber_rounded), text: 'Low Stock'),
    Tab(icon: Icon(Icons.analytics_outlined), text: 'Analysis'),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: _tabs.length,
      vsync: this,
      initialIndex: widget.initialTab.clamp(0, _tabs.length - 1),
    );
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
        title: const Text('Inventory'),
        bottom: TabBar(
          controller: _tabController,
          tabs: _tabs,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          indicatorSize: TabBarIndicatorSize.label,
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          StockOnHandTab(),
          StockAdjustmentsTab(),
          StockMovementsTab(),
          LowStockTab(),
          StockAnalysisTab(),
        ],
      ),
    );
  }
}
