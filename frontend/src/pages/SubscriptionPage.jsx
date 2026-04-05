import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import subscriptionApi from '../api/subscriptionApi';
import userApi from '../api/userApi';
import { useAuthStore } from '../store';
import { Check, Zap, Loader2 } from 'lucide-react';

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);
  const [successPlanId, setSuccessPlanId] = useState(null);
  const [currentSub, setCurrentSub] = useState(null);
  const { user, updateProfile } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, subRes] = await Promise.all([
          subscriptionApi.getAllPlans(),
          user ? subscriptionApi.getMySubscription().catch(() => ({ data: null })) : Promise.resolve({ data: null }),
        ]);
        setPlans(plansRes.data || plansRes);
        setCurrentSub(subRes.data || subRes || null);
      } catch {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Fire confetti when a plan is successfully activated
  useEffect(() => {
    if (!successPlanId) return;
    const end = Date.now() + 1500;
    const fire = () => {
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 }, colors: ['#d946ef', '#f97316', '#6366f1', '#22c55e'] });
      if (Date.now() < end) requestAnimationFrame(fire);
    };
    fire();
  }, [successPlanId]);

  // Detect redirect from PaymentPage with ?success=true
  useEffect(() => {
    if (!loading && searchParams.get('success') === 'true' && currentSub?.plan?.id) {
      setSuccessPlanId(currentSub.plan.id);
      setTimeout(() => setSuccessPlanId(null), 3000);
      searchParams.delete('success');
      setSearchParams(searchParams, { replace: true });
    }
  }, [loading, searchParams, currentSub, setSearchParams]);

  const handleSubscribe = async (plan) => {
    if (!user) {
      alert('Vui lòng đăng nhập để nâng cấp gói!');
      return;
    }

    if (plan.price === 0) {
      if (!window.confirm('Bạn có muốn đăng ký gói miễn phí này không?')) return;
      setActivating(plan.id);
      try {
        const res = await subscriptionApi.activate({ planId: plan.id, paymentRef: null });
        const freshUser = await userApi.getMe();
        updateProfile(freshUser);
        setCurrentSub(res.data || res);
        setSuccessPlanId(plan.id);
        setTimeout(() => setSuccessPlanId(null), 3000);
      } catch (e) {
        alert(e.response?.data?.message || e.response?.data || 'Có lỗi xảy ra, vui lòng thử lại.');
      } finally {
        setActivating(null);
      }
      return;
    }

    navigate(`/payment?planId=${plan.id}&planName=${encodeURIComponent(plan.name)}&amount=${plan.price}`);
  };

  const fmtVnd = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  if (loading) return <div className="flex justify-center p-20 text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Nâng Cấp Trải Nghiệm Đọc Sách
        </h2>
        <p className="mt-4 text-xl text-gray-600">
          Chọn gói phù hợp để tận hưởng tối đa đặc quyền từ thư viện của chúng tôi.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
        {plans.map((plan) => {
          const isPremium = plan.name.includes('PREMIUM');
          // Đang dùng gói trả phí → không cho chọn gói miễn phí
          const hasPaidActiveSub = currentSub && currentSub.plan && currentSub.status === 'ACTIVE';
          const isCurrentPlan = currentSub?.plan?.id === plan.id && currentSub?.status === 'ACTIVE';
          const isFreePlanBlocked = plan.price <= 0 && hasPaidActiveSub && currentSub.plan.id !== plan.id;
          const isActivated = isCurrentPlan;
          const isSucceeded = successPlanId === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border bg-white p-8 shadow-sm transition-transform hover:scale-105 ${
                isPremium ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-200'
              }`}
            >
              {isPremium && (
                <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wide">
                  Phổ biến nhất
                </span>
              )}

              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-4 flex items-baseline text-gray-900">
                  <span className="text-4xl font-extrabold tracking-tight">{fmtVnd(plan.price)}</span>
                  <span className="ml-1 text-xl font-semibold text-gray-500">/{plan.durationDays} ngày</span>
                </p>
                <p className="mt-6 text-gray-500">{plan.description}</p>

                <ul className="mt-6 space-y-3">
                  <li className="flex">
                    <Check className="h-6 w-6 text-green-500 shrink-0" />
                    <span className="ml-3 text-gray-700">Mượn tối đa {plan.maxBorrowBooks} cuốn sách</span>
                  </li>
                  <li className="flex">
                    <Check className="h-6 w-6 text-green-500 shrink-0" />
                    <span className="ml-3 text-gray-700">Đọc E-book không giới hạn</span>
                  </li>
                  {plan.price > 0 && (
                    <li className="flex">
                      <Check className="h-6 w-6 text-green-500 shrink-0" />
                      <span className="ml-3 text-gray-700">Đặc quyền mượn sách hiếm</span>
                    </li>
                  )}
                  {plan.price > 0 && (
                    <li className="flex items-center gap-2 mt-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/a/ab/MB_Bank_Logo.png" alt="MBBank" className="h-5 w-auto" />
                      <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/VnPay_Logo.png" alt="VNPay" className="h-5 w-auto" />
                      <span className="text-xs text-gray-400">Chuyển khoản / VNPay</span>
                    </li>
                  )}
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={isActivated || isFreePlanBlocked || activating === plan.id}
                className={`mt-8 block w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                  isPremium
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                {activating === plan.id && <Loader2 size={16} className="animate-spin" />}
                {isSucceeded
                  ? '✓ Kích hoạt thành công!'
                  : isActivated
                  ? '✓ Đang sử dụng'
                  : isFreePlanBlocked
                  ? 'Bạn đang dùng gói trả phí'
                  : plan.price > 0
                  ? 'Thanh toán ngay'
                  : 'Chọn gói này'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-20 max-w-4xl mx-auto bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <Zap size={40} className="fill-current" />
          <div>
            <h3 className="text-2xl font-bold">Thử thách Đọc sách & Tích điểm</h3>
            <p className="opacity-90">Mỗi cuốn sách bạn trả đúng hạn sẽ được cộng 10 điểm thưởng!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
