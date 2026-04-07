import 'package:flutter/material.dart';

class AppColors {
  // Dark Theme Palette
  static const Color background = Color(0xFF121212);
  static const Color surface = Color(0xFF1E1E1E);
  static const Color primary = Color(0xFFBB86FC);
  static const Color primaryVariant = Color(0xFF3700B3);
  static const Color secondary = Color(0xFF03DAC6);
  static const Color error = Color(0xFFCF6679);
  
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xB3FFFFFF); // 70% opacity
  static const Color divider = Color(0x33FFFFFF); // 20% opacity
}

class ApiConstants {
  // Update this URL to match your backend deploy or local IP if using physical device
  static const String baseUrl = 'http://10.0.2.2:8080/api';
  
  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';

  // Books
  static const String books = '/books';
  static const String popularBooks = '/books/popular';

  // Misc
  static const String categories = '/categories';
  static const String authors = '/authors';

  // Borrows
  static const String borrows = '/borrows';
  static const String myHistory = '/borrows/my-history';

  // User profile
  static const String me = '/users/me';

  // Gamification
  static const String gamificationSummary = '/gamification/summary';
  static const String gamificationMissions = '/gamification/missions';
  static const String gamificationCheckIn = '/gamification/daily-check-in';
  static const String gamificationLeaderboard = '/gamification/leaderboard';
  static const String gamificationRewards = '/gamification/rewards';
  static const String gamificationRedeem = '/gamification/redeem';
  static const String gamificationRedemptionHistory = '/gamification/redemption-history';

  // Subscriptions
  static const String subscriptionPlans = '/subscriptions/plans';
  static const String mySubscription = '/subscriptions/my-subscription';
  static const String subscriptionActivate = '/subscriptions/activate';

  // Reviews — dynamic: use bookReviews(id) helper
  static String bookReviews(int bookId) => '/books/$bookId/reviews';
  static String bookReview(int bookId, int reviewId) => '/books/$bookId/reviews/$reviewId';

  // Book reader — dynamic
  static String bookRead(int bookId) => '/books/$bookId/read';
}
