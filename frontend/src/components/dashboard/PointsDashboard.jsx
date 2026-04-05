import React, { useEffect, useState } from 'react';
import { Trophy, Star, TrendingUp, CalendarCheck } from 'lucide-react';
import gamificationApi from '../../api/gamificationApi';
import useToast from '../../hooks/useToast';

const PointsDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchSummary = async () => {
    try {
      const response = await gamificationApi.getSummary();
      if (response.success) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Error fetching gamification summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleCheckIn = async () => {
    try {
      const response = await gamificationApi.dailyCheckIn();
      if (response.success) {
        showToast(response.data, 'success');
        fetchSummary(); // Refresh points
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi điểm danh', 'error');
    }
  };

  if (loading) return (
    <div className="animate-pulse bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
    </div>
  );

  if (!summary) return null;

  const tierColors = {
    'BRONZE': 'text-orange-700 bg-orange-100 border-orange-200',
    'SILVER': 'text-slate-700 bg-slate-100 border-slate-200',
    'GOLD': 'text-amber-700 bg-amber-100 border-amber-200',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1.5">
              <Trophy size={14} className="text-amber-500" />
              Điểm tích lũy & Hạng thành viên
            </h2>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-gray-900">{summary.currentPoints}</span>
              <span className="text-lg font-medium text-gray-500 mb-1">XP</span>
            </div>
          </div>
          
          <button 
            onClick={handleCheckIn}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm text-sm font-semibold"
          >
            <CalendarCheck size={18} />
            Điểm danh nhận quà
          </button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${tierColors[summary.membershipTier]}`}>
              Hạng {summary.membershipTier}
            </span>
            {summary.pointsToNextTier > 0 ? (
              <span className="text-gray-500 italic">Cần thêm {summary.pointsToNextTier} XP để thăng hạng</span>
            ) : (
              <span className="text-amber-600 font-medium">Bạn đã đạt hạng cao nhất! ✨</span>
            )}
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-3 relative">
            <div 
              className="bg-indigo-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm shadow-indigo-200"
              style={{ width: `${summary.progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
              <Star size={18} fill="currentColor" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Nhiệm vụ xong</p>
              <p className="text-lg font-bold text-gray-800">{summary.totalMissionsCompleted}</p>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Thăng tiến</p>
              <p className="text-lg font-bold text-gray-800">{Math.round(summary.progressPercentage)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsDashboard;
