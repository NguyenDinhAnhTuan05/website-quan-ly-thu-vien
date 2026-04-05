import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import paymentApi from '../api/paymentApi';
import subscriptionApi from '../api/subscriptionApi';
import userApi from '../api/userApi';
import { useAuthStore } from '../store';
import { Loader2, CheckCircle2, AlertCircle, Copy, ArrowLeft, Smartphone, CreditCard, Zap } from 'lucide-react';

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateProfile } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [step, setStep] = useState(1); // 1: QR, 2: Verifying, 3: Success

  const planId = searchParams.get('planId');
  const planName = searchParams.get('planName');
  const amount = parseInt(searchParams.get('amount'));

  useEffect(() => {
    if (!user || !planId || !amount) {
      navigate('/subscription');
      return;
    }

    const initPayment = async () => {
      const orderCode = `TL${user.id}P${planId}T${Date.now()}`;
      try {
        const res = await paymentApi.getSePayQR(amount, orderCode);
        setPaymentData({
          userId: user.id,
          planId,
          planName: planName || 'Gói Premium',
          amount,
          orderCode,
          qrUrl: res.qr_link_image,
          bankInfo: res.bank_account_info,
        });
      } catch (e) {
        setError('Không thể tạo mã QR thanh toán. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    initPayment();
  }, [user, planId, amount, planName, navigate]);

  const fmtVnd = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    setStep(2);
    setVerifying(true);
    setError('');
    try {
      await paymentApi.verifySePayTransaction(paymentData.amount, paymentData.orderCode);
      await subscriptionApi.activate({
        planId: paymentData.planId,
        paymentRef: paymentData.orderCode,
      });
      
      const freshUser = await userApi.getMe();
      updateProfile(freshUser);
      
      setStep(3);
      setTimeout(() => {
        navigate('/subscription?success=true');
      }, 3000);
    } catch (e) {
      const msg =
        e.response?.data?.error ||
        e.response?.data?.message ||
        'Chưa tìm thấy giao dịch. Vui lòng đợi 10–15 giây rồi thử lại.';
      setError(msg);
      setStep(1);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Loader2 size={40} className="text-white animate-spin" />
          </div>
          <p className="text-gray-900 text-xl font-bold">Đang khởi tạo thanh toán...</p>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={48} className="text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-8">{error || 'Không thể tạo mã thanh toán'}</p>
          <Link
            to="/subscription"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all"
          >
            <ArrowLeft size={20} />
            Quay lại chọn gói
          </Link>
        </div>
      </div>
    );
  }

  // Success State
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center max-w-lg animate-scale-in">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle2 size={64} className="text-white" />
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4">Thanh toán thành công! 🎉</h2>
          <p className="text-gray-600 text-lg mb-8">
            Tài khoản của bạn đã được nâng cấp lên <span className="font-bold text-green-600">{paymentData.planName}</span>
          </p>
          <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
            <Loader2 size={16} className="animate-spin" />
            Đang chuyển hướng...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container-max max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/subscription"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Quay lại</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700">Bảo mật</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg">
                <Zap size={16} className="text-primary-600" />
                <span className="text-sm font-bold text-primary-600">Tự động xác nhận</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-max max-w-7xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Quét mã QR', icon: Smartphone },
              { num: 2, label: 'Chuyển khoản', icon: CreditCard },
              { num: 3, label: 'Hoàn tất', icon: CheckCircle2 },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s.num
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    <s.icon size={24} />
                  </div>
                  <span className={`text-xs font-semibold mt-2 ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${
                    step > s.num ? 'bg-gradient-to-r from-primary-500 to-accent-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - QR & Amount */}
          <div className="lg:col-span-2 space-y-6">
            {/* QR Code Card */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500 to-accent-500 px-8 py-6">
                <h2 className="text-2xl font-black text-white mb-2">Quét mã QR để thanh toán</h2>
                <p className="text-primary-100">Sử dụng ứng dụng ngân hàng của bạn</p>
              </div>

              <div className="p-8">
                {/* QR Code */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    {/* Animated Border */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary-500 via-accent-500 to-purple-500 rounded-3xl opacity-20 blur-xl animate-pulse"></div>
                    
                    {/* QR Container */}
                    <div className="relative bg-white rounded-2xl p-6 shadow-2xl border-4 border-gray-100">
                      {/* Scanning Animation */}
                      <div className="absolute inset-0 overflow-hidden rounded-2xl">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent animate-scan"></div>
                      </div>
                      
                      <img
                        src={paymentData.qrUrl}
                        alt="QR Code"
                        className="w-80 h-80 rounded-xl"
                      />
                      
                      {/* Corner Markers */}
                      <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-primary-500"></div>
                      <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-primary-500"></div>
                      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-accent-500"></div>
                      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-accent-500"></div>
                    </div>
                  </div>
                </div>

                {/* Bank Logos */}
                <div className="flex items-center justify-center gap-6 py-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500 font-semibold">Hỗ trợ bởi:</p>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/a/ab/MB_Bank_Logo.png" alt="MBBank" className="h-8 w-auto grayscale hover:grayscale-0 transition-all" />
                  <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/VnPay_Logo.png" alt="VNPay" className="h-8 w-auto grayscale hover:grayscale-0 transition-all" />
                </div>
              </div>
            </div>

            {/* Manual Transfer Info */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-xl font-black text-gray-900 mb-6">Hoặc chuyển khoản thủ công</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100 hover:border-primary-200 transition-all group">
                  <p className="text-xs text-gray-500 font-bold mb-2">NGÂN HÀNG</p>
                  <p className="text-lg font-black text-gray-900 group-hover:text-primary-600 transition-colors">
                    {paymentData.bankInfo?.bank}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100 hover:border-primary-200 transition-all group relative">
                  <p className="text-xs text-gray-500 font-bold mb-2">SỐ TÀI KHOẢN</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-black text-gray-900 font-mono group-hover:text-primary-600 transition-colors">
                      {paymentData.bankInfo?.number}
                    </p>
                    <button
                      onClick={() => copyToClipboard(paymentData.bankInfo?.number, 'account')}
                      className="p-2 hover:bg-white rounded-lg transition-all"
                    >
                      {copied === 'account' ? (
                        <CheckCircle2 size={18} className="text-green-500" />
                      ) : (
                        <Copy size={18} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100 hover:border-primary-200 transition-all group">
                  <p className="text-xs text-gray-500 font-bold mb-2">CHỦ TÀI KHOẢN</p>
                  <p className="text-lg font-black text-gray-900 group-hover:text-primary-600 transition-colors">
                    {paymentData.bankInfo?.name}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <p className="text-xs text-primary-100 font-bold mb-2">NỘI DUNG</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-black text-white font-mono">
                      {paymentData.orderCode}
                    </p>
                    <button
                      onClick={() => copyToClipboard(paymentData.orderCode, 'code')}
                      className="p-2 hover:bg-white/20 rounded-lg transition-all"
                    >
                      {copied === 'code' ? (
                        <CheckCircle2 size={18} className="text-white" />
                      ) : (
                        <Copy size={18} className="text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-24">
              <h3 className="text-lg font-black text-gray-900 mb-6">Chi tiết đơn hàng</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Gói đăng ký</span>
                  <span className="font-bold text-gray-900 text-right max-w-[60%]">{paymentData.planName}</span>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-gray-600 font-semibold">Tổng thanh toán</span>
                  <span className="text-3xl font-black bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                    {fmtVnd(paymentData.amount)}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3 animate-shake">
                  <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-semibold">{error}</p>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleVerify}
                disabled={verifying || step === 2}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-black text-lg hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                {step === 2 ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    Đang xác minh...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={24} />
                    Tôi đã chuyển khoản
                  </>
                )}
              </button>

              {/* Help Text */}
              <p className="text-xs text-gray-500 text-center mt-4">
                Giao dịch sẽ được xác nhận tự động trong 10-15 giây
              </p>
            </div>

            {/* Security Badge */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="font-black text-green-900 mb-1">Thanh toán an toàn</p>
                  <p className="text-sm text-green-700">Mọi giao dịch được mã hóa và bảo mật tuyệt đối</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(320px); }
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
