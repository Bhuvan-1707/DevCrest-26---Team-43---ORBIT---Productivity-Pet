import React, { useState } from 'react';
import { Activity, Clock, Coffee, CheckCircle2 } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { mockRecovery } from '../../data/mockData';

export default function RecoveryCard() {
  const [recovering, setRecovering] = useState(false);

  return (
    <Card className="orbit-card flex flex-col justify-between h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-emerald-400" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              RECOVERY
            </span>
          </div>
          <Badge variant={recovering ? 'emerald' : 'default'} pulse={recovering} size="sm">
            {recovering ? 'In Recovery' : `State: ${mockRecovery.state}`}
          </Badge>
        </div>

        <h3 className="text-base font-bold text-slate-100 font-heading tracking-tight mt-1">
          Recovery Intelligence
        </h3>
      </div>

      {/* Recovery Status Metrics */}
      <div className="grid grid-cols-2 gap-3 my-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
            <Clock size={15} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Last Break</span>
            <span className="text-xs font-bold text-slate-200">{mockRecovery.lastBreakMinutesAgo} min ago</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Coffee size={15} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Recommended</span>
            <span className="text-xs font-bold text-emerald-300">{mockRecovery.recommendedDuration} min recovery</span>
          </div>
        </div>
      </div>

      {/* Subtle Context Note */}
      <p className="text-xs text-slate-400 italic mb-4">
        "{mockRecovery.recommendation}"
      </p>

      {/* Interactive Start Recovery Button */}
      <Button
        variant={recovering ? 'accent' : 'secondary'}
        size="md"
        icon={recovering ? CheckCircle2 : Coffee}
        fullWidth
        onClick={() => setRecovering(!recovering)}
      >
        {recovering ? 'Recovery started' : 'Start Recovery'}
      </Button>
    </Card>
  );
}
