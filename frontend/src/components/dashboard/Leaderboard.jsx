import React, { useEffect, useState } from 'react';
import { Crown, Medal, TrendingUp } from 'lucide-react';
import gamificationApi from '../../api/gamificationApi';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await gamificationApi.getLeaderboard();
        if (response.success) {
          setLeaderboard(response.data);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={18} className="text-amber-500 fill-amber-500" />;
    if (rank === 2) return <Medal size={18} className="text-slate-400 fill-slate-400" />;
    if (rank === 3) return <Medal size={18} className="text-amber-700 fill-amber-700" />;
    return <span className="text-xs font-bold text-gray-400 w-[18px] text-center">{rank}</span>;
  };

  const getRankBg = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200';
    if (rank === 2) return 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200';
    return 'bg-white border-gray-100';
  };

  const tierColors = {
    'BRONZE': 'text-orange-600 bg-orange-50',
    'SILVER': 'text-slate-600 bg-slate-50',
    'GOLD': 'text-amber-600 bg-amber-50',
  };

  if (loading) return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="animate-pulse space-y-3">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-12 bg-gray-100 rounded-xl"></div>
        ))}
      </div>
    </div>
  );

};

export default Leaderboard;
