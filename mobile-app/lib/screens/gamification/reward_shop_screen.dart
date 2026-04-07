import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/constants.dart';
import '../../services/api_service.dart';

class RewardShopScreen extends StatefulWidget {
  const RewardShopScreen({Key? key}) : super(key: key);

  @override
  State<RewardShopScreen> createState() => _RewardShopScreenState();
}

class _RewardShopScreenState extends State<RewardShopScreen>
    with SingleTickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  late TabController _tabController;

  List<dynamic> _rewards = [];
  List<dynamic> _history = [];
  bool _loadingRewards = true;
  bool _loadingHistory = true;
  bool _redeeming = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _fetchRewards();
    _fetchHistory();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchRewards() async {
    setState(() => _loadingRewards = true);
    try {
      final res = await _apiService.get(ApiConstants.gamificationRewards);
      if (res.statusCode == 200) {
        final data = json.decode(utf8.decode(res.bodyBytes));
        setState(() => _rewards = data is List ? data : []);
      }
    } catch (_) {}
    if (mounted) setState(() => _loadingRewards = false);
  }

  Future<void> _fetchHistory() async {
    setState(() => _loadingHistory = true);
    try {
      final res = await _apiService.get(ApiConstants.gamificationRedemptionHistory);
      if (res.statusCode == 200) {
        final data = json.decode(utf8.decode(res.bodyBytes));
        setState(() => _history = data is List ? data : []);
      }
    } catch (_) {}
    if (mounted) setState(() => _loadingHistory = false);
  }

  Future<void> _redeem(Map<String, dynamic> reward) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text('Xác nhận đổi thưởng',
            style: TextStyle(color: AppColors.textPrimary)),
        content: Text(
          'Đổi "${reward['name']}" với ${reward['pointCost']} điểm?',
          style: const TextStyle(color: AppColors.textSecondary),
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
            child: const Text('Đổi ngay'),
          ),
        ],
      ),
    );

    if (confirm != true) return;
    setState(() => _redeeming = true);

    try {
      final res = await _apiService.post(
        ApiConstants.gamificationRedeem,
        {'rewardId': reward['id']},
      );
      if (!mounted) return;
      if (res.statusCode == 200 || res.statusCode == 201) {
        final data = json.decode(utf8.decode(res.bodyBytes));
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          backgroundColor: Colors.green[700],
          content: Text(
              'Đổi thành công "${data['rewardName']}" — ${data['pointsSpent']} điểm đã trừ'),
        ));
        _fetchRewards();
        _fetchHistory();
      } else {
        final body = json.decode(utf8.decode(res.bodyBytes));
        final msg = body['message'] ?? 'Đổi thưởng thất bại';
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
      if (mounted) setState(() => _redeeming = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Shop Phần Thưởng'),
        backgroundColor: AppColors.surface,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          tabs: const [
            Tab(text: 'Phần thưởng'),
            Tab(text: 'Lịch sử đổi'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildRewardsList(),
          _buildHistory(),
        ],
      ),
    );
  }

  Widget _buildRewardsList() {
    if (_loadingRewards) {
      return const Center(
          child: CircularProgressIndicator(color: AppColors.primary));
    }
    if (_rewards.isEmpty) {
      return const Center(
        child: Text('Chưa có phần thưởng nào',
            style: TextStyle(color: AppColors.textSecondary)),
      );
    }
    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: _fetchRewards,
      child: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 0.75,
        ),
        itemCount: _rewards.length,
        itemBuilder: (_, i) => _buildRewardCard(_rewards[i]),
      ),
    );
  }

  Widget _buildRewardCard(Map<String, dynamic> reward) {
    final canRedeem = reward['canRedeem'] == true;
    final stock = reward['stock'] as int? ?? 0;
    final validityDays = reward['validityDays'] as int?;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: canRedeem
              ? AppColors.primary.withOpacity(0.4)
              : Colors.grey.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Icon / emoji area
          Container(
            height: 90,
            decoration: BoxDecoration(
              color: canRedeem
                  ? AppColors.primary.withOpacity(0.12)
                  : Colors.grey.withOpacity(0.08),
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Center(
              child: Text(
                reward['icon'] ?? '🎁',
                style: const TextStyle(fontSize: 40),
              ),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    reward['name'] ?? '',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.star, color: Colors.amber, size: 14),
                      const SizedBox(width: 3),
                      Text(
                        '${reward['pointCost']} điểm',
                        style: const TextStyle(
                            color: Colors.amber,
                            fontSize: 12,
                            fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  if (stock > 0)
                    Text(
                      'Còn lại: $stock',
                      style: TextStyle(
                          color: stock < 5 ? Colors.orange : AppColors.textSecondary,
                          fontSize: 11),
                    ),
                  if (validityDays != null)
                    Text(
                      'HSD: $validityDays ngày',
                      style: const TextStyle(
                          color: AppColors.textSecondary, fontSize: 11),
                    ),
                  const Spacer(),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: (canRedeem && !_redeeming)
                          ? () => _redeem(reward)
                          : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        textStyle: const TextStyle(fontSize: 12),
                      ),
                      child: Text(canRedeem ? 'Đổi ngay' : 'Không đủ điểm'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHistory() {
    if (_loadingHistory) {
      return const Center(
          child: CircularProgressIndicator(color: AppColors.primary));
    }
    if (_history.isEmpty) {
      return const Center(
        child: Text('Chưa có lịch sử đổi thưởng',
            style: TextStyle(color: AppColors.textSecondary)),
      );
    }
    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: _fetchHistory,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _history.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (_, i) => _buildHistoryTile(_history[i]),
      ),
    );
  }

  Widget _buildHistoryTile(Map<String, dynamic> item) {
    final isExpired = item['expired'] == true;
    final status = item['status'] as String? ?? '';
    final redeemedAt = item['redeemedAt'] as String?;
    final expiresAt = item['expiresAt'] as String?;

    Color statusColor;
    switch (status) {
      case 'ACTIVE':
        statusColor = Colors.green;
        break;
      case 'USED':
        statusColor = Colors.blue;
        break;
      default:
        statusColor = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isExpired
              ? Colors.red.withOpacity(0.3)
              : AppColors.divider,
        ),
      ),
      child: Row(
        children: [
          Text(item['rewardIcon'] ?? '🎁', style: const TextStyle(fontSize: 30)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item['rewardName'] ?? '',
                    style: const TextStyle(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w600)),
                const SizedBox(height: 3),
                Text('${item['pointsSpent']} điểm đã dùng',
                    style: const TextStyle(
                        color: Colors.amber, fontSize: 12)),
                if (redeemedAt != null)
                  Text(
                    'Đổi lúc: ${_formatDate(redeemedAt)}',
                    style: const TextStyle(
                        color: AppColors.textSecondary, fontSize: 11),
                  ),
                if (expiresAt != null)
                  Text(
                    isExpired
                        ? 'Đã hết hạn: ${_formatDate(expiresAt)}'
                        : 'Hết hạn: ${_formatDate(expiresAt)}',
                    style: TextStyle(
                        color: isExpired ? Colors.red[300] : AppColors.textSecondary,
                        fontSize: 11),
                  ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              isExpired ? 'Hết hạn' : status,
              style: TextStyle(
                  color: isExpired ? Colors.red[300] : statusColor,
                  fontSize: 11,
                  fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(String iso) {
    try {
      final dt = DateTime.parse(iso).toLocal();
      return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
    } catch (_) {
      return iso;
    }
  }
}
