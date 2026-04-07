import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/constants.dart';
import '../../services/api_service.dart';

class SubscriptionScreen extends StatefulWidget {
  const SubscriptionScreen({Key? key}) : super(key: key);

  @override
  State<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends State<SubscriptionScreen> {
  final ApiService _apiService = ApiService();

  List<dynamic> _plans = [];
  Map<String, dynamic>? _currentSubscription;
  bool _loadingPlans = true;
  bool _loadingCurrent = true;
  bool _subscribing = false;

  @override
  void initState() {
    super.initState();
    _fetchPlans();
    _fetchCurrentSubscription();
  }

  Future<void> _fetchPlans() async {
    setState(() => _loadingPlans = true);
    try {
      final res = await _apiService.get(ApiConstants.subscriptionPlans);
      if (res.statusCode == 200) {
        final data = json.decode(utf8.decode(res.bodyBytes));
        setState(() => _plans = data is List ? data : []);
      }
    } catch (_) {}
    if (mounted) setState(() => _loadingPlans = false);
  }

  Future<void> _fetchCurrentSubscription() async {
    setState(() => _loadingCurrent = true);
    try {
      final res = await _apiService.get(ApiConstants.mySubscription);
      if (res.statusCode == 200) {
        final body = res.body;
        if (body.isNotEmpty && body != 'null') {
          final data = json.decode(utf8.decode(res.bodyBytes));
          setState(() => _currentSubscription =
              data is Map<String, dynamic> ? data : null);
        }
      }
    } catch (_) {}
    if (mounted) setState(() => _loadingCurrent = false);
  }

  Future<void> _subscribe(Map<String, dynamic> plan) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text('Xác nhận đăng ký',
            style: TextStyle(color: AppColors.textPrimary)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Gói: ${plan['name']}',
                style: const TextStyle(
                    color: AppColors.textPrimary, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(
              'Giá: ${_formatPrice(plan['price'])} VNĐ / ${plan['durationDays']} ngày',
              style: const TextStyle(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 8),
            Text(
              'Mượn tối đa: ${plan['maxBorrowBooks']} sách đồng thời',
              style: const TextStyle(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.amber.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.amber.withOpacity(0.3)),
              ),
              child: const Text(
                '⚠️ Demo: thanh toán sẽ được xử lý thủ công. Vui lòng liên hệ quản trị viên.',
                style: TextStyle(color: Colors.amber, fontSize: 12),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Hủy',
                style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Đăng ký'),
          ),
        ],
      ),
    );

    if (confirm != true) return;
    setState(() => _subscribing = true);

    try {
      final res = await _apiService.post(
        ApiConstants.subscriptionActivate,
        {
          'planId': plan['id'],
          'paymentRef': 'DEMO_${DateTime.now().millisecondsSinceEpoch}',
        },
      );
      if (!mounted) return;
      if (res.statusCode == 200 || res.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          backgroundColor: Colors.green[700],
          content: Text('Đăng ký gói "${plan['name']}" thành công!'),
        ));
        _fetchCurrentSubscription();
      } else {
        final body = json.decode(utf8.decode(res.bodyBytes));
        final msg = body['message'] ?? 'Đăng ký thất bại';
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          backgroundColor: AppColors.error,
          content: Text(msg),
        ));
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        backgroundColor: AppColors.error,
        content: Text('Lỗi kết nối. Vui lòng thử lại.'),
      ));
    } finally {
      if (mounted) setState(() => _subscribing = false);
    }
  }

  String _formatPrice(dynamic price) {
    if (price == null) return '0';
    final num = double.tryParse(price.toString()) ?? 0;
    if (num == 0) return 'Miễn phí';
    return num.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+$)'),
      (m) => '${m[1]}.',
    );
  }

  String _formatDate(String? iso) {
    if (iso == null) return '';
    try {
      final dt = DateTime.parse(iso).toLocal();
      return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
    } catch (_) {
      return iso;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Gói Thành Viên'),
        backgroundColor: AppColors.surface,
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async {
          await _fetchPlans();
          await _fetchCurrentSubscription();
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Current subscription card
            _buildCurrentSubscriptionCard(),
            const SizedBox(height: 24),
            const Text(
              'Các gói hiện có',
              style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 18,
                  fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            // Plans list
            _loadingPlans
                ? const Center(
                    child: CircularProgressIndicator(color: AppColors.primary))
                : _plans.isEmpty
                    ? const Center(
                        child: Text('Chưa có gói nào',
                            style:
                                TextStyle(color: AppColors.textSecondary)))
                    : Column(
                        children: _plans
                            .map((p) => _buildPlanCard(p))
                            .toList(),
                      ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentSubscriptionCard() {
    if (_loadingCurrent) {
      return Container(
        height: 80,
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Center(
            child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    if (_currentSubscription == null) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.divider),
        ),
        child: const Row(
          children: [
            Icon(Icons.info_outline, color: AppColors.textSecondary),
            SizedBox(width: 12),
            Expanded(
              child: Text(
                'Bạn chưa đăng ký gói thành viên nào. Hãy chọn gói bên dưới để mở khóa đọc sách!',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
              ),
            ),
          ],
        ),
      );
    }

    final sub = _currentSubscription!;
    final plan = sub['plan'] as Map<String, dynamic>?;
    final status = sub['status'] as String? ?? '';

    Color statusColor;
    switch (status) {
      case 'ACTIVE':
        statusColor = Colors.green;
        break;
      case 'EXPIRED':
        statusColor = Colors.red;
        break;
      default:
        statusColor = Colors.orange;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary.withOpacity(0.2),
            AppColors.secondary.withOpacity(0.1),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
            color: AppColors.primary.withOpacity(0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.workspace_premium,
                  color: AppColors.primary, size: 24),
              const SizedBox(width: 8),
              Text(plan?['name'] ?? 'Gói hiện tại',
                  style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.bold,
                      fontSize: 16)),
              const Spacer(),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  status,
                  style: TextStyle(
                      color: statusColor,
                      fontSize: 12,
                      fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            'Từ: ${_formatDate(sub['startDate'])}  →  Đến: ${_formatDate(sub['endDate'])}',
            style: const TextStyle(
                color: AppColors.textSecondary, fontSize: 13),
          ),
          if (plan != null) ...[
            const SizedBox(height: 6),
            Text(
              'Mượn tối đa: ${plan['maxBorrowBooks']} sách',
              style: const TextStyle(
                  color: AppColors.textSecondary, fontSize: 13),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPlanCard(Map<String, dynamic> plan) {
    final isCurrentPlan = _currentSubscription?['plan']?['id'] == plan['id'] &&
        _currentSubscription?['status'] == 'ACTIVE';
    final isFree =
        (double.tryParse(plan['price']?.toString() ?? '0') ?? 0) == 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isCurrentPlan
              ? AppColors.primary
              : AppColors.divider,
          width: isCurrentPlan ? 2 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (isCurrentPlan)
                Container(
                  margin: const EdgeInsets.only(right: 8),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text('Hiện tại',
                      style: TextStyle(
                          color: AppColors.primary,
                          fontSize: 11,
                          fontWeight: FontWeight.bold)),
                ),
              Text(plan['name'] ?? '',
                  style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.bold,
                      fontSize: 16)),
              const Spacer(),
              Text(
                isFree
                    ? 'Miễn phí'
                    : '${_formatPrice(plan['price'])} VNĐ',
                style: TextStyle(
                    color: isFree ? Colors.green : AppColors.primary,
                    fontWeight: FontWeight.bold,
                    fontSize: 16),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (plan['description'] != null && (plan['description'] as String).isNotEmpty)
            Text(plan['description'],
                style: const TextStyle(
                    color: AppColors.textSecondary, fontSize: 13)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              _chip(Icons.calendar_today, '${plan['durationDays']} ngày'),
              _chip(Icons.menu_book, 'Mượn ${plan['maxBorrowBooks']} sách'),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: (_subscribing || isCurrentPlan)
                  ? null
                  : () => _subscribe(plan),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              child: Text(
                isCurrentPlan ? 'Đang dùng' : 'Đăng ký ngay',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _chip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: AppColors.primary, size: 14),
          const SizedBox(width: 5),
          Text(label,
              style: const TextStyle(
                  color: AppColors.primary, fontSize: 12)),
        ],
      ),
    );
  }
}
