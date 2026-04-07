import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/constants.dart';
import '../../services/api_service.dart';

class BookReaderScreen extends StatefulWidget {
  final Map<String, dynamic> book;

  const BookReaderScreen({Key? key, required this.book}) : super(key: key);

  @override
  State<BookReaderScreen> createState() => _BookReaderScreenState();
}

class _BookReaderScreenState extends State<BookReaderScreen> {
  final ApiService _apiService = ApiService();
  String? _content;
  bool _loading = true;
  String? _error;
  double _fontSize = 16;
  bool _showToolbar = true;

  @override
  void initState() {
    super.initState();
    _fetchContent();
  }

  Future<void> _fetchContent() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final bookId = widget.book['id'] as int? ??
          int.tryParse(widget.book['id']?.toString() ?? '');
      if (bookId == null) {
        setState(() {
          _error = 'Không tìm thấy sách.';
          _loading = false;
        });
        return;
      }
      final res = await _apiService.get(ApiConstants.bookRead(bookId));
      if (res.statusCode == 200) {
        final data = json.decode(utf8.decode(res.bodyBytes));
        final content = data['content'] as String?;
        if (content != null && content.isNotEmpty) {
          setState(() => _content = content);
        } else {
          setState(() => _error =
              'Nội dung sách chưa có. Vui lòng thử lại sau.');
        }
      } else if (res.statusCode == 403) {
        setState(() => _error =
            'Bạn cần mượn sách này hoặc đăng ký gói thành viên để đọc.');
      } else if (res.statusCode == 401) {
        setState(
            () => _error = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      } else {
        setState(() => _error = 'Không thể tải nội dung sách (mã ${res.statusCode}).');
      }
    } catch (e) {
      setState(() => _error = 'Lỗi kết nối. Vui lòng kiểm tra internet.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.book['title'] ?? 'Đọc sách';

    return Scaffold(
      backgroundColor: const Color(0xFF1A1A2E),
      body: GestureDetector(
        onTap: () => setState(() => _showToolbar = !_showToolbar),
        child: Stack(
          children: [
            // Content area
            _buildBody(),
            // Top toolbar
            AnimatedSlide(
              offset: _showToolbar ? Offset.zero : const Offset(0, -1),
              duration: const Duration(milliseconds: 250),
              curve: Curves.easeInOut,
              child: Container(
                color: Colors.black.withOpacity(0.85),
                child: SafeArea(
                  bottom: false,
                  child: AppBar(
                    backgroundColor: Colors.transparent,
                    elevation: 0,
                    title: Text(title,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                            color: AppColors.textPrimary, fontSize: 16)),
                    actions: [
                      IconButton(
                        icon: const Icon(Icons.text_decrease,
                            color: AppColors.textPrimary),
                        onPressed: () {
                          if (_fontSize > 12) {
                            setState(() => _fontSize -= 2);
                          }
                        },
                        tooltip: 'Giảm cỡ chữ',
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 2),
                        child: Center(
                          child: Text(
                            '${_fontSize.toInt()}',
                            style: const TextStyle(
                                color: AppColors.textSecondary, fontSize: 13),
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.text_increase,
                            color: AppColors.textPrimary),
                        onPressed: () {
                          if (_fontSize < 28) {
                            setState(() => _fontSize += 2);
                          }
                        },
                        tooltip: 'Tăng cỡ chữ',
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(
          child: CircularProgressIndicator(color: AppColors.primary));
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.lock_outline,
                  color: AppColors.textSecondary, size: 64),
              const SizedBox(height: 16),
              Text(
                _error!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                    color: AppColors.textSecondary, fontSize: 15, height: 1.5),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _fetchContent,
                icon: const Icon(Icons.refresh),
                label: const Text('Thử lại'),
                style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary),
              ),
            ],
          ),
        ),
      );
    }

    if (_content == null) {
      return const Center(
        child: Text('Không có nội dung',
            style: TextStyle(color: AppColors.textSecondary)),
      );
    }

    return Scrollbar(
      thumbVisibility: true,
      child: SingleChildScrollView(
        padding: EdgeInsets.fromLTRB(
          20,
          kToolbarHeight + MediaQuery.of(context).padding.top + 16,
          20,
          32,
        ),
        child: SelectableText(
          _content!,
          style: TextStyle(
            color: const Color(0xFFE8E8E8),
            fontSize: _fontSize,
            height: 1.8,
            letterSpacing: 0.3,
            fontFamily: 'Georgia',
          ),
        ),
      ),
    );
  }
}
