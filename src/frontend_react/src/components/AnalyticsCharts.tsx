import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import ChartCard from './ChartCard';
import RetentionCircle from './RetentionCircle';

// Registrar componentes de Chart.js localmente en este archivo
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

interface ChartData {
  labels: string[];
  values: number[];
}

interface AnalyticsChartsProps {
  upData: ChartData;
  plData: ChartData;
  amData: ChartData;
  mpData: ChartData;
  favData: ChartData;
  recData: ChartData;
  d1: number | null;
  d7: number | null;
  mode: string;
  islandCode: string;
}

const COPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(5,8,16,.95)',
      titleColor: '#00D4FF',
      bodyColor: '#C8D8F0',
      borderColor: 'rgba(0,212,255,.3)',
      borderWidth: 1,
      titleFont: { family: 'Orbitron', size: 11 },
      bodyFont: { family: 'Rajdhani', size: 13 }
    }
  },
  scales: {
    x: { 
      type: 'category' as const,
      grid: { color: 'rgba(0,212,255,.05)' }, 
      ticks: { color: 'rgba(200,216,240,.42)', font: { size: 10 }, maxRotation: 45 } 
    },
    y: { 
      type: 'linear' as const,
      grid: { color: 'rgba(0,212,255,.05)' }, 
      ticks: { color: 'rgba(200,216,240,.42)', font: { size: 10 } }, 
      beginAtZero: true 
    }
  }
};

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  upData, plData, amData, mpData, favData, recData, d1, d7, mode, islandCode
}) => {
  // Usar una key que cambie con los datos para forzar el remonte completo del componente de gráficos
  const chartKey = `${islandCode}-${mode}-${upData.values.length}-${plData.values.length}`;

  return (
    <section className="charts wrap" key={chartKey}>
      <ChartCard title="Jugadores Únicos" subtitle="Jugadores distintos por período" dotColor="blue" isFull isTall noData={upData.values.length === 0} noDataIcon="👥">
        <Line 
          redraw={true}
          data={{
            labels: upData.labels,
            datasets: [{
              data: upData.values,
              borderColor: '#00D4FF',
              backgroundColor: 'rgba(0,212,255,0.1)',
              fill: true,
              tension: 0.4,
              pointRadius: upData.values.length <= 14 ? 5 : 2,
              pointBackgroundColor: '#00D4FF',
              borderWidth: 2
            }]
          }}
          options={COPTS}
        />
      </ChartCard>

      <ChartCard title="Partidas Jugadas" subtitle="Total de sesiones iniciadas" dotColor="gold" noData={plData.values.length === 0} noDataIcon="🎮">
        <Bar 
          redraw={true}
          data={{
            labels: plData.labels,
            datasets: [{
              data: plData.values,
              borderColor: '#FFD700',
              backgroundColor: 'rgba(255,215,0,0.2)',
              borderWidth: 1,
              borderRadius: 5
            }]
          }}
          options={COPTS}
        />
      </ChartCard>

      <ChartCard title="Minutos Promedio / Jugador" subtitle="Duración media de sesión" dotColor="purple" noData={amData.values.length === 0} noDataIcon="⏱️">
        <Line 
          redraw={true}
          data={{
            labels: amData.labels,
            datasets: [{
              data: amData.values,
              borderColor: '#9B59B6',
              backgroundColor: 'rgba(155,89,182,0.12)',
              fill: true,
              tension: 0.4,
              pointRadius: amData.values.length <= 14 ? 5 : 2,
              pointBackgroundColor: '#9B59B6',
              borderWidth: 2
            }]
          }}
          options={COPTS}
        />
      </ChartCard>

      <ChartCard title="Minutos Totales Jugados" subtitle="Suma de tiempo jugado en la isla" dotColor="green" noData={mpData.values.length === 0} noDataIcon="🕐">
        <Bar 
          redraw={true}
          data={{
            labels: mpData.labels,
            datasets: [{
              data: mpData.values,
              borderColor: '#4ECDC4',
              backgroundColor: 'rgba(78,205,196,0.18)',
              borderWidth: 1,
              borderRadius: 5
            }]
          }}
          options={COPTS}
        />
      </ChartCard>

      <ChartCard title="Favoritos & Recomendaciones" subtitle="Interacción social con la isla" dotColor="orange" noData={favData.values.length === 0 && recData.values.length === 0} noDataIcon="❤️">
        <Bar 
          redraw={true}
          data={{
            labels: favData.labels.length >= recData.labels.length ? favData.labels : recData.labels,
            datasets: [
              { label: 'Favoritos', data: favData.values, backgroundColor: 'rgba(255,107,157,0.3)', borderColor: '#FF6B9D', borderWidth: 1, borderRadius: 5 },
              { label: 'Recomendaciones', data: recData.values, backgroundColor: 'rgba(255,140,66,0.3)', borderColor: '#FF8C42', borderWidth: 1, borderRadius: 5 }
            ]
          }}
          options={{
            ...COPTS,
            plugins: {
              ...COPTS.plugins,
              legend: { display: true, labels: { color: 'rgba(200,216,240,0.55)', font: { family: 'Rajdhani', size: 12 } } }
            }
          }}
        />
      </ChartCard>

      <ChartCard title="Retención de Jugadores" subtitle="% que regresa al día 1 y día 7" dotColor="blue">
        <div className="ret-row">
          <RetentionCircle label="Retención D1" subLabel="DÍA 1" value={d1} colorClass="d1" />
          <RetentionCircle label="Retención D7" subLabel="DÍA 7" value={d7} colorClass="d7" />
        </div>
      </ChartCard>
    </section>
  );
};

export default AnalyticsCharts;