import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants.dart';

class ApiService {
  bool _isRefreshing = false;

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('accessToken');
    return {
      'Content-Type': 'application/json; charset=UTF-8',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  /// Try to refresh the access token using the stored refresh token.
  /// Returns true if successful.
  Future<bool> _refreshToken() async {
    if (_isRefreshing) return false;
    _isRefreshing = true;
    try {
      final prefs = await SharedPreferences.getInstance();
      final refreshToken = prefs.getString('refreshToken');
      if (refreshToken == null || refreshToken.isEmpty) return false;

      final url = Uri.parse('${ApiConstants.baseUrl}/auth/refresh');
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
        body: jsonEncode({'refreshToken': refreshToken}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final newAccess = data['accessToken'];
        final newRefresh = data['refreshToken'];
        if (newAccess != null) {
          await prefs.setString('accessToken', newAccess);
        }
        if (newRefresh != null) {
          await prefs.setString('refreshToken', newRefresh);
        }
        return true;
      }
      return false;
    } catch (e) {
      print('Refresh token error: $e');
      return false;
    } finally {
      _isRefreshing = false;
    }
  }

  /// Logout — clear stored tokens
  Future<void> clearTokens() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('accessToken');
    await prefs.remove('refreshToken');
  }

  Future<http.Response> get(String endpoint) async {
    final headers = await _getHeaders();
    final url = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    var response = await http.get(url, headers: headers);

    // On 401, try refreshing the token and retry once
    if (response.statusCode == 401) {
      final refreshed = await _refreshToken();
      if (refreshed) {
        final newHeaders = await _getHeaders();
        response = await http.get(url, headers: newHeaders);
      }
    }
    return response;
  }

  Future<http.Response> post(String endpoint, Map<String, dynamic> body) async {
    final headers = await _getHeaders();
    final url = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    var response = await http.post(url, headers: headers, body: jsonEncode(body));

    if (response.statusCode == 401) {
      final refreshed = await _refreshToken();
      if (refreshed) {
        final newHeaders = await _getHeaders();
        response = await http.post(url, headers: newHeaders, body: jsonEncode(body));
      }
    }
    return response;
  }

  Future<http.Response> put(String endpoint, Map<String, dynamic> body) async {
    final headers = await _getHeaders();
    final url = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    var response = await http.put(url, headers: headers, body: jsonEncode(body));

    if (response.statusCode == 401) {
      final refreshed = await _refreshToken();
      if (refreshed) {
        final newHeaders = await _getHeaders();
        response = await http.put(url, headers: newHeaders, body: jsonEncode(body));
      }
    }
    return response;
  }

  Future<http.Response> delete(String endpoint) async {
    final headers = await _getHeaders();
    final url = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    var response = await http.delete(url, headers: headers);

    if (response.statusCode == 401) {
      final refreshed = await _refreshToken();
      if (refreshed) {
        final newHeaders = await _getHeaders();
        response = await http.delete(url, headers: newHeaders);
      }
    }
    return response;
  }
}
