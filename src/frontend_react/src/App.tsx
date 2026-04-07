/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import ControlPanel from './components/ControlPanel';
import IslandHeader from './components/IslandHeader';
import KpiGrid from './components/KpiGrid';
import AnalyticsCharts from './components/AnalyticsCharts';
import { useIslandAnalytics } from './hooks/useIslandAnalytics';
import {
  fmt, sumArr, avgArr, maxArr, lastD, extract
} from './utils/formatters';

const getInitialDates = () => {
  const now = new Date();
  const minus7 = new Date();
  minus7.setDate(now.getDate() - 7);
  return {
    to: now.toISOString().slice(0, 10),
    timeTo: now.toTimeString().slice(0, 5),
    from: minus7.toISOString().slice(0, 10),
    timeFrom: '00:00'
  };
};


const App: React.FC = () => {
  const MY_DEFAULT_ISLAND = '5795-7018-7160';
  
  const params = new URLSearchParams(window.location.search);
  const islandCode = (params.get('id') ? params.get('id') : MY_DEFAULT_ISLAND) as string;
  
  
  const [mode, setMode] = useState<'day' | 'hour' | 'minute'>('day');
  
  const init = getInitialDates();
  const [dateFrom, setDateFrom] = useState(init.from);
  const [timeFrom, setTimeFrom] = useState(init.timeFrom);
  const [dateTo, setDateTo] = useState(init.to);
  const [timeTo, setTimeTo] = useState(init.timeTo);
  
  const { data, islandMetadata, loading, error, fetchAnalytics } = useIslandAnalytics();
  console.log(islandMetadata)

  useEffect(() => {
    const now = new Date();
    const minus7 = new Date();
    minus7.setDate(now.getDate() - 7);

    setDateTo(now.toISOString().slice(0, 10));
    setTimeTo(now.toTimeString().slice(0, 5));
    setDateFrom(minus7.toISOString().slice(0, 10));
    setTimeFrom('00:00');
  }, []);

  const toISO = (dateStr: string, timeStr: string) => {
    if (!dateStr) return '';
    const t = timeStr || '00:00';
    return `${dateStr}T${t.length === 5 ? t + ':00.000Z' : t}`;
  };

  useEffect(() => {
    if (islandCode) {
      handleFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleFetch = () => {
    if (!islandCode) return;

    const fromStr = toISO(dateFrom, timeFrom);
    const toStr = toISO(dateTo, timeTo);
    fetchAnalytics(islandCode, mode, fromStr, toStr);
  };

  const buildUrlPreview = () => {
    if (!islandCode) return '—';
    const base = 'https://api.fortnite.com/ecosystem/v1';
    return `${base}/islands/${islandCode}/metrics/${mode}?from=${encodeURIComponent(toISO(dateFrom, timeFrom))}&to=${encodeURIComponent(toISO(dateTo, timeTo))}`;
  };

  // Metrics calculation
  const totalUnique = sumArr(data?.uniquePlayers);
  const totalPlays = sumArr(data?.plays);
  const totalMins = sumArr(data?.minutesPlayed);
  const avgMin = avgArr(data?.averageMinutesPerPlayer);
  const maxCcu = maxArr(data?.peakCCU);
  const totalFavs = sumArr(data?.favorites);
  const totalRecs = sumArr(data?.recommendations);
  const d1 = lastD(data?.retention, 'd1');
  const d7 = lastD(data?.retention, 'd7');

  return (
    <div className="wrap font-rajdhani">
      <NavBar />

      <ControlPanel
        mode={mode} setMode={setMode}
        dateFrom={dateFrom} setDateFrom={setDateFrom}
        timeFrom={timeFrom} setTimeFrom={setTimeFrom}
        dateTo={dateTo} setDateTo={setDateTo}
        timeTo={timeTo} setTimeTo={setTimeTo}
        onFetch={handleFetch}
        loading={loading}
        urlPreview={buildUrlPreview()}
      />

      <div className={`text-center mt-3.5 min-h-6 text-[0.88rem] ${error ? 'text-[#FF6B6B]' : loading ? 'text-blue-neon animate-pulse' : 'text-[#4ECDC4]'}`}>
        {loading ? '⟳ Consultando API...' : error ? `✗ ${error}` : data ? `✓ Datos cargados · ${new Date().toLocaleTimeString('es-AR')}` : ''}
      </div>

      {data && (
        <>
          <IslandHeader
            islandCode={islandCode}
            metadata={islandMetadata}
            mode={mode}
            dateFrom={dateFrom}
            dateTo={dateTo}
            maxCcu={maxCcu}
            fmt={fmt}
          />

          <KpiGrid
            totalUnique={totalUnique}
            totalPlays={totalPlays}
            totalMins={totalMins}
            avgMin={avgMin}
            maxCcu={maxCcu}
            totalFavs={totalFavs}
            totalRecs={totalRecs}
            d1={d1}
            d7={d7}
          />

          <AnalyticsCharts
            upData={extract(data?.uniquePlayers as any, mode)}
            plData={extract(data?.plays as any, mode)}
            amData={extract(data?.averageMinutesPerPlayer as any, mode)}
            mpData={extract(data?.minutesPlayed as any, mode)}
            favData={extract(data?.favorites as any, mode)}
            recData={extract(data?.recommendations as any, mode)}
            d1={d1}
            d7={d7}
            mode={mode}
            islandCode={islandCode}
          />
        </>
      )}

      {!data && !loading && (
        <section className="text-center py-20 px-5 text-[#c8d8f029]">
          <div className="text-[72px] mb-4.5 opacity-[0.22]">🏝️</div>
          <h2 className="font-orbitron text-base tracking-[4px] mb-2">Introduce un código de isla</h2>
          <p className="text-[0.85rem] tracking-wide">Ingresa el código de tu isla para ver las métricas en tiempo real</p>
        </section>
      )}
    </div>
  );
};

export default App;