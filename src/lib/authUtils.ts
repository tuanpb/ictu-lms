/**
 * Tiện ích hỗ trợ xử lý và Việt hóa các thông báo lỗi từ Supabase Auth.
 */

export const mapAuthError = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('invalid login credentials')) {
    return 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.';
  }

  if (lowerMessage.includes('email not confirmed')) {
    return 'Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư email để kích hoạt tài khoản.';
  }

  if (lowerMessage.includes('user already registered')) {
    return 'Email này đã được đăng ký bởi một tài khoản khác.';
  }

  if (lowerMessage.includes('password should be at least')) {
    return 'Mật khẩu quá ngắn. Vui lòng sử dụng ít nhất 6 ký tự.';
  }
  
  if (lowerMessage.includes('network error') || lowerMessage.includes('failed to fetch')) {
    return 'Lỗi kết nối mạng. Vui lòng kiểm tra lại đường truyền.';
  }

  if (lowerMessage.includes('email rate limit exceeded')) {
    return 'Bạn đã gửi yêu cầu quá nhanh. Vui lòng đợi một lát rồi thử lại.';
  }

  if (lowerMessage.includes('invalid email')) {
    return 'Địa chỉ email không hợp lệ.';
  }

  // Mặc định trả về thông báo gốc nếu không khớp mẫu nào, hoặc một thông báo chung
  return message || 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.';
};
