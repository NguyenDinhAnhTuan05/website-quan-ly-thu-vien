import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'dart:convert';
import '../../core/constants.dart';
import '../../core/error_messages.dart';
import '../../services/api_service.dart';
import '../home/book_detail_screen.dart';

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({Key? key}) : super(key: key);

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _searchController = TextEditingController();
  bool _isLoading = true;
  bool _isSearching = false;
  List<dynamic> _categories = [];
  List<dynamic> _searchResults = [];
  String? _selectedCategory;

  @override
  void initState() {
    super.initState();
    _fetchCategories();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchCategories() async {
    try {
      final response = await _apiService.get(ApiConstants.categories);
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        setState(() {
          _categories = body['data'] ?? body['content'] ?? [];
        });
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

  Future<void> _searchBooks(String query) async {
    if (query.trim().isEmpty) {
      setState(() {
        _searchResults = [];
        _isSearching = false;
      });
      return;
    }
    setState(() => _isSearching = true);
    try {
      final response = await _apiService.get('${ApiConstants.books}?keyword=$query&size=20');
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        setState(() {
          _searchResults = body['data']?['items'] ?? body['data'] ?? body['content'] ?? [];
        });
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
      if (mounted) setState(() => _isSearching = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 120,
            floating: true,
            pinned: true,
            backgroundColor: AppColors.surface,
            flexibleSpace: const FlexibleSpaceBar(
              titlePadding: EdgeInsets.only(left: 16, bottom: 16),
              title: Text(
                'Khám phá',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.bold,
                  fontSize: 20,
                ),
              ),
            ),
          ),
          // Search bar
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: TextField(
                controller: _searchController,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: InputDecoration(
                  hintText: 'Tìm kiếm sách, tác giả...',
                  hintStyle: const TextStyle(color: AppColors.textSecondary),
                  prefixIcon: const Icon(Icons.search, color: AppColors.textSecondary),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear, color: AppColors.textSecondary),
                          onPressed: () {
                            _searchController.clear();
                            _searchBooks('');
                          },
                        )
                      : null,
                  filled: true,
                  fillColor: AppColors.surface,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(vertical: 14),
                ),
                onChanged: (value) {
                  if (value.length >= 2) _searchBooks(value);
                  if (value.isEmpty) _searchBooks('');
                },
              ),
            ),
          ),
          // Search results or categories grid
          if (_searchResults.isNotEmpty)
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final book = _searchResults[index];
                    final heroTag = 'explore-book-${book['id'] ?? index}';
                    return _buildBookListTile(book, heroTag);
                  },
                  childCount: _searchResults.length,
                ),
              ),
            )
          else if (_isSearching)
            const SliverFillRemaining(
              child: Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
            )
          else ...[
            // Categories header
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.fromLTRB(16, 8, 16, 12),
                child: Text(
                  'Thể loại',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
            ),
            // Categories grid
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: _isLoading
                  ? const SliverToBoxAdapter(
                      child: Center(
                        child: CircularProgressIndicator(color: AppColors.primary),
                      ),
                    )
                  : SliverGrid(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final cat = _categories[index];
                          return _buildCategoryCard(cat);
                        },
                        childCount: _categories.length,
                      ),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 2.5,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                      ),
                    ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildCategoryCard(Map<String, dynamic> cat) {
    final icons = ['📚', '📖', '🎭', '🔬', '💻', '🎨', '🌍', '📝', '🏛️', '🎵'];
    final index = (cat['id'] ?? 0) % icons.length;
    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          // Could navigate to filtered book list
        },
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              Text(icons[index], style: const TextStyle(fontSize: 24)),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  cat['name'] ?? 'Danh mục',
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBookListTile(Map<String, dynamic> book, String heroTag) {
    return Card(
      color: AppColors.surface,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        contentPadding: const EdgeInsets.all(12),
        leading: Hero(
          tag: heroTag,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: book['thumbnail'] != null
                ? CachedNetworkImage(
                    imageUrl: book['thumbnail'],
                    width: 50,
                    height: 70,
                    fit: BoxFit.cover,
                    errorWidget: (_, __, ___) => Container(
                      width: 50,
                      height: 70,
                      color: Colors.grey[800],
                      child: const Icon(Icons.book, color: Colors.grey),
                    ),
                  )
                : Container(
                    width: 50,
                    height: 70,
                    color: Colors.grey[800],
                    child: const Icon(Icons.book, color: Colors.grey),
                  ),
          ),
        ),
        title: Text(
          book['title'] ?? 'Tên sách',
          style: const TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Text(
          book['author']?['name'] ?? 'Tác giả',
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
        ),
        trailing: const Icon(Icons.chevron_right, color: AppColors.textSecondary),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => BookDetailScreen(book: book, heroTag: heroTag),
            ),
          );
        },
      ),
    );
  }
}
