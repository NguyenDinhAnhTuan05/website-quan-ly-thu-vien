import React, { useEffect, useState } from 'react';
import { Gift, ShoppingBag, Loader2, CheckCircle2, AlertCircle, History, Clock, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import gamificationApi from '../../api/gamificationApi';
import useToast from '../../hooks/useToast';

const RewardShop = ({ onPointsChanged }) => {
  const [rewards, setRewards] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const { showToast } = useToast();

  const fetchRewards = async () => {
    try {
      const response = await gamificationApi.getRewards();
      if (response.success) {
        setRewards(response.data);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await gamificationApi.getRedemptionHistory();
      if (response.success) {
        setHistory(response.data);
      }
    } catch (error) {
      console.error('Error fetching redemption history:', error);
    }
  };

  useEffect(() => {
    fetchRewards();
    fetchHistory();
  }, []);

  const handleRedeem = async (reward) => {
    if (!window.confirm(`Bạn có chắc muốn đổi ${reward.pointCost} XP lấy "${reward.name}"?`)) return;
    
    setRedeeming(reward.id);
    try {
      const response = await gamificationApi.redeemReward(reward.id);
      if (response.success) {
        showToast(`Đổi thưởng thành công! Bạn đã nhận "${reward.name}"`, 'success');
        fetchRewards();
        fetchHistory();
        if (onPointsChanged) onPointsChanged();
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

  if (loading) return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RewardShop;
