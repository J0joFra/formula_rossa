// components/LiveTimingTable.jsx
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function LiveTimingTable({ data, drivers }) {
  const [sortField, setSortField] = useState('position');
  const [sortDirection, setSortDirection] = useState('asc');

  const sortedData = [...(data || [])].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField] > b[sortField] ? 1 : -1;
    }
    return a[sortField] < b[sortField] ? 1 : -1;
  });

  const toggleSort = (field) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-800/50">
            <tr className="text-gray-400 text-xs uppercase">
              {['Pos', 'Driver', 'Team', 'Gap', 'Interval', 'Ultimo Giro', 'Pneumatici'].map((header, i) => (
                <th 
                  key={i} 
                  className="px-4 py-3 font-medium cursor-pointer hover:text-white"
                  onClick={() => toggleSort(header.toLowerCase())}
                >
                  <div className="flex items-center gap-1">
                    {header}
                    <SortIcon field={header.toLowerCase()} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {sortedData.map((driver, i) => {
              const driverInfo = drivers.find(d => d.driver_number === driver.driver_number);
              
              return (
                <tr 
                  key={i}
                  className="hover:bg-gray-800/50 transition-colors group"
                >
                  <td className="px-4 py-3 font-bold text-white">
                    {driver.position}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-1 h-8 rounded-full"
                        style={{ backgroundColor: `#${driverInfo?.team_colour || '666'}` }}
                      />
                      <div>
                        <div className="font-bold text-white">
                          {driverInfo?.name_acronym || driver.driver_number}
                        </div>
                        <div className="text-xs text-gray-500">
                          {driverInfo?.full_name?.split(' ').pop()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {driverInfo?.team_name || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 font-mono text-yellow-400">
                    {driver.gap_to_leader || 'LEADER'}
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-400">
                    {driver.interval || '-'}
                  </td>
                  <td className="px-4 py-3 font-mono text-green-400">
                    {driver.last_lap || '--:--.---'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                      driver.tyre_compound === 'SOFT' ? 'border-red-500 text-red-500' :
                      driver.tyre_compound === 'MEDIUM' ? 'border-yellow-500 text-yellow-500' :
                      'border-white text-white'
                    }`}>
                      {driver.tyre_compound?.[0] || '?'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}