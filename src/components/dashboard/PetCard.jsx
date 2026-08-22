import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import OrbitPet from '../pet/OrbitPet';
import { mockPetState } from '../../data/mockData';
import { useSession } from '../../hooks/useSession';

export default function PetCard() {
  const { petState: globalPetState, updatePetState } = useSession();
  const [localPetState, setLocalPetState] = useState(globalPetState || 'idle');

  useEffect(() => {
    if (globalPetState) {
      setLocalPetState(globalPetState);
    }
  }, [globalPetState]);

  const stateMessages = {
    idle: mockPetState.contextualMessages.inRhythm,
    focused: mockPetState.contextualMessages.highFocus,
    happy: mockPetState.contextualMessages.celebrating,
    recovering: mockPetState.contextualMessages.recoveryRecommended,
  };

  const statesList = ['idle', 'focused', 'happy', 'recovering'];

  const handleStateChange = (nextState) => {
    setLocalPetState(nextState);
    updatePetState(nextState);
  };

  return (
    <Card className="orbit-card flex flex-col justify-between h-full relative overflow-hidden group">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 font-heading">
            ORBIT Companion
          </h3>
        </div>
        <Badge variant={localPetState === 'happy' ? 'emerald' : 'cyan'} size="sm">
          {localPetState}
        </Badge>
      </div>

      {/* Pet Visual Container & Speech Bubble */}
      <div className="my-6 flex flex-col items-center gap-4 text-center">
        <OrbitPet 
          state={localPetState} 
          size="md" 
          onClick={() => {
            const currentIndex = statesList.indexOf(localPetState);
            const nextState = statesList[(currentIndex + 1) % statesList.length];
            handleStateChange(nextState);
          }}
        />

        {/* Speech Bubble */}
        <div className="relative px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 font-sans shadow-md max-w-[220px]">
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-t border-l border-slate-800 rotate-45" />
          <p className="italic text-slate-300">
            "{stateMessages[localPetState]}"
          </p>
        </div>
      </div>

      {/* Interactive State Chips & Footer Metric */}
      <div className="flex flex-col gap-3 pt-3 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Focus trend</span>
          <span className="flex items-center gap-1 font-bold text-emerald-400">
            <TrendingUp size={13} />
            ↑ 12%
          </span>
        </div>

        {/* Quick State Selector Buttons */}
        <div className="grid grid-cols-4 gap-1">
          {statesList.map((st) => (
            <button
              key={st}
              onClick={() => handleStateChange(st)}
              className={`py-1 text-[10px] capitalize font-medium rounded-md transition-all ${
                localPetState === st 
                  ? 'bg-indigo-600/30 text-cyan-300 border border-indigo-500/40' 
                  : 'bg-slate-900/50 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
