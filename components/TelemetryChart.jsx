// components/TelemetryChart.jsx
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TelemetryChart({ driverNumber, dataType, liveData }) {
  const getChartData = () => {
    const history = liveData.telemetry?.[driverNumber] || [];
    const labels = history.map((_, i) => `-${history.length - i}s`);
    
    return {
      labels,
      datasets: [
        {
          label: dataType === 'speed' ? 'Velocità (km/h)' : 
                 dataType === 'throttle' ? 'Acceleratore %' : 
                 'Freno %',
          data: history.map(d => d[dataType]),
          borderColor: dataType === 'speed' ? '#ef4444' :
                      dataType === 'throttle' ? '#22c55e' : '#3b82f6',
          backgroundColor: dataType === 'speed' ? 'rgba(239, 68, 68, 0.1)' :
                          dataType === 'throttle' ? 'rgba(34, 197, 94, 0.1)' : 
                          'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        }
      ]
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.1)' },
        ticks: { color: 'white' }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'white' }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 h-[200px]">
      <h3 className="text-white font-bold mb-2 text-sm">
        {dataType === 'speed' ? 'Velocità' : 
         dataType === 'throttle' ? 'Acceleratore' : 'Freno'}
      </h3>
      <Line data={getChartData()} options={options} />
    </div>
  );
}