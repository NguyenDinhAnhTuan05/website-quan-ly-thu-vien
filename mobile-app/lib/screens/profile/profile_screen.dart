import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:provider/provider.dart';
import 'dart:convert';
import '../../core/constants.dart';
import '../../core/error_messages.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../gamification/gamification_screen.dart';
import '../leaderboard/leaderboard_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoggingOut = false;
  bool _isLoading = true;
  Map<String, dynamic>? _user;
  Map<String, dynamic>? _gamification;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    try {
      final results = await Future.wait([
        _apiService.get(ApiConstants.me),
        _apiService.get(ApiConstants.gamificationSummary),
      ]);
      if (results[0].statusCode == 200) {
        final body = jsonDecode(results[0].body);
        _user = body['data'] ?? body;
      }
      if (results[1].statusCode == 200) {
        final body = jsonDecode(results[1].body);
        _gamification = body['data'];
      }
    } catch (_) {}
    if (mounted) setState(() => _isLoading = false);
  }

  void _handleLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text('Đăng xuất', style: TextStyle(color: AppColors.textPrimary)),
        content: const Text('Bạn có chắc chắn muốn đăng xuất không?', style: TextStyle(color: AppColors.textSecondary)),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Hủy', style: TextStyle(color: AppColors.textSecondary)),
          ),
          StatefulBuilder(
            builder: (dialogCtx, setDialogState) => ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
              onPressed: _isLoggingOut
                  ? null
                  : () async {
                      setDialogState(() => _isLoggingOut = true);
                      setState(() => _isLoggingOut = true);
                      try {
                        await Provider.of<AuthService>(context, listen: false).logout();
                      } catch (e) {
                        if (mounted) {
                          Navigator.of(dialogCtx).pop();
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(ErrorMessages.fromException(e)),
                              backgroundColor: AppColors.error,
                            ),
                          );
                        }
                      } finally {
                        if (mounted) setState(() => _isLoggingOut = false);
                      }
                    },
              child: _isLoggingOut
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Đăng xuất'),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Hồ Sơ Cá Nhân'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              setState(() => _isLoading = true);
              _fetchProfile();
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              color: AppColors.primary,
              backgroundColor: AppColors.surface,
              onRefresh: () async {
                setState(() => _isLoading = true);
                await _fetchProfile();
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _buildHeader(),
                    const SizedBox(height: 20),
                    if (_gamification != null) ...[
                      _buildXpCard(),
                      const SizedBox(height: 20),
                    ],
                    _buildMenuSection(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildHeader() {
    final avatarUrl = _user?['avatarUrl'] as String?;
    final username = _user?['username'] as String? ?? 'Độc giả';
    final email = _user?['email'] as String? ?? '';
    final role = _user?['role'] as String? ?? 'USER';
    final isAdmin = role == 'ROLE_ADMIN' || role == 'ROLE_SUPER_ADMIN';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.primary.withOpacity(0.25), AppColors.surface],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withOpacity(0.2)),
      ),
      child: Column(
        children: [
          Stack(
            children: [
              CircleAvatar(
                radius: 50,
                backgroundColor: AppColors.surface,
                child: avatarUrl != null && avatarUrl.isNotEmpty
                    ? ClipOval(
                        child: CachedNetworkImage(
                          imageUrl: avatarUrl,
                          width: 100,
                          height: 100,
                          fit: BoxFit.cover,
                          errorWidget: (_, __, ___) =>
                              const Icon(Icons.person, size: 60, color: AppColors.primary),
                        ),
                      )
                    : const Icon(Icons.person, size: 60, color: AppColors.primary),
              ),
              if (isAdmin)
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF7C3AED),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.background, width: 2),
                    ),
                    child: const Icon(Icons.shield, size: 14, color: Colors.white),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            username,
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
          ),
          if (email.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(email, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          ],
          if (isAdmin) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF7C3AED).withOpacity(0.2),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF7C3AED).withOpacity(0.5)),
              ),
              child: const Text(
                '👑 Quản trị viên',
                style: TextStyle(color: Color(0xFFBB86FC), fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildXpCard() {
    final totalPoints = _gamification?['currentPoints'] ?? 0;
    final tier = _gamification?['membershipTier'] as String? ?? 'Cơ bản';
    final completed = _gamification?['totalMissionsCompleted'] ?? 0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.secondary.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Text('⭐', style: TextStyle(fontSize: 18)),
              SizedBox(width: 8),
              Text(
                'Gamification',
                style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 15),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(child: _buildXpStat('Tổng điểm', '$totalPoints', AppColors.secondary)),
              Expanded(child: _buildXpStat('Hạng', tier, AppColors.primary)),
              Expanded(child: _buildXpStat('Nhiệm vụ', '$completed', Colors.greenAccent)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildXpStat(String label, String value, Color color) {
    return Column(
      children: [
        FittedBox(
          fit: BoxFit.scaleDown,
          child: Text(value, style: TextStyle(color: color, fontSize: 20, fontWeight: FontWeight.black)),
        ),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
      ],
    );
  }

  Widget _buildMenuSection() {
    return Column(
      children: [
        _buildMenuTile(
          icon: Icons.person_outline,
          title: 'Thông tin tài khoản',
          subtitle: _user?['fullName'] as String?,
          onTap: () => _showUserInfoSheet(),
        ),
        _buildMenuTile(
          icon: Icons.lock_outline,
          title: 'Đổi mật khẩu',
          onTap: () => _showChangePasswordSheet(),
        ),
        _buildMenuTile(
          icon: Icons.leaderboard_outlined,
          title: 'Bảng xếp hạng',
          subtitle: 'Xem thứ hạng của bạn',
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const LeaderboardScreen()),
          ),
        ),
        _buildMenuTile(
          icon: Icons.military_tech_outlined,
          title: 'Nhiệm vụ & Điểm thưởng',
          subtitle: 'Nhận XP và hoàn thành thử thách',
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const GamificationScreen()),
          ),
        ),
        _buildMenuTile(
          icon: Icons.help_outline,
          title: 'Trợ giúp & Hỗ trợ',
          onTap: () {},
        ),
        const Divider(color: AppColors.divider, height: 32),
        _buildMenuTile(
          icon: Icons.logout,
          title: 'Đăng xuất',
          titleColor: AppColors.error,
          iconColor: AppColors.error,
          onTap: () => _handleLogout(context),
        ),
      ],
    );
  }

  void _showUserInfoSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Thông tin tài khoản',
                style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            _infoRow('Tên đăng nhập', _user?['username'] ?? '-'),
            _infoRow('Email', _user?['email'] ?? '-'),
            _infoRow('Họ tên', _user?['fullName'] ?? '-'),
            _infoRow('Vai trò', _user?['role'] ?? '-'),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          SizedBox(
            width: 120,
            child: Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
          ),
          Expanded(
            child: Text(value,
                style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }

  void _showChangePasswordSheet() {
    final oldCtrl = TextEditingController();
    final newCtrl = TextEditingController();
    final confirmCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 20, right: 20, top: 20,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Đổi mật khẩu',
                style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            _buildPasswordField(oldCtrl, 'Mật khẩu hiện tại'),
            const SizedBox(height: 10),
            _buildPasswordField(newCtrl, 'Mật khẩu mới'),
            const SizedBox(height: 10),
            _buildPasswordField(confirmCtrl, 'Xác nhận mật khẩu mới'),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  if (newCtrl.text != confirmCtrl.text) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Mật khẩu xác nhận không khớp')),
                    );
                    return;
                  }
                  try {
                    final res = await _apiService.put('${ApiConstants.me}/password', {
                      'currentPassword': oldCtrl.text,
                      'newPassword': newCtrl.text,
                    });
                    if (!mounted) return;
                    Navigator.of(ctx).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(res.statusCode == 200
                            ? '✅ Đổi mật khẩu thành công'
                            : ErrorMessages.fromStatusCode(res.statusCode)),
                        backgroundColor: res.statusCode == 200 ? Colors.green.shade800 : AppColors.error,
                      ),
                    );
                  } catch (e) {
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(ErrorMessages.fromException(e)),
                          backgroundColor: AppColors.error,
                        ),
                      );
                    }
                  }
                },
                child: const Text('Đổi mật khẩu'),
              ),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Widget _buildPasswordField(TextEditingController ctrl, String hint) {
    return TextField(
      controller: ctrl,
      obscureText: true,
      style: const TextStyle(color: AppColors.textPrimary),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: AppColors.textSecondary),
        filled: true,
        fillColor: AppColors.background,
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: AppColors.divider)),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: AppColors.divider)),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: AppColors.primary)),
      ),
    );
  }

  Widget _buildMenuTile({
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
    Color titleColor = AppColors.textPrimary,
    Color iconColor = AppColors.textSecondary,
  }) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: iconColor),
      ),
      title: Text(
        title,
        style: TextStyle(color: titleColor, fontSize: 16, fontWeight: FontWeight.w500),
      ),
      subtitle: subtitle != null && subtitle.isNotEmpty
          ? Text(subtitle, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12))
          : null,
      trailing: const Icon(Icons.chevron_right, color: AppColors.textSecondary),
      onTap: onTap,
    );
  }
}

