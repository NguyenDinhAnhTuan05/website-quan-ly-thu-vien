import 'package:flutter/material.dart';
import '../../core/constants.dart';
import '../../services/api_service.dart';

class BookDetailScreen extends StatefulWidget {
  final Map<String, dynamic> book;

  const BookDetailScreen({Key? key, required this.book}) : super(key: key);

  @override
  State<BookDetailScreen> createState() => _BookDetailScreenState();
}

class _BookDetailScreenState extends State<BookDetailScreen> {
  final ApiService _apiService = ApiService();
  bool _isBorrowing = false;

  void _handleBorrow() async {
    setState(() => _isBorrowing = true);
    
    try {
      final response = await _apiService.post(ApiConstants.borrows, {
        'bookId': widget.book['id'],
      });
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Yêu cầu mượn sách thành công!')),
        );
        Navigator.pop(context);
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không thể mượn sách. Vui lòng thử lại!')),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi kết nối.')),
      );
    } finally {
      if (mounted) {
        setState(() => _isBorrowing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.book['title'] ?? 'Chi tiết sách';
    final description = widget.book['description'] ?? 'Chưa có thông tin mô tả.';
    final authorName = widget.book['author']?['name'] ?? 'Tác giả không rõ';
    final thumbnailUrl = widget.book['thumbnail'];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(title),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: thumbnailUrl != null
                    ? Image.network(
                        thumbnailUrl,
                        height: 250,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _buildPlaceholder(),
                      )
                    : _buildPlaceholder(),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Tác giả: $authorName',
              style: const TextStyle(
                fontSize: 16,
                color: AppColors.secondary,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Mô tả',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              description,
              style: const TextStyle(
                fontSize: 15,
                color: AppColors.textSecondary,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: ElevatedButton(
          onPressed: _isBorrowing ? null : _handleBorrow,
          child: _isBorrowing
              ? const CircularProgressIndicator(color: AppColors.background)
              : const Text('MƯỢN SÁCH'),
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      height: 250,
      width: 180,
      color: Colors.grey[800],
      child: const Icon(Icons.book, size: 80, color: Colors.grey),
    );
  }
}
