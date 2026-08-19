/// Shifts screen — manage cashier shifts (open/close/cash drawer).
/// Mirrors the web app's `/pos/shifts` page.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api_client.dart';
import '../../core/formatters.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common.dart';

final shiftsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('/pos/shifts/');
  final data = res.data;
  if (data is List) return data.isNotEmpty ? data[0] as Map<String, dynamic> : <String, dynamic>{};
  if (data is Map<String, dynamic>) {
    final results = data['results'];
    if (results is List && results.isNotEmpty) return results[0] as Map<String, dynamic>;
    return data;
  }
  return <String, dynamic>{};
});

class ShiftsScreen extends ConsumerStatefulWidget {
  const ShiftsScreen({super.key});

  @override
  ConsumerState<ShiftsScreen> createState() => _ShiftsScreenState();
}

class _ShiftsScreenState extends ConsumerState<ShiftsScreen> {
  final _openingCashController = TextEditingController();
  bool _isProcessing = false;

  @override
  void dispose() {
    _openingCashController.dispose();
    super.dispose();
  }

  Future<void> _openShift() async {
    if (_isProcessing) return;
    setState(() => _isProcessing = true);
    try {
      final api = ref.read(apiClientProvider);
      await api.post('/pos/shifts/open/', data: {
        'opening_cash': double.tryParse(_openingCashController.text) ?? 0,
      });
      ref.invalidate(shiftsProvider);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  Future<void> _closeShift() async {
    if (_isProcessing) return;
    showDialog(
      context: context,
      builder: (context) {
        final closingController = TextEditingController();
        return AlertDialog(
          title: const Text('Close Shift'),
          content: TextField(
            controller: closingController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Closing Cash Count',
              prefixText: 'KSh ',
              border: OutlineInputBorder(),
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            FilledButton(
              onPressed: () async {
                Navigator.pop(context);
                setState(() => _isProcessing = true);
                try {
                  final api = ref.read(apiClientProvider);
                  await api.post('/pos/shifts/close/', data: {
                    'closing_cash': double.tryParse(closingController.text) ?? 0,
                  });
                  ref.invalidate(shiftsProvider);
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed: $e')),
                    );
                  }
                } finally {
                  if (mounted) setState(() => _isProcessing = false);
                }
              },
              child: const Text('Close Shift'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final currency = auth.billing?.currency ?? 'KSh';
    final shiftAsync = ref.watch(shiftsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Shifts')),
      body: shiftAsync.when(
        loading: () => const LoadingWidget(),
        error: (e, _) => ErrorStateWidget(
          message: 'Failed to load shift data',
          onRetry: () => ref.invalidate(shiftsProvider),
        ),
        data: (shift) {
          final isOpen = shift['status'] == 'open' || shift['is_open'] == true;
          if (!isOpen && shift.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.lock_clock, size: 56),
                    const SizedBox(height: 16),
                    const Text('No active shift', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    const Text('Open a shift to start processing sales.'),
                    const SizedBox(height: 24),
                    FilledButton.icon(
                      onPressed: () => _showOpenShiftDialog(),
                      icon: const Icon(Icons.play_arrow),
                      label: const Text('Open Shift'),
                    ),
                  ],
                ),
              ),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Status', style: TextStyle(color: Colors.grey)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                              decoration: BoxDecoration(
                                color: isOpen ? Colors.green.withOpacity(0.15) : Colors.red.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                isOpen ? 'OPEN' : 'CLOSED',
                                style: TextStyle(
                                  color: isOpen ? Colors.green : Colors.red,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        if (shift['opened_at'] != null)
                          _infoRow('Opened', Formatters.dateTime(shift['opened_at'])),
                        if (shift['opening_cash'] != null)
                          _infoRow('Opening Cash', Formatters.currency(shift['opening_cash'], currency)),
                        if (shift['cash_sales'] != null)
                          _infoRow('Cash Sales', Formatters.currency(shift['cash_sales'], currency)),
                        if (shift['card_sales'] != null)
                          _infoRow('Card Sales', Formatters.currency(shift['card_sales'], currency)),
                        if (shift['total_sales'] != null)
                          _infoRow('Expected Cash', Formatters.currency(shift['expected_cash'] ?? shift['total_sales'], currency)),
                        if (shift['transaction_count'] != null)
                          _infoRow('Transactions', Formatters.number(shift['transaction_count'])),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                if (isOpen)
                  FilledButton.icon(
                    onPressed: _isProcessing ? null : _closeShift,
                    icon: const Icon(Icons.stop),
                    label: const Text('Close Shift'),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  void _showOpenShiftDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Open Shift'),
        content: TextField(
          controller: _openingCashController,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: 'Opening Cash in Drawer',
            prefixText: 'KSh ',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(
            onPressed: _isProcessing ? null : () async {
              Navigator.pop(context);
              await _openShift();
            },
            child: const Text('Open'),
          ),
        ],
      ),
    );
  }
}
