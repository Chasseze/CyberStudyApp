import React from 'react';

/**
 * Loading Skeleton Components for better perceived performance
 */

export const CardSkeleton = ({ darkMode }) => (
  <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 border shadow-lg animate-pulse`}>
    <div className={`h-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/3 mb-4`}></div>
    <div className={`h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-full mb-2`}></div>
    <div className={`h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-2/3`}></div>
  </div>
);

export const ChartSkeleton = ({ darkMode }) => (
  <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 border shadow-lg animate-pulse`}>
    <div className={`h-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/4 mb-6`}></div>
    <div className="flex items-end justify-around h-48 gap-2">
      {[...Array(7)].map((_, i) => (
        <div 
          key={i}
          className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-t w-8`}
          style={{ height: `${Math.random() * 100 + 20}%` }}
        ></div>
      ))}
    </div>
  </div>
);

export const CalendarSkeleton = ({ darkMode }) => (
  <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 border shadow-lg animate-pulse`}>
    <div className="flex justify-between items-center mb-6">
      <div className={`h-8 w-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
      <div className={`h-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-32`}></div>
      <div className={`h-8 w-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
    </div>
    <div className="grid grid-cols-7 gap-2">
      {[...Array(35)].map((_, i) => (
        <div 
          key={i}
          className={`aspect-square ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}
        ></div>
      ))}
    </div>
  </div>
);

export const StatsSkeleton = ({ darkMode }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-4 border animate-pulse`}>
        <div className={`h-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-20 mb-3`}></div>
        <div className={`h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-16 mb-2`}></div>
        <div className={`h-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-24`}></div>
      </div>
    ))}
  </div>
);

export const TabContentSkeleton = ({ darkMode }) => (
  <div className="space-y-6">
    <StatsSkeleton darkMode={darkMode} />
    <ChartSkeleton darkMode={darkMode} />
    <CardSkeleton darkMode={darkMode} />
  </div>
);

export default {
  CardSkeleton,
  ChartSkeleton,
  CalendarSkeleton,
  StatsSkeleton,
  TabContentSkeleton
};
