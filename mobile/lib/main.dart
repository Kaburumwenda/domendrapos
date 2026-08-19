import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/theme.dart';
import 'providers/auth_provider.dart';
import 'providers/router_provider.dart';

void main() {
  runApp(const ProviderScope(child: DomendraPOSApp()));
}

class DomendraPOSApp extends ConsumerStatefulWidget {
  const DomendraPOSApp({super.key});

  @override
  ConsumerState<DomendraPOSApp> createState() => _DomendraPOSAppState();
}

class _DomendraPOSAppState extends ConsumerState<DomendraPOSApp> {
  bool _initDone = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await ref.read(authProvider.notifier).init();
      if (mounted) setState(() => _initDone = true);
    });
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);

    if (!_initDone) {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        home: const Scaffold(
          body: Center(child: CircularProgressIndicator()),
        ),
      );
    }

    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'DomendraPOS',
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: ThemeMode.system,
      routerConfig: router,
    );
  }
}
