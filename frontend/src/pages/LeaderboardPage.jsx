import React, { useEffect, useState } from 'react';
import { Crown, Medal, TrendingUp, Trophy, Star, Users } from 'lucide-react';
import gamificationApi from '../api/gamificationApi';
import { useAuthStore } from '../store/index';

const LeaderboardPage = () => {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const isCurrentUser = (entry) => user && entry.userId === user.id;

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
    if (rank === 1) return <Crown size={24} className="text-amber-500 fill-amber-500" />;
    if (rank === 2) return <Medal size={24} className="text-slate-400 fill-slate-400" />;
    if (rank === 3) return <Medal size={24} className="text-amber-700 fill-amber-700" />;
    return <span className="text-base font-bold text-gray-400">{rank}</span>;
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-amber-300 shadow-amber-100';
    if (rank === 2) return 'bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 border-slate-300 shadow-slate-100';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-orange-300 shadow-orange-100';
    return 'bg-white border-gray-200 hover:border-indigo-200';
  };

  const tierConfig = {
    'BRONZE': { label: 'Đồng', color: 'text-orange-700 bg-orange-100 border-orange-200' },
    'SILVER': { label: 'Bạc', color: 'text-slate-700 bg-slate-100 border-slate-200' },
    'GOLD': { label: 'Vàng', color: 'text-amber-700 bg-amber-100 border-amber-200' },
  };

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4">
            <Trophy size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Bảng Xếp Hạng</h1>
          <p className="text-gray-500 mt-2">Top 20 thành viên tích cực nhất tháng {new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-white h-20 rounded-2xl shadow-sm"></div>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm">
            <Users size={56} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có dữ liệu xếp hạng</h3>
            <p className="text-gray-500">Hãy bắt đầu tích điểm bằng cách đọc sách, viết đánh giá và điểm danh mỗi ngày!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {top3.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {/* 2nd Place */}
                <div className="flex flex-col items-center pt-8">
                  <div className="relative mb-3">
                    {top3[1].avatarUrl ? (
                      <img src={top3[1].avatarUrl} alt="" className={`w-16 h-16 rounded-full object-cover border-3 shadow-md ${isCurrentUser(top3[1]) ? 'border-indigo-400 ring-4 ring-indigo-100' : 'border-slate-300'}`} />
                    ) : (
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl border-3 shadow-md ${isCurrentUser(top3[1]) ? 'bg-indigo-50 text-indigo-600 border-indigo-400 ring-4 ring-indigo-100' : 'bg-slate-100 text-slate-600 border-slate-300'}`}>
                        {(top3[1].username || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 bg-slate-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">2</div>
                  </div>
                  <p className="text-sm font-bold text-gray-900 truncate max-w-full text-center">{isCurrentUser(top3[1]) ? <span className="text-indigo-600">Bạn</span> : top3[1].username}</p>
                  <p className="text-sm font-bold text-indigo-600">{top3[1].monthlyPoints} XP</p>
                  <div className="w-full bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-xl mt-2 h-20 border border-slate-200"></div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center">
                  <Crown size={28} className="text-amber-500 fill-amber-500 mb-1" />
                  <div className="relative mb-3">
                    {top3[0].avatarUrl ? (
                      <img src={top3[0].avatarUrl} alt="" className={`w-20 h-20 rounded-full object-cover border-3 shadow-lg ring-4 ${isCurrentUser(top3[0]) ? 'border-indigo-400 ring-indigo-200' : 'border-amber-400 ring-amber-100'}`} />
                    ) : (
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl border-3 shadow-lg ring-4 ${isCurrentUser(top3[0]) ? 'bg-indigo-50 text-indigo-600 border-indigo-400 ring-indigo-200' : 'bg-amber-50 text-amber-600 border-amber-400 ring-amber-100'}`}>
                        {(top3[0].username || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">1</div>
                  </div>
                  <p className="text-sm font-bold text-gray-900 truncate max-w-full text-center">{isCurrentUser(top3[0]) ? <span className="text-indigo-600">Bạn</span> : top3[0].username}</p>
                  <p className="text-base font-extrabold text-indigo-600">{top3[0].monthlyPoints} XP</p>
                  <div className="w-full bg-gradient-to-t from-amber-200 to-amber-100 rounded-t-xl mt-2 h-28 border border-amber-300"></div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center pt-12">
                  <div className="relative mb-3">
                    {top3[2].avatarUrl ? (
                      <img src={top3[2].avatarUrl} alt="" className={`w-14 h-14 rounded-full object-cover border-3 shadow-md ${isCurrentUser(top3[2]) ? 'border-indigo-400 ring-4 ring-indigo-100' : 'border-orange-300'}`} />
                    ) : (
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg border-3 shadow-md ${isCurrentUser(top3[2]) ? 'bg-indigo-50 text-indigo-600 border-indigo-400 ring-4 ring-indigo-100' : 'bg-orange-50 text-orange-600 border-orange-300'}`}>
                        {(top3[2].username || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 bg-amber-700 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">3</div>
                  </div>
                  <p className="text-sm font-bold text-gray-900 truncate max-w-full text-center">{isCurrentUser(top3[2]) ? <span className="text-indigo-600">Bạn</span> : top3[2].username}</p>
                  <p className="text-sm font-bold text-indigo-600">{top3[2].monthlyPoints} XP</p>
                  <div className="w-full bg-gradient-to-t from-orange-200 to-orange-100 rounded-t-xl mt-2 h-14 border border-orange-200"></div>
                </div>
              </div>
            )}

            {/* Rest of the list */}
            <div className="space-y-3">
              {(top3.length < 3 ? leaderboard : rest).map((entry) => (
                <div 
                  key={entry.userId}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl border shadow-sm transition-all hover:shadow-md ${isCurrentUser(entry) ? 'bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border-indigo-300 shadow-indigo-100 ring-2 ring-indigo-200' : getRankStyle(entry.rank)}`}
                >
                  <div className="flex-shrink-0 w-10 flex justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  <div className="flex-shrink-0">
                    {entry.avatarUrl ? (
                      <img src={entry.avatarUrl} alt="" className="w-11 h-11 rounded-full object-cover border-2 border-gray-200" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-base">
                        {(entry.username || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold truncate ${isCurrentUser(entry) ? 'text-indigo-700' : 'text-gray-900'}`}>
                        {isCurrentUser(entry) ? 'Bạn' : entry.username}
                      </p>
                      {isCurrentUser(entry) && (
                        <span className="text-[10px] font-bold text-white bg-indigo-500 px-2 py-0.5 rounded-full shadow-sm flex-shrink-0">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierConfig[entry.membershipTier]?.color || 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                      Hạng {tierConfig[entry.membershipTier]?.label || entry.membershipTier}
                    </span>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-amber-500 fill-amber-500" />
                      <span className="text-lg font-extrabold text-indigo-600">{entry.monthlyPoints}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">XP tháng này</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
