import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Clock, Zap, Radio, Map as MapIcon, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import LiveTiming from '../components/LiveTiming';

export default function LiveTimingPage() {
  return (
    <>
      <Head>
        <title>Live Timing F1 | Formula Rossa</title>
        <meta name="description" content="Segui la classifica in tempo reale, telemetria e team radio della Formula 1. Dati live dalla Scuderia Ferrari e non solo." />
        <meta property="og:title" content="Live Timing F1 | Formula Rossa" />
        <meta property="og:description" content="Classifica live, telemetria e team radio in tempo reale" />
      </Head>
      
      <LiveTiming />
    </>
  );
}