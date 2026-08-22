import React from 'react';
import { motion } from 'framer-motion';
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function Dashboard() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 max-w-7xl mx-auto w-full overflow-hidden"
    >
      {/* 1. Welcome Header Hero */}
      <motion.div variants={itemVariants}>
        <WelcomeHeader />
      </motion.div>

      {/* 2. Top Metric Cards Row (Pet, Focus Target, Focus Score) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="sm:col-span-1">
          <PetCard />
        </div>
        <div className="sm:col-span-1">
          <FocusCard />
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <FocusScore />
        </div>
      </motion.div>

      {/* 3. Middle Core Row (Today's Tasks & Productivity Analytics) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TodayTaskCard />
        </div>
        <div className="lg:col-span-2">
          <ProductivityOverview />
        </div>
      </motion.div>

      {/* 4. Bottom Row 1 (Goal Progress, Recovery State, ORBIT Discovered) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="sm:col-span-1">
          <GoalProgress />
        </div>
        <div className="sm:col-span-1">
          <RecoveryCard />
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <InsightCard />
        </div>
      </motion.div>

      {/* 5. Telemetry Activity Stream Row (Recent Activity Widget) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6">
        <RecentActivityCard />
      </motion.div>
    </motion.div>
  );
}
