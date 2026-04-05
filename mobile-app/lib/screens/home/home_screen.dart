import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants.dart';
import '../../core/error_messages.dart';
import '../../services/api_service.dart';
import '../../widgets/shimmer_loading.dart';
import 'dart:convert';
import 'book_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  List<dynamic> _books = [];
  List<dynamic> _categories = [];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final responses = await Future.wait([
        _apiService.get(ApiConstants.popularBooks),
        _apiService.get(ApiConstants.categories),
      ]);

      if (responses[0].statusCode == 200) {
        final Map<String, dynamic> body = jsonDecode(responses[0].body);
        _books = body['data']['items'] ?? body['data'] ?? body['content'] ?? [];
      }

      if (responses[1].statusCode == 200) {
        final Map<String, dynamic> body = jsonDecode(responses[1].body);
        _categories = body['data'] ?? body['content'] ?? [];
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: _isLoading
          ? const ShimmerHomeLoading()
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
                    expandedHeight: 140.0,
                    floating: true,
                    pinned: true,
                    backgroundColor: AppColors.surface,
                    flexibleSpace: FlexibleSpaceBar(
                      titlePadding: const EdgeInsets.only(left: 16, bottom: 16),
                      title: const Text(
                        'Thư Viện Số',
                        style: TextStyle(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.bold,
                          fontSize: 20,
                        ),
                      ),
                      background: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              AppColors.primary.withOpacity(0.3),
                              AppColors.secondary.withOpacity(0.1),
                              AppColors.surface,
                            ],
                          ),
                        ),
                      ),
                    ),
                    actions: [
                      IconButton(
                        icon: const Icon(Icons.search, color: AppColors.textPrimary),
                        onPressed: () {},
                      ),
                      IconButton(
                        icon: const Icon(Icons.notifications_none, color: AppColors.textPrimary),
                        onPressed: () {},
                      ),
                    ],
                  ),
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      child: Column(
                        children: [
                          _buildSectionHeader('Thể loại nổi bật', () {}),
                          _buildCategories(),
                          const SizedBox(height: 24),
                          _buildSectionHeader('Sách phổ biến', () {}),
                          _buildPopularBooks(),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildSectionHeader(String title, VoidCallback onSeeAll) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          TextButton(
            onPressed: onSeeAll,
            child: const Text('Xem tất cả', style: TextStyle(color: AppColors.secondary)),
          ),
        ],
      ),
    );
  }

  Widget _buildCategories() {
    if (_categories.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(horizontal: 16),
        child: Text('Không có dữ liệu', style: TextStyle(color: AppColors.textSecondary)),
      );
    }
    return SizedBox(
      height: 48,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: _categories.length,
        itemBuilder: (context, index) {
          final cat = _categories[index];
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 4),
            child: ActionChip(
              backgroundColor: AppColors.surface,
              labelStyle: const TextStyle(color: AppColors.textPrimary),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              side: BorderSide(color: AppColors.divider),
              label: Text(cat['name'] ?? 'Danh mục'),
              onPressed: () {},
            ),
          );
        },
      ),
    );
  }

  Widget _buildPopularBooks() {
    if (_books.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(horizontal: 16),
        child: Text('Không có dữ liệu', style: TextStyle(color: AppColors.textSecondary)),
      );
    }
    return SizedBox(
      height: 280,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: _books.length,
        itemBuilder: (context, index) {
          final book = _books[index];
          final heroTag = 'book-cover-${book['id'] ?? index}';
          return GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => BookDetailScreen(book: book, heroTag: heroTag),
                ),
              );
            },
            child: Container(
              width: 160,
              margin: const EdgeInsets.symmetric(horizontal: 8),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Hero(
                    tag: heroTag,
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                      child: book['thumbnail'] != null
                          ? CachedNetworkImage(
                              imageUrl: book['thumbnail'],
                              height: 200,
                              width: double.infinity,
                              fit: BoxFit.cover,
                              placeholder: (_, __) => Container(
                                height: 200,
                                color: Colors.grey[800],
                                child: const Center(
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                              errorWidget: (_, __, ___) => _buildPlaceholder(),
                            )
                          : _buildPlaceholder(),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          book['title'] ?? 'Tên sách',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          book['author']?['name'] ?? 'Tác giả',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      height: 200,
      width: double.infinity,
      color: Colors.grey[800],
      child: const Icon(Icons.book, size: 60, color: Colors.grey),
    );
  }
}
