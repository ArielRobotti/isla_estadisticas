/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import NavBar from './components/NavBar';
import RedeemCoupon from './components/RedeemCoupon';
import ControlPanel from './components/ControlPanel';
import IslandHeader from './components/IslandHeader';
import KpiGrid from './components/KpiGrid';
import AnalyticsCharts from './components/AnalyticsCharts';
import { useIslandAnalytics } from './hooks/useIslandAnalytics';
import {
  fmt, sumArr, avgArr, maxArr, lastD, extract
} from './utils/formatters';

// const getInitialDates = () => {
//   const now = new Date();
//   const minus7 = new Date();
//   minus7.setDate(now.getDate() - 7);
//   return {
//     to: now.toISOString().slice(0, 10),
//     timeTo: now.toTimeString().slice(0, 5),
//     from: minus7.toISOString().slice(0, 10),
//     timeFrom: '00:00'
//   };
// };

const getInitialDates = () => {
  const now = new Date();
  
  // Creamos la fecha "desde" basada en el tiempo UTC actual
  // Restamos 7 días pero asegurándonos de no pasarnos del límite de Epic
  const fromDate = new Date(now.getTime());
  fromDate.getUTCDate(); // Forzamos contexto UTC
  fromDate.setUTCDate(now.getUTCDate() - 7);


  return {
    to: now.toLocaleDateString('en-CA'), // "2026-04-07" (Local para el input)
    timeTo: now.toTimeString().slice(0, 5),
    from: fromDate.toISOString().slice(0, 10), // "2026-04-01" (UTC para el límite)
    timeFrom: '00:01' // Margen de seguridad
  };
};

const App: React.FC = () => {
  const MY_DEFAULT_ISLAND = '5795-7018-7160'; //5850-4984-2482
  
  const params = new URLSearchParams(window.location.search);
  const islandCode = (params.get('id') ? params.get('id') : MY_DEFAULT_ISLAND) as string;
  
  
  const [mode, setMode] = useState<'day' | 'hour' | 'minute'>('day');
  
  const init = getInitialDates();
  const [dateFrom, setDateFrom] = useState(init.from);
  const [timeFrom, setTimeFrom] = useState(init.timeFrom);
  const [dateTo, setDateTo] = useState(init.to);
  const [timeTo, setTimeTo] = useState(init.timeTo);

  const { data, islandMetadata, loading, error, fetchAnalytics } = useIslandAnalytics();

  const toISO = (dateStr: string, timeStr: string) => {
    if (!dateStr) return '';
    const t = timeStr || '00:00';
    return `${dateStr}T${t.length === 5 ? t + ':00.000Z' : t}`;
  };


  const handleFetch = useCallback(() => {
    if (!islandCode || !dateFrom || !dateTo) return;

    const fromStr = toISO(dateFrom, timeFrom);
    const toStr = toISO(dateTo, timeTo);
    
    console.log("Iniciando Fetch:", { mode, fromStr, toStr });
    fetchAnalytics(islandCode, mode, fromStr, toStr);
  }, [islandCode, mode, dateFrom, dateTo, timeFrom, timeTo, fetchAnalytics]);


  useEffect(() => {
    if (islandCode && dateFrom && dateTo) {
      const fromStr = toISO(dateFrom, timeFrom);
      const toStr = toISO(dateTo, timeTo);
      
      fetchAnalytics(islandCode, mode, fromStr, toStr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [islandCode, mode, dateFrom, dateTo, timeFrom, timeTo]);

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
    <div className="w-full font-rajdhani">
      <NavBar />
      <RedeemCoupon />

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

      <div className={`mx-20 text-center mt-3.5 min-h-6 text-[0.88rem] ${error ? 'text-[#FF6B6B]' : loading ? 'text-blue-neon animate-pulse' : 'text-[#4ECDC4]'}`}>
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
    </div>
  );
};

export default App;