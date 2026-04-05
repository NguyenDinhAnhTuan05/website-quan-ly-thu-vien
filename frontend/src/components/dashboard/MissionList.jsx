import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Gift, Swords } from 'lucide-react';
import gamificationApi from '../../api/gamificationApi';

const MissionList = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await gamificationApi.getMissions();
        if (response.success) {
          setMissions(response.data);
        }
      } catch (error) {
        console.error('Error fetching missions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMissions();
  }, []);

  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse bg-gray-50 h-24 rounded-xl"></div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Swords size={20} className="text-indigo-500" />
          Nhiệm vụ thư viện
        </h2>
        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
          {missions.filter(m => !m.isCompleted).length} nhiệm vụ mới
        </span>
      </div>

      <div className="divide-y divide-gray-50">
        {missions.map((mission) => (
          <div 
            key={mission.id} 
            className={`p-5 flex items-start gap-4 transition-all duration-200 ${mission.isCompleted ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}
          >
            <div className={`mt-1 flex-shrink-0 ${mission.isCompleted ? 'text-green-500' : 'text-gray-300'}`}>
              {mission.isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </div>

            <div className="flex-grow">
              <div className="flex justify-between items-start mb-1">
                <h3 className={`text-sm font-bold ${mission.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                  {mission.title}
                </h3>
                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg border border-amber-100">
                  <Gift size={12} fill="currentColor" />
                  <span className="text-xs font-bold">+{mission.pointReward} XP</span>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                {mission.description}
              </p>

              <div className="flex items-center gap-3">
                <div className="flex-grow h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${mission.isCompleted ? 'bg-green-400' : 'bg-indigo-400'}`}
                    style={{ width: `${(mission.currentProgress / mission.requirement) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter w-12 text-right">
                  {mission.currentProgress} / {mission.requirement}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MissionList;
