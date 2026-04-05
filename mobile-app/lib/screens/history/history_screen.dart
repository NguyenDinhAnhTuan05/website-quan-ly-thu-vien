import 'package:flutter/material.dart';
import '../../core/constants.dart';
import '../../core/error_messages.dart';
import '../../services/api_service.dart';
import 'dart:convert';
import 'package:intl/intl.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({Key? key}) : super(key: key);

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  List<dynamic> _historyItems = [];

  @override
  void initState() {
    super.initState();
    _fetchHistory();
  }

  Future<void> _fetchHistory() async {
    try {
      final response = await _apiService.get(ApiConstants.myHistory);
      if (response.statusCode == 200) {
        final Map<String, dynamic> body = jsonDecode(response.body);
        _historyItems = body['data'] ?? body['content'] ?? [];
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(ErrorMessages.fromException(e)),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return Colors.orangeAccent;
      case 'APPROVED':
        return Colors.blueAccent;
      case 'BORROWED':
        return Colors.purpleAccent;
      case 'RETURNED':
        return Colors.green;
      case 'REJECTED':
      case 'CANCELED':
        return AppColors.error;
      default:
        return AppColors.textSecondary;
    }
  }

  String _formatDate(String isoString) {
    try {
      final date = DateTime.parse(isoString);
      return DateFormat('dd/MM/yyyy HH:mm').format(date);
    } catch (e) {
      return isoString;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Lịch Sử Mượn Trả'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              color: AppColors.primary,
              backgroundColor: AppColors.surface,
              onRefresh: _fetchHistory,
              child: _historyItems.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(Icons.history, size: 80, color: AppColors.textSecondary),
                          SizedBox(height: 16),
                          Text(
                            'Chưa có lịch sử mượn sách',
                            style: TextStyle(fontSize: 18, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _historyItems.length,
                      itemBuilder: (context, index) {
                        final item = _historyItems[index];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.divider),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'Mã phiếu: #${item['id'] ?? '...'}',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.textPrimary,
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: _getStatusColor(item['status'] ?? '').withOpacity(0.2),
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Text(
                                        (item['status'] ?? 'N/A').toUpperCase(),
                                        style: TextStyle(
                                          color: _getStatusColor(item['status'] ?? ''),
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const Divider(color: AppColors.divider, height: 24),
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Icon(Icons.book, size: 20, color: AppColors.textSecondary),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        item['book']?['title'] ?? 'Sách không rõ',
                                        style: const TextStyle(color: AppColors.textPrimary, fontSize: 16),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Icon(Icons.calendar_today, size: 20, color: AppColors.textSecondary),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        'Ngày mượn: ${item['borrowDate'] != null ? _formatDate(item['borrowDate']) : 'N/A'}',
                                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 14),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
