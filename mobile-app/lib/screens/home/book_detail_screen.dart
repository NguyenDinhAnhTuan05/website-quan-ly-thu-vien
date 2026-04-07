import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants.dart';
import '../../core/error_messages.dart';
import '../../services/api_service.dart';
import 'book_reader_screen.dart';

class BookDetailScreen extends StatefulWidget {
  final Map<String, dynamic> book;
  final String heroTag;

  const BookDetailScreen({Key? key, required this.book, this.heroTag = ''}) : super(key: key);

  @override
  State<BookDetailScreen> createState() => _BookDetailScreenState();
}

class _BookDetailScreenState extends State<BookDetailScreen> {
  final ApiService _apiService = ApiService();
  bool _isBorrowing = false;

  // Reviews state
  List<dynamic> _reviews = [];
  bool _loadingReviews = true;
  int _currentPage = 0;
  bool _hasMore = true;
  int? _myUserId;
  int? _myReviewId;

  // Review form
  int _selectedRating = 5;
  final TextEditingController _commentCtrl = TextEditingController();
  bool _submittingReview = false;

  @override
  void initState() {
    super.initState();
    _fetchReviews(reset: true);
    _fetchMyUserId();
  }

  @override
  void dispose() {
    _commentCtrl.dispose();
    super.dispose();
  }

  int get _bookId {
    final id = widget.book['id'];
    return id is int ? id : int.tryParse(id.toString()) ?? 0;
  }

  Future<void> _fetchMyUserId() async {
    try {
      final res = await _apiService.get(ApiConstants.me);
      if (res.statusCode == 200) {
        final data = json.decode(utf8.decode(res.bodyBytes));
        final body =
            data is Map && data.containsKey('data') ? data['data'] : data;
        setState(() => _myUserId = body['id'] as int?);
      }
    } catch (_) {}
  }

  Future<void> _fetchReviews({bool reset = false}) async {
    if (reset) {
      setState(() {
        _currentPage = 0;
        _hasMore = true;
        _reviews = [];
        _loadingReviews = true;
        _myReviewId = null;
      });
    }
    try {
      final endpoint =
          '${ApiConstants.bookReviews(_bookId)}?page=$_currentPage&size=10&sort=createdAt,desc';
      final res = await _apiService.get(endpoint);
      if (res.statusCode == 200) {
        final data = json.decode(utf8.decode(res.bodyBytes));
        final content = data['content'] as List? ?? [];
        final last = data['last'] as bool? ?? true;
        setState(() {
          if (reset) {
            _reviews = content;
          } else {
            _reviews.addAll(content);
          }
          _hasMore = !last;
          _currentPage++;
          if (_myUserId != null) {
            final myReview = _reviews.firstWhere(
              (r) => r['userId'] == _myUserId,
              orElse: () => null,
            );
            if (myReview != null) {
              _myReviewId = myReview['id'] as int?;
            }
          }
        });
      }
    } catch (_) {}
    if (mounted) setState(() => _loadingReviews = false);
  }

