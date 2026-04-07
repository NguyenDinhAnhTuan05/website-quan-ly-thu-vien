import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'dart:convert';
import '../../core/constants.dart';
import '../../core/error_messages.dart';
import '../../services/api_service.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({Key? key}) : super(key: key);

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  List<dynamic> _entries = [];

  @override
  void initState() {
    super.initState();
    _fetchLeaderboard();
  }

  Future<void> _fetchLeaderboard() async {
    try {
      final response = await _apiService.get(ApiConstants.gamificationLeaderboard);
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        setState(() => _entries = body['data'] ?? []);
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 130,
            pinned: true,
            floating: true,
            backgroundColor: AppColors.surface,
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.only(left: 16, bottom: 14),
              title: const Text(
                'Bảng xếp hạng',
                style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 20),
              ),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      const Color(0xFF7C3AED).withOpacity(0.4),
                      AppColors.primary.withOpacity(0.2),
                      AppColors.surface,
                    ],
                  ),
                ),
                child: const Align(
                  alignment: Alignment.topRight,
                  child: Padding(
                    padding: EdgeInsets.only(right: 20, top: 20),
                    child: Text('🏆', style: TextStyle(fontSize: 42)),
                  ),
                ),
              ),
            ),
          ),

          if (_isLoading)
            const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
            )
          else if (_entries.isEmpty)
            const SliverFillRemaining(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('🏅', style: TextStyle(fontSize: 48)),
                    SizedBox(height: 12),
                    Text('Chưa có dữ liệu xếp hạng', style: TextStyle(color: AppColors.textSecondary)),
                  ],
                ),
              ),
            )
          else ...[
            // Top 3 podium
            if (_entries.length >= 3)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
                  child: _buildPodium(),
                ),
              ),

            // Rest of the list
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final startIndex = _entries.length >= 3 ? 3 : 0;
                    if (index >= _entries.length - startIndex) return null;
                    final entry = _entries[index + startIndex];
                    return _buildRow(entry);
                  },
                  childCount: _entries.length >= 3 ? _entries.length - 3 : _entries.length,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPodium() {
    final first = _entries[0];
    final second = _entries[1];
    final third = _entries[2];

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF7C3AED).withOpacity(0.3),
            AppColors.surface.withOpacity(0.8),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withOpacity(0.2)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // 2nd place
          Expanded(child: _buildPodiumSlot(second, 2, 80, '🥈')),
          // 1st place
          Expanded(child: _buildPodiumSlot(first, 1, 100, '🥇')),
          // 3rd place
          Expanded(child: _buildPodiumSlot(third, 3, 65, '🥉')),
        ],
      ),
    );
  }

  Widget _buildPodiumSlot(Map<String, dynamic> entry, int rank, double height, String medal) {
    final avatarUrl = entry['avatarUrl'] as String?;
    final username = entry['username'] as String? ?? '---';
    final xp = entry['monthlyPoints'] as int? ?? 0;

    return Column(
      children: [
        Text(medal, style: const TextStyle(fontSize: 24)),
        const SizedBox(height: 6),
        _buildAvatar(avatarUrl, 22),
        const SizedBox(height: 6),
        Text(
          username,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: AppColors.textPrimary,
            fontSize: 11,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          '$xp XP',
          style: TextStyle(
            color: AppColors.secondary,
            fontSize: 11,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          height: height,
          decoration: BoxDecoration(
            color: rank == 1
                ? const Color(0xFFFFD700).withOpacity(0.3)
                : rank == 2
                    ? Colors.grey.withOpacity(0.3)
                    : const Color(0xFFCD7F32).withOpacity(0.3),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
          ),
          child: Center(
            child: Text(
              '#$rank',
              style: TextStyle(
                color: rank == 1 ? const Color(0xFFFFD700) : rank == 2 ? Colors.grey[400] : const Color(0xFFCD7F32),
                fontWeight: FontWeight.black,
                fontSize: 18,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRow(Map<String, dynamic> entry) {
    final rank = entry['rank'] as int? ?? 0;
    final avatarUrl = entry['avatarUrl'] as String?;
    final username = entry['username'] as String? ?? '---';
    final fullName = entry['fullName'] as String?;
    final xp = entry['monthlyPoints'] as int? ?? 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 32,
            child: Text(
              '#$rank',
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ),
          _buildAvatar(avatarUrl, 18),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  fullName ?? username,
                  style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w600),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (fullName != null)
                  Text('@$username', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.15),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              '$xp XP',
              style: const TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvatar(String? url, double radius) {
    if (url != null && url.isNotEmpty) {
      return CircleAvatar(
        radius: radius,
        backgroundColor: AppColors.surface,
        child: ClipOval(
          child: CachedNetworkImage(
            imageUrl: url,
            width: radius * 2,
            height: radius * 2,
            fit: BoxFit.cover,
            errorWidget: (_, __, ___) => Icon(Icons.person, size: radius, color: AppColors.primary),
          ),
        ),
      );
    }
    return CircleAvatar(
      radius: radius,
      backgroundColor: AppColors.primary.withOpacity(0.2),
      child: Icon(Icons.person, size: radius, color: AppColors.primary),
    );
  }
}
