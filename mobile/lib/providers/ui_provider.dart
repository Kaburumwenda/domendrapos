/// UI-related providers: scaffold key (for drawer access) and sidebar state.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Global scaffold key so nested screens (e.g. Dashboard) can open the
/// AppShell's drawer without being direct children of that Scaffold.
final scaffoldKeyProvider = Provider<GlobalKey<ScaffoldState>>((ref) {
  return GlobalKey<ScaffoldState>();
});

/// Whether the web sidebar is expanded (true) or collapsed to icons (false).
final sidebarExpandedProvider = StateProvider<bool>((ref) => true);