  Future<void> _submitReview() async {
    if (_commentCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập nhận xét')),
      );
      return;
    }
    setState(() => _submittingReview = true);
    try {
      final res = await _apiService.post(
        ApiConstants.bookReviews(_bookId),
        {'rating': _selectedRating, 'comment': _commentCtrl.text.trim()},
      );
      if (!mounted) return;
      if (res.statusCode == 200 || res.statusCode == 201) {
        _commentCtrl.clear();
        _selectedRating = 5;
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              backgroundColor: Colors.green,
              content: Text('Đánh giá của bạn đã được ghi nhận!')),
        );
        _fetchReviews(reset: true);
      } else {
        final body = json.decode(utf8.decode(res.bodyBytes));
        final msg = body['message'] ?? 'Không thể gửi đánh giá';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: AppColors.error, content: Text(msg)),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            backgroundColor: AppColors.error,
            content: Text('Lỗi kết nối. Vui lòng thử lại.')),
      );
    } finally {
      if (mounted) setState(() => _submittingReview = false);
    }
  }

  Future<void> _deleteReview(int reviewId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text('Xóa đánh giá',
            style: TextStyle(color: AppColors.textPrimary)),
        content: const Text('Bạn chắc chắn muốn xóa đánh giá này?',
            style: TextStyle(color: AppColors.textSecondary)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Hủy',
                style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Xóa'),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    try {
      final res =
          await _apiService.delete(ApiConstants.bookReview(_bookId, reviewId));
      if (!mounted) return;
      if (res.statusCode == 204 || res.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đã xóa đánh giá')),
        );
        _fetchReviews(reset: true);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              backgroundColor: AppColors.error,
              content: Text('Xóa thất bại. Vui lòng thử lại.')),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            backgroundColor: AppColors.error,
            content: Text('Lỗi kết nối. Vui lòng thử lại.')),
      );
    }
  }

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
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content:
                  Text(ErrorMessages.fromStatusCode(response.statusCode))),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(ErrorMessages.fromException(e))));
    } finally {
      if (mounted) setState(() => _isBorrowing = false);
    }
  }

  void _openReviewForm() {
    final myReview = _myReviewId != null
        ? _reviews.firstWhere((r) => r['id'] == _myReviewId,
            orElse: () => null)
        : null;
    if (myReview != null) {
      _selectedRating = myReview['rating'] as int? ?? 5;
      _commentCtrl.text = myReview['comment'] as String? ?? '';
    } else {
      _selectedRating = 5;
      _commentCtrl.clear();
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                myReview != null ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá',
                style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 18,
                    fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              Row(
                children: List.generate(5, (i) {
                  final star = i + 1;
                  return GestureDetector(
                    onTap: () {
                      setModalState(() => _selectedRating = star);
                      setState(() => _selectedRating = star);
                    },
                    child: Icon(
                      star <= _selectedRating ? Icons.star : Icons.star_border,
                      color: Colors.amber,
                      size: 36,
                    ),
                  );
                }),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _commentCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                maxLines: 4,
                decoration: InputDecoration(
                  hintText: 'Nhận xét của bạn về cuốn sách này...',
                  hintStyle: const TextStyle(color: AppColors.textSecondary),
                  filled: true,
                  fillColor: AppColors.background,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _submittingReview ? null : _submitReview,
                  style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 14)),
                  child: _submittingReview
                      ? const CircularProgressIndicator(
                          color: AppColors.background)
                      : const Text('Gửi đánh giá',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.book['title'] ?? 'Chi tiết sách';
    final description = widget.book['description'] ?? 'Chưa có thông tin mô tả.';
    final authorName =
        widget.book['author']?['name'] ?? _getAuthorNames();
    final thumbnailUrl =
        widget.book['coverUrl'] ?? widget.book['thumbnail'];
    final available = widget.book['available'] as bool? ?? true;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(title),
        actions: [
          IconButton(
            icon: const Icon(Icons.menu_book_outlined),
            tooltip: 'Đọc sách',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (_) => BookReaderScreen(book: widget.book)),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Hero(
                tag: widget.heroTag,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: thumbnailUrl != null
                      ? CachedNetworkImage(
                          imageUrl: thumbnailUrl,
                          height: 250,
                          fit: BoxFit.cover,
                          placeholder: (_, __) => _buildPlaceholder(),
                          errorWidget: (_, __, ___) => _buildPlaceholder(),
                        )
                      : _buildPlaceholder(),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text(title,
                style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary)),
            const SizedBox(height: 8),
            Text('Tác giả: $authorName',
                style: const TextStyle(
                    fontSize: 16,
                    color: AppColors.secondary,
                    fontWeight: FontWeight.w500)),
            const SizedBox(height: 8),
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: available
                        ? Colors.green.withOpacity(0.15)
                        : Colors.red.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    available ? 'Còn sách' : 'Hết sách',
                    style: TextStyle(
                        color: available ? Colors.green : Colors.red,
                        fontSize: 12,
                        fontWeight: FontWeight.w600),
                  ),
                ),
                if (widget.book['availableQuantity'] != null) ...[
                  const SizedBox(width: 8),
                  Text(
                    'Còn ${widget.book['availableQuantity']}/${widget.book['quantity']} quyển',
                    style: const TextStyle(
                        color: AppColors.textSecondary, fontSize: 13),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 24),
            const Text('Mô tả',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary)),
            const SizedBox(height: 8),
            Text(description,
                style: const TextStyle(
                    fontSize: 15,
                    color: AppColors.textSecondary,
                    height: 1.5)),
            const SizedBox(height: 32),

            // ──── REVIEWS SECTION ────
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Đánh giá (${_reviews.length})',
                  style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary),
                ),
                TextButton.icon(
                  onPressed: _openReviewForm,
                  icon: Icon(
                    _myReviewId != null ? Icons.edit : Icons.add,
                    size: 18,
                    color: AppColors.primary,
                  ),
                  label: Text(
                    _myReviewId != null ? 'Sửa đánh giá' : 'Thêm đánh giá',
                    style: const TextStyle(color: AppColors.primary),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            if (_loadingReviews)
              const Center(
                  child: CircularProgressIndicator(color: AppColors.primary))
            else if (_reviews.isEmpty)
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Center(
                  child: Text(
                    'Chưa có đánh giá nào. Hãy là người đầu tiên!',
                    style: TextStyle(color: AppColors.textSecondary),
                    textAlign: TextAlign.center,
                  ),
                ),
              )
            else
              Column(
                children: [
                  ...(_reviews.map((r) => _buildReviewTile(r)).toList()),
                  if (_hasMore)
                    TextButton(
                      onPressed: () => _fetchReviews(),
                      child: const Text('Xem thêm đánh giá',
                          style: TextStyle(color: AppColors.primary)),
                    ),
                ],
              ),
            const SizedBox(height: 80),
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
        child: Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: (_isBorrowing || !available) ? null : _handleBorrow,
                icon: const Icon(Icons.library_add_outlined),
                label: _isBorrowing
                    ? const CircularProgressIndicator(
                        color: AppColors.background)
                    : const Text('MƯỢN SÁCH'),
              ),
            ),
            const SizedBox(width: 12),
            ElevatedButton.icon(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => BookReaderScreen(book: widget.book)),
              ),
              icon: const Icon(Icons.menu_book),
              label: const Text('ĐỌC'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.secondary,
                foregroundColor: Colors.black,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewTile(Map<String, dynamic> review) {
    final reviewId = review['id'] as int?;
    final userId = review['userId'] as int?;
    final isOwner = _myUserId != null && userId == _myUserId;
    final rating = review['rating'] as int? ?? 0;
    final comment = review['comment'] as String? ?? '';
    final username = review['username'] as String? ?? 'Ẩn danh';
    final avatarUrl = review['avatarUrl'] as String?;
    final createdAt = review['createdAt'] as String?;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isOwner
              ? AppColors.primary.withOpacity(0.3)
              : AppColors.divider,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: AppColors.primary.withOpacity(0.3),
                backgroundImage:
                    avatarUrl != null ? NetworkImage(avatarUrl) : null,
                child: avatarUrl == null
                    ? Text(username[0].toUpperCase(),
                        style: const TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold))
                    : null,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(username,
                            style: const TextStyle(
                                color: AppColors.textPrimary,
                                fontWeight: FontWeight.w600,
                                fontSize: 14)),
                        if (isOwner) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 1),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text('Bạn',
                                style: TextStyle(
                                    color: AppColors.primary, fontSize: 10)),
                          ),
                        ],
                      ],
                    ),
                    Row(
                      children: List.generate(
                        5,
                        (i) => Icon(
                          i < rating ? Icons.star : Icons.star_border,
                          color: Colors.amber,
                          size: 14,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              if (isOwner && reviewId != null)
                IconButton(
                  icon: const Icon(Icons.delete_outline,
                      color: AppColors.error, size: 20),
                  onPressed: () => _deleteReview(reviewId),
                  tooltip: 'Xóa đánh giá',
                ),
            ],
          ),
          if (comment.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(comment,
                style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 14,
                    height: 1.4)),
          ],
          if (createdAt != null) ...[
            const SizedBox(height: 6),
            Text(_formatDate(createdAt),
                style: const TextStyle(
                    color: AppColors.textSecondary, fontSize: 11)),
          ],
        ],
      ),
    );
  }

  String _getAuthorNames() {
    final names = widget.book['authorNames'];
    if (names is List && names.isNotEmpty) {
      return names.join(', ');
    }
    return 'Tác giả không rõ';
  }

  String _formatDate(String iso) {
    try {
      final dt = DateTime.parse(iso).toLocal();
      return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
    } catch (_) {
      return iso;
    }
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

