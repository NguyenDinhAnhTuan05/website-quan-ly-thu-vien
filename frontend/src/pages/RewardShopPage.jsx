import React, { useEffect, useState } from 'react';
import { Gift, ShoppingBag, Loader2, CheckCircle2, AlertCircle, History, Trophy, Star, ArrowLeft, Sparkles, Clock, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import gamificationApi from '../api/gamificationApi';
import { useAuthStore } from '../store/index';
import useToast from '../hooks/useToast';
import Toast from '../components/ui/Toast';

const RewardShopPage = () => {
  const { isAuthenticated, syncUserFromServer } = useAuthStore();
  const { toast, showToast } = useToast(3000);
  const [rewards, setRewards] = useState([]);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const [activeTab, setActiveTab] = useState('shop');

  const fetchData = async () => {
    try {
      const [rewardsRes, summaryRes] = await Promise.all([
        gamificationApi.getRewards(),
        gamificationApi.getSummary(),
      ]);
      if (rewardsRes.success) setRewards(rewardsRes.data);
      if (summaryRes.success) setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching reward data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await gamificationApi.getRedemptionHistory();
      if (res.success) setHistory(res.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleRedeem = async (reward) => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để đổi thưởng!', 'error');
      return;
    }
    if (!window.confirm(`Bạn có chắc muốn đổi ${reward.pointCost} XP lấy "${reward.name}"?`)) return;
    
    setRedeeming(reward.id);
    try {
      const response = await gamificationApi.redeemReward(reward.id);
      if (response.success) {
        showToast(`Đổi thưởng thành công! Bạn đã nhận "${reward.name}"`, 'success');
        fetchData();
        fetchHistory();
        syncUserFromServer();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi đổi thưởng', 'error');
    } finally {
      setRedeeming(null);
    }
  };

  const rewardTypeColors = {
    'SUBSCRIPTION': 'from-purple-500 to-indigo-600',
    'EXTRA_BORROW': 'from-blue-500 to-cyan-600',
    'DISCOUNT': 'from-amber-500 to-orange-600',
    'BADGE': 'from-emerald-500 to-teal-600',
  };

  const rewardTypeLabels = {
    'SUBSCRIPTION': 'Gói đăng ký',
    'EXTRA_BORROW': 'Slot mượn sách',
    'DISCOUNT': 'Mã giảm giá',
    'BADGE': 'Huy hiệu',
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-3xl p-12 shadow-sm border border-gray-100 max-w-md">
          <ShoppingBag size={56} className="mx-auto mb-4 text-indigo-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Đổi Điểm Thưởng</h2>
          <p className="text-gray-500 mb-6">Đăng nhập để xem phần thưởng và đổi điểm tích lũy.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Toast message={toast?.msg} type={toast?.type} />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg shadow-purple-200 mb-4">
            <Gift size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Đổi Điểm Thưởng</h1>
          <p className="text-gray-500 mt-2">Sử dụng điểm tích lũy để nhận những phần thưởng hấp dẫn</p>
        </div>

        {/* Points Summary Bar */}
        {summary && (
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 mb-8 text-white shadow-xl shadow-indigo-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <Star size={28} className="text-amber-300 fill-amber-300" />
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">Điểm hiện tại</p>
                  <p className="text-3xl font-extrabold">{summary.currentPoints} <span className="text-lg font-medium text-white/70">XP</span></p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Hạng</p>
                  <p className="text-lg font-bold">{summary.membershipTier}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Nhiệm vụ xong</p>
                  <p className="text-lg font-bold">{summary.totalMissionsCompleted}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-8">
          {[
            { id: 'shop', label: 'Cửa hàng', icon: <ShoppingBag size={16} /> },
            { id: 'history', label: 'Lịch sử đổi', icon: <History size={16} /> },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-bold text-sm rounded-xl transition-all ${
                activeTab === id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-white h-56 rounded-2xl shadow-sm"></div>
            ))}
          </div>
        ) : activeTab === 'shop' ? (
          <>
            {rewards.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm">
                <Sparkles size={56} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có phần thưởng nào</h3>
                <p className="text-gray-500">Các phần thưởng sẽ sớm được cập nhật, hãy quay lại sau!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                  <div 
                    key={reward.id}
                    className={`relative rounded-2xl border overflow-hidden transition-all hover:shadow-lg group ${
                      reward.canRedeem ? 'border-gray-200 hover:border-indigo-300' : 'border-gray-100 opacity-70'
                    }`}
                  >
                    {/* Header gradient */}
                    <div className={`bg-gradient-to-r ${rewardTypeColors[reward.rewardType] || 'from-gray-400 to-gray-500'} p-5 relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                      <span className="text-4xl block mb-2">{reward.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 block mb-1">
                        {rewardTypeLabels[reward.rewardType] || reward.rewardType}
                      </span>
                      <h3 className="text-base font-bold text-white">{reward.name}</h3>
                    </div>

                    {/* Body */}
                    <div className="bg-white p-5">
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">{reward.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl border border-amber-100">
                          <Star size={14} fill="currentColor" />
                          <span className="text-sm font-extrabold">{reward.pointCost} XP</span>
                        </div>
                        
                        {reward.stock !== -1 && (
                          <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-lg">
                            Còn {reward.stock} phần
                          </span>
                        )}
                      </div>

                      {/* Validity badge */}
                      <div className="flex items-center gap-1.5 mb-4 text-xs">
                        <Clock size={12} className="text-gray-400" />
                        {reward.validityDays ? (
                          <span className="text-gray-500 font-medium">Hiệu lực: <span className="text-gray-700 font-bold">{reward.validityDays} ngày</span> sau khi đổi</span>
                        ) : (
                          <span className="text-emerald-600 font-bold">Vĩnh viễn</span>
                        )}
                      </div>

                      <button
                        onClick={() => handleRedeem(reward)}
                        disabled={!reward.canRedeem || redeeming === reward.id}
                        className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                          reward.canRedeem
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 hover:shadow-lg'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {redeeming === reward.id ? (
                          <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</>
                        ) : !reward.canRedeem ? (
                          <><AlertCircle size={16} /> Không đủ điểm</>
                        ) : (
                          <><Gift size={16} /> Đổi ngay</>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* History Tab */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {history.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <History size={48} className="mx-auto mb-4 opacity-40" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có lịch sử đổi thưởng</h3>
                <p className="text-sm text-gray-500">Bắt đầu đổi phần thưởng để xem lịch sử tại đây</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {history.map((item) => (
                  <div key={item.id} className={`flex items-center gap-4 p-5 transition-colors ${item.expired ? 'bg-gray-50/80 opacity-60' : 'hover:bg-gray-50/50'}`}>
                    <span className="text-3xl">{item.rewardIcon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{item.rewardName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(item.redeemedAt).toLocaleDateString('vi-VN', { 
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </p>
                      {item.expiresAt && (
                        <p className={`text-[11px] mt-1 flex items-center gap-1 font-medium ${
                          item.expired ? 'text-red-500' : 'text-emerald-600'
                        }`}>
                          <Timer size={11} />
                          {item.expired 
                            ? 'Hết hạn' 
                            : `Còn hiệu lực đến ${new Date(item.expiresAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
                          }
                        </p>
                      )}
                      {!item.expiresAt && (
                        <p className="text-[11px] mt-1 text-emerald-600 font-medium">Vĩnh viễn</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-sm font-bold text-red-500">-{item.pointsSpent} XP</span>
                      </div>
                      {item.expired 
                        ? <Clock size={18} className="text-gray-400 flex-shrink-0" />
                        : <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
};

export default RewardShopPage;
