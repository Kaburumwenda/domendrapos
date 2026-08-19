/// Modern login screen with email/password form and biometric unlock.
/// Mirrors the web app's `/login` page.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscure = true;
  bool _demoExpanded = false;
  late final AnimationController _shakeController;
  late final Animation<double> _shakeAnimation;

  @override
  void initState() {
    super.initState();
    _emailController.text = 'admin@demo.domendrapos.com';
    _passwordController.text = 'demo1234';

    _shakeController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    _shakeAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _shakeController, curve: Curves.elasticIn),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _shakeController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) {
      _shakeController.forward(from: 0);
      return;
    }
    final success = await ref.read(authProvider.notifier).login(
          _emailController.text.trim(),
          _passwordController.text,
        );
    if (success && mounted) {
      final auth = ref.read(authProvider);
      if (auth.status == AuthStatus.locked) {
        context.go('/billing/locked');
      } else {
        context.go('/dashboard');
      }
    }
  }

  Future<void> _biometricLogin() async {
    final success = await ref.read(authProvider.notifier).biometricUnlock();
    if (success && mounted) {
      context.go('/dashboard');
    }
  }

  void _applyDemoCredentials() {
    _emailController.text = 'admin@demo.domendrapos.com';
    _passwordController.text = 'demo1234';
    _demoExpanded = false;
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;
    final auth = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: scheme.surface,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Card(
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(28),
                  child: AnimatedBuilder(
                    animation: _shakeAnimation,
                    builder: (context, child) {
                      final offset = _shakeController.status == AnimationStatus.forward
                          ? 8 * _shakeAnimation.value * (_shakeAnimation.value.isNegative ? -1 : 1)
                          : 0.0;
                      return Transform.translate(
                        offset: Offset(offset, 0),
                        child: child,
                      );
                    },
                    child: Form(
                      key: _formKey,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _Header(scheme: scheme, textTheme: textTheme),
                          const SizedBox(height: 28),
                          _EmailField(
                            controller: _emailController,
                            enabled: !auth.isLoading,
                          ),
                          const SizedBox(height: 16),
                          _PasswordField(
                            controller: _passwordController,
                            obscure: _obscure,
                            enabled: !auth.isLoading,
                            onToggleObscure: () => setState(() => _obscure = !_obscure),
                            onSubmitted: (_) => _login(),
                          ),
                          const SizedBox(height: 12),
                          _DemoCredentialsTile(
                            expanded: _demoExpanded,
                            onExpansionChanged: (value) => setState(() => _demoExpanded = value),
                            onApply: _applyDemoCredentials,
                          ),
                          const SizedBox(height: 18),
                          if (auth.error != null) _ErrorBanner(message: auth.error!, scheme: scheme),
                          _SignInButton(
                            isLoading: auth.isLoading,
                            onPressed: _login,
                          ),
                          const SizedBox(height: 14),
                          if (auth.biometricAvailable)
                            _BiometricButton(onPressed: _biometricLogin),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.scheme, required this.textTheme});

  final ColorScheme scheme;
  final TextTheme textTheme;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Hero(
          tag: 'login-logo',
          child: Container(
            width: 88,
            height: 88,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [scheme.primary, scheme.primary.withOpacity(0.8)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(22),
              boxShadow: [
                BoxShadow(
                  color: scheme.primary.withOpacity(0.25),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Icon(
              Icons.point_of_sale_rounded,
              size: 46,
              color: scheme.onPrimary,
            ),
          ),
        ),
        const SizedBox(height: 20),
        Text(
          'Welcome back',
          style: textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w800,
                color: scheme.onSurface,
              ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 4),
        Text(
          'Sign in to DomendraPOS',
          style: textTheme.bodyMedium?.copyWith(
                color: scheme.onSurfaceVariant,
                fontWeight: FontWeight.w500,
              ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

class _EmailField extends StatelessWidget {
  const _EmailField({required this.controller, required this.enabled});

  final TextEditingController controller;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      enabled: enabled,
      decoration: const InputDecoration(
        labelText: 'Email',
        hintText: 'you@company.com',
        prefixIcon: Icon(Icons.email_outlined),
      ),
      keyboardType: TextInputType.emailAddress,
      textInputAction: TextInputAction.next,
      validator: (v) {
        if (v == null || v.trim().isEmpty) return 'Email is required';
        if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(v)) {
          return 'Enter a valid email address';
        }
        return null;
      },
    );
  }
}

class _PasswordField extends StatelessWidget {
  const _PasswordField({
    required this.controller,
    required this.obscure,
    required this.enabled,
    required this.onToggleObscure,
    required this.onSubmitted,
  });

  final TextEditingController controller;
  final bool obscure;
  final bool enabled;
  final VoidCallback onToggleObscure;
  final ValueChanged<String> onSubmitted;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      enabled: enabled,
      decoration: InputDecoration(
        labelText: 'Password',
        hintText: 'Enter your password',
        prefixIcon: const Icon(Icons.lock_outline),
        suffixIcon: IconButton(
          icon: Icon(obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined),
          tooltip: obscure ? 'Show password' : 'Hide password',
          onPressed: onToggleObscure,
        ),
      ),
      obscureText: obscure,
      textInputAction: TextInputAction.done,
      validator: (v) {
        if (v == null || v.isEmpty) return 'Password is required';
        return null;
      },
      onFieldSubmitted: onSubmitted,
    );
  }
}

class _DemoCredentialsTile extends StatelessWidget {
  const _DemoCredentialsTile({
    required this.expanded,
    required this.onExpansionChanged,
    required this.onApply,
  });

  final bool expanded;
  final ValueChanged<bool> onExpansionChanged;
  final VoidCallback onApply;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Material(
        color: scheme.surfaceContainerHighest.withOpacity(0.3),
        child: ExpansionTile(
          title: Text(
            'Demo Credentials',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: scheme.onSurfaceVariant,
            ),
          ),
          tilePadding: const EdgeInsets.symmetric(horizontal: 12),
          expandedAlignment: Alignment.centerLeft,
          initiallyExpanded: expanded,
          onExpansionChanged: onExpansionChanged,
          children: [
            ListTile(
              dense: true,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12),
              leading: Icon(Icons.person_outline, size: 20, color: scheme.primary),
              title: Text(
                'admin@demo.domendrapos.com',
                style: TextStyle(fontSize: 13, color: scheme.onSurface),
              ),
              subtitle: const Text(
                'Password: demo1234',
                style: TextStyle(fontSize: 12),
              ),
              trailing: FilledButton.tonal(
                onPressed: onApply,
                style: FilledButton.styleFrom(
                  minimumSize: const Size(64, 32),
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  textStyle: const TextStyle(fontSize: 12),
                ),
                child: const Text('Use'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message, required this.scheme});

  final String message;
  final ColorScheme scheme;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: scheme.errorContainer,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: scheme.error.withOpacity(0.2)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.error_outline, size: 18, color: scheme.onErrorContainer),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                color: scheme.onErrorContainer,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SignInButton extends StatelessWidget {
  const _SignInButton({required this.isLoading, required this.onPressed});

  final bool isLoading;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: FilledButton(
        onPressed: isLoading ? null : onPressed,
        style: FilledButton.styleFrom(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        child: isLoading
            ? const SizedBox(
                height: 22,
                width: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: Colors.white,
                ),
              )
            : const Text('Sign In'),
      ),
    );
  }
}

class _BiometricButton extends StatelessWidget {
  const _BiometricButton({required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return SizedBox(
      width: double.infinity,
      height: 48,
      child: OutlinedButton.icon(
        onPressed: onPressed,
        icon: Icon(Icons.fingerprint, color: scheme.primary),
        label: const Text('Sign in with Biometrics'),
        style: OutlinedButton.styleFrom(
          side: BorderSide(color: scheme.outlineVariant),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          textStyle: TextStyle(
            fontWeight: FontWeight.w600,
            color: scheme.onSurface,
          ),
        ),
      ),
    );
  }
}
