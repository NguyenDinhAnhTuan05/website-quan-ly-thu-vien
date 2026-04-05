/// Vietnamese error messages mapped from common API error responses.
/// Usage: `ErrorMessages.fromResponse(response)` or `ErrorMessages.fromException(e)`
class ErrorMessages {
  static const Map<int, String> _httpErrors = {
    400: 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại.',
    401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    403: 'Bạn không có quyền truy cập tính năng này.',
    404: 'Không tìm thấy dữ liệu yêu cầu.',
    409: 'Dữ liệu bị trùng lặp. Vui lòng kiểm tra lại.',
    422: 'Dữ liệu gửi lên không hợp lệ.',
    429: 'Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
    500: 'Lỗi máy chủ. Vui lòng thử lại sau.',
    502: 'Máy chủ tạm thời không khả dụng.',
    503: 'Hệ thống đang bảo trì. Vui lòng quay lại sau.',
  };

  static const Map<String, String> _knownMessages = {
    'Network is unreachable': 'Không có kết nối mạng. Vui lòng kiểm tra WiFi hoặc dữ liệu di động.',
    'Connection refused': 'Không thể kết nối đến máy chủ.',
    'Connection timed out': 'Kết nối quá thời gian chờ. Vui lòng thử lại.',
    'SocketException': 'Không thể kết nối đến máy chủ. Kiểm tra kết nối mạng.',
    'HandshakeException': 'Lỗi bảo mật kết nối. Vui lòng thử lại.',
    'FormatException': 'Dữ liệu phản hồi không đúng định dạng.',
  };

  /// Get a Vietnamese error message from an HTTP status code.
  static String fromStatusCode(int statusCode) {
    return _httpErrors[statusCode] ?? 'Có lỗi xảy ra (mã $statusCode). Vui lòng thử lại.';
  }

  /// Get a Vietnamese error message from an exception.
  static String fromException(dynamic error) {
    final errorStr = error.toString();
    for (final entry in _knownMessages.entries) {
      if (errorStr.contains(entry.key)) {
        return entry.value;
      }
    }
    return 'Có lỗi xảy ra. Vui lòng thử lại sau.';
  }
}
