import 'package:flutter/material.dart';
import 'dart:convert';
import '../../core/constants.dart';
import '../../core/error_messages.dart';
import '../../services/api_service.dart';
import 'reward_shop_screen.dart';

class GamificationScreen extends StatefulWidget {
  const GamificationScreen({Key? key}) : super(key: key);

  @override
  State<GamificationScreen> createState() => _GamificationScreenState();
}

class _GamificationScreenState extends State<GamificationScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  bool _checkingIn = false;
  Map<String, dynamic>? _summary;
  List<dynamic> _missions = [];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final results = await Future.wait([
        _apiService.get(ApiConstants.gamificationSummary),
        _apiService.get(ApiConstants.gamificationMissions),
      ]);

      if (results[0].statusCode == 200) {
        final body = jsonDecode(results[0].body);
        _summary = body['data'];
      }
      if (results[1].statusCode == 200) {
        final body = jsonDecode(results[1].body);
        _missions = body['data'] ?? [];
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ErrorMessages.fromException(e)), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _doCheckIn() async {
    setState(() => _checkingIn = true);
    try {
      final response = await _apiService.post(ApiConstants.gamificationCheckIn, {});
      final body = jsonDecode(response.body);
      final msg = body['data'] ?? body['message'] ?? 'Điểm danh thành công!';
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(children: [
              const Text('✅ ', style: TextStyle(fontSize: 16)),
              Expanded(child: Text(msg)),
            ]),
            backgroundColor: Colors.green.shade800,
          ),
        );
        // Refresh data
        setState(() => _isLoading = true);
        await _fetchData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ErrorMessages.fromException(e)), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _checkingIn = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              color: AppColors.primary,
              backgroundColor: AppColors.surface,
              onRefresh: () async {
                setState(() => _isLoading = true);
                await _fetchData();
              },
              child: CustomScrollView(
                slivers: [
                  SliverAppBar(
                    expandedHeight: 130,
                    pinned: true,
                    floating: true,
                    backgroundColor: AppColors.surface,
                    actions: [
                      IconButton(
                        icon: const Icon(Icons.redeem_outlined,
                            color: AppColors.primary),
                        tooltip: 'Shop phần thưởng',
                        onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const RewardShopScreen()),
                        ),
                      ),
                    ],
                    flexibleSpace: FlexibleSpaceBar(
                      titlePadding: const EdgeInsets.only(left: 16, bottom: 14),
                      title: const Text(
                        'Nhiệm vụ & Điểm thưởng',
                        style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 18),
                      ),
                      background: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              AppColors.secondary.withOpacity(0.3),
                              AppColors.primary.withOpacity(0.15),
                              AppColors.surface,
                            ],
                          ),
                        ),
                        child: const Align(
                          alignment: Alignment.topRight,
                          child: Padding(
                            padding: EdgeInsets.only(right: 20, top: 18),
                            child: Text('⭐', style: TextStyle(fontSize: 42)),
                          ),
                        ),
                      ),
                    ),
                  ),

                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // --- XP Summary card ---
                          _buildSummaryCard(),
                          const SizedBox(height: 20),

                          // --- Daily Check-in button ---
                          _buildCheckInButton(),
                          const SizedBox(height: 24),

                          // --- Missions ---
                          const Text(
                            'Nhiệm vụ hôm nay',
                            style: TextStyle(
                              color: AppColors.textPrimary,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 12),
                        ],
                      ),
                    ),
                  ),

                  // Mission list
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          if (index >= _missions.length) return null;
                          return _buildMissionCard(_missions[index]);
                        },
                        childCount: _missions.length,
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildSummaryCard() {
    final totalPoints = _summary?['currentPoints'] ?? 0;
    final tier = _summary?['membershipTier'] as String? ?? 'Cơ bản';
    final completedMissions = _summary?['totalMissionsCompleted'] ?? 0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primary.withOpacity(0.3),
            AppColors.secondary.withOpacity(0.15),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Expanded(
            child: _buildStatBox('⭐ Điểm', '$totalPoints', AppColors.secondary),
          ),
          Container(width: 1, height: 50, color: AppColors.divider),
          Expanded(
            child: _buildStatBox('🏅 Hạng', tier, AppColors.primary),
          ),
          Container(width: 1, height: 50, color: AppColors.divider),
          Expanded(
            child: _buildStatBox('✅ Hoàn thành', '$completedMissions', Colors.greenAccent),
          ),
        ],
      ),
    );
  }

  Widget _buildStatBox(String label, String value, Color valueColor) {
    return Column(
      children: [
        FittedBox(
          fit: BoxFit.scaleDown,
          child: Text(
            value,
            style: TextStyle(
              color: valueColor,
              fontSize: 22,
              fontWeight: FontWeight.black,
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          textAlign: TextAlign.center,
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
        ),
      ],
    );
  }

  Widget _buildCheckInButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: _checkingIn ? null : _doCheckIn,
        icon: _checkingIn
            ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
            : const Text('📅', style: TextStyle(fontSize: 18)),
        label: Text(_checkingIn ? 'Đang điểm danh...' : 'Điểm danh hôm nay (+10 điểm)'),

        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF7C3AED),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Widget _buildMissionCard(Map<String, dynamic> mission) {
    final name = mission['title'] as String? ?? '';
    final description = mission['description'] as String? ?? '';
    final progress = (mission['currentProgress'] as num?)?.toInt() ?? 0;
    final target = (mission['requirement'] as num?)?.toInt() ?? 1;
    final reward = (mission['pointReward'] as num?)?.toInt() ?? 0;
    final completed = mission['isCompleted'] as bool? ?? false;
    final percent = (progress / target).clamp(0.0, 1.0);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: completed ? Colors.green.withOpacity(0.4) : AppColors.divider,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  name,
                  style: TextStyle(
                    color: completed ? Colors.green[300] : AppColors.textPrimary,
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: completed
                      ? Colors.green.withOpacity(0.15)
                      : AppColors.primary.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  completed ? '✅ Hoàn thành' : '+$reward XP',
                  style: TextStyle(
                    color: completed ? Colors.green[300] : AppColors.primary,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
          if (description.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(description, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
          ],
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(
                    value: percent,
                    backgroundColor: AppColors.background,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      completed ? Colors.green : AppColors.secondary,
                    ),
                    minHeight: 8,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Text(
                '$progress/$target',
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
