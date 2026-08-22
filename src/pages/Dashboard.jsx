import React from 'react';
import WelcomeHeader from '../components/dashboard/WelcomeHeader';
import PetCard from '../components/dashboard/PetCard';
import FocusCard from '../components/dashboard/FocusCard';
import FocusScore from '../components/dashboard/FocusScore';
import TodayTaskCard from '../components/dashboard/TodayTaskCard';
import ProductivityOverview from '../components/dashboard/ProductivityOverview';
import GoalProgress from '../components/dashboard/GoalProgress';
import RecoveryCard from '../components/dashboard/RecoveryCard';
import InsightCard from '../components/dashboard/InsightCard';
import RecentActivityCard from '../components/dashboard/RecentActivityCard';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full overflow-hidden">
      {/* 1. Welcome Header Hero */}
      <WelcomeHeader />

      {/* 2. Top Metric Cards Row (Pet, Focus Target, Focus Score) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="sm:col-span-1">
          <PetCard />
        </div>
        <div className="sm:col-span-1">
          <FocusCard />
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <FocusScore />
        </div>
      </div>

      {/* 3. Middle Core Row (Today's Tasks & Productivity Analytics) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TodayTaskCard />
        </div>
        <div className="lg:col-span-2">
          <ProductivityOverview />
        </div>
      </div>

      {/* 4. Bottom Row 1 (Goal Progress, Recovery State, ORBIT Discovered) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="sm:col-span-1">
          <GoalProgress />
        </div>
        <div className="sm:col-span-1">
          <RecoveryCard />
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <InsightCard />
        </div>
      </div>

      {/* 5. Telemetry Activity Stream Row (Recent Activity Widget) */}
      <div className="grid grid-cols-1 gap-6">
        <RecentActivityCard />
      </div>
    </div>
  );
}
