// import { TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react';
// import StatCard from '../components/StatCard';

// export default function AnalyticsView() {
//   const performanceData = [
//     { month: 'Jan', dispatches: 120, onTime: 95, delayed: 15, avgDuration: 3.2 },
//     { month: 'Feb', dispatches: 135, onTime: 110, delayed: 12, avgDuration: 3.0 },
//     { month: 'Mar', dispatches: 150, onTime: 128, delayed: 10, avgDuration: 2.9 },
//     { month: 'Apr', dispatches: 145, onTime: 120, delayed: 15, avgDuration: 3.1 },
//     { month: 'May', dispatches: 160, onTime: 142, delayed: 8, avgDuration: 2.8 },
//     { month: 'Jun', dispatches: 175, onTime: 158, delayed: 7, avgDuration: 2.7 },
//   ];

//   const maxDispatches = Math.max(...performanceData.map(d => d.dispatches));

//   const fuelTypeDistribution = [
//     { type: 'Benzine', volume: 8910, percentage: 42, color: '#4696dd' },
//     { type: 'Diesel', volume: 10470, percentage: 49, color: '#d4af37' },
//     { type: 'Jet Fuel', volume: 6444, percentage: 9, color: '#059669' },
//   ];

//   const regionalPerformance = [
//     { region: 'Addis Ababa', score: 95, dispatches: 85, trend: 'up' },
//     { region: 'Oromia', score: 88, dispatches: 72, trend: 'up' },
//     { region: 'Amhara', score: 92, dispatches: 68, trend: 'down' },
//     { region: 'Tigray', score: 85, dispatches: 45, trend: 'up' },
//     { region: 'Sidama', score: 90, dispatches: 52, trend: 'up' },
//   ];

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
//         <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <StatCard
//           title="Total Dispatches"
//           value="885"
//           icon={Activity}
//           trend="+12% from last month"
//           color="#4696dd"
//         />
//         <StatCard
//           title="On-Time Rate"
//           value="89%"
//           icon={TrendingUp}
//           trend="+3% improvement"
//           color="#059669"
//         />
//         <StatCard
//           title="Avg Duration"
//           value="2.9 days"
//           icon={Calendar}
//           trend="-0.2 days improvement"
//           color="#d4af37"
//         />
//         <StatCard
//           title="Delayed Trips"
//           value="67"
//           icon={TrendingDown}
//           color="#dc2626"
//         />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
//           <h2 className="text-xl font-bold text-gray-900 mb-6">Monthly Dispatch Trend</h2>
//           <div className="space-y-4">
//             {performanceData.map((data, index) => (
//               <div key={index}>
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-sm font-medium text-gray-700">{data.month}</span>
//                   <div className="flex items-center gap-4">
//                     <span className="text-sm font-bold text-gray-900">{data.dispatches}</span>
//                     <span className="text-xs text-green-600 font-medium">{data.onTime} on-time</span>
//                     <span className="text-xs text-red-600 font-medium">{data.delayed} delayed</span>
//                   </div>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
//                   <div className="flex h-full">
//                     <div
//                       className="bg-gradient-to-r from-green-400 to-green-500"
//                       style={{ width: `${(data.onTime / maxDispatches) * 100}%` }}
//                     ></div>
//                     <div
//                       className="bg-gradient-to-r from-red-400 to-red-500"
//                       style={{ width: `${(data.delayed / maxDispatches) * 100}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
//           <h2 className="text-xl font-bold text-gray-900 mb-6">Fuel Type Distribution</h2>
//           <div className="space-y-6">
//             {fuelTypeDistribution.map((fuel, index) => (
//               <div key={index}>
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="flex items-center gap-3">
//                     <div
//                       className="w-4 h-4 rounded"
//                       style={{ backgroundColor: fuel.color }}
//                     ></div>
//                     <span className="font-bold text-gray-900">{fuel.type}</span>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-bold text-gray-900">{fuel.volume.toLocaleString()} m³</p>
//                     <p className="text-sm text-gray-500">{fuel.percentage}%</p>
//                   </div>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
//                   <div
//                     className="h-full rounded-full"
//                     style={{
//                       width: `${fuel.percentage}%`,
//                       backgroundColor: fuel.color
//                     }}
//                   ></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div className="mt-6 pt-6 border-t border-gray-200">
//             <div className="flex justify-between items-center">
//               <span className="text-sm font-medium text-gray-600">Total Volume</span>
//               <span className="text-2xl font-bold text-gray-900">25,824 m³</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
//         <div className="bg-gradient-to-r from-[#4696dd] to-[#2563eb] p-6">
//           <h2 className="text-xl font-bold text-white">Regional Performance Scorecard</h2>
//         </div>
//         <div className="p-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
//             {regionalPerformance.map((region, index) => (
//               <div
//                 key={index}
//                 className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-5 border border-gray-200 hover:shadow-lg transition-all duration-300"
//               >
//                 <div className="flex items-center justify-between mb-3">
//                   <h3 className="font-bold text-gray-900">{region.region}</h3>
//                   {region.trend === 'up' ? (
//                     <TrendingUp className="w-5 h-5 text-green-500" />
//                   ) : (
//                     <TrendingDown className="w-5 h-5 text-red-500" />
//                   )}
//                 </div>
//                 <div className="mb-3">
//                   <p className="text-xs text-gray-500 mb-1">Performance Score</p>
//                   <p className="text-3xl font-bold text-[#4696dd]">{region.score}%</p>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
//                   <div
//                     className="bg-gradient-to-r from-[#4696dd] to-[#2563eb] h-full rounded-full"
//                     style={{ width: `${region.score}%` }}
//                   ></div>
//                 </div>
//                 <p className="text-sm text-gray-600">
//                   <span className="font-bold">{region.dispatches}</span> dispatches this month
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-lg border border-green-200 p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-bold text-gray-900">Best Performer</h3>
//             <TrendingUp className="w-6 h-6 text-green-600" />
//           </div>
//           <p className="text-3xl font-bold text-green-600 mb-2">Addis Ababa</p>
//           <p className="text-sm text-gray-600">95% on-time delivery rate</p>
//         </div>

//         <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg border border-blue-200 p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-bold text-gray-900">Most Active</h3>
//             <Activity className="w-6 h-6 text-blue-600" />
//           </div>
//           <p className="text-3xl font-bold text-blue-600 mb-2">OLA Energy</p>
//           <p className="text-sm text-gray-600">45 active vehicles in transit</p>
//         </div>

//         <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl shadow-lg border border-yellow-200 p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-bold text-gray-900">Efficiency Leader</h3>
//             <Calendar className="w-6 h-6 text-yellow-600" />
//           </div>
//           <p className="text-3xl font-bold text-yellow-600 mb-2">2.7 days</p>
//           <p className="text-sm text-gray-600">Average delivery time in June</p>
//         </div>
//       </div>
//     </div>
//   );
// }
