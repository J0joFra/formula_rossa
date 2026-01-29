import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Trophy, TrendingUp, Users, Calendar, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

// Historical Ferrari Data
const historicalData = [
  { year: 2015, wins: 3, podiums: 17, points: 428, position: 2, driver1: 'Vettel', driver2: 'Räikkönen' },
  { year: 2016, wins: 0, podiums: 11, points: 398, position: 3, driver1: 'Vettel', driver2: 'Räikkönen' },
  { year: 2017, wins: 5, podiums: 20, points: 522, position: 2, driver1: 'Vettel', driver2: 'Räikkönen' },
  { year: 2018, wins: 6, podiums: 19, points: 571, position: 2, driver1: 'Vettel', driver2: 'Räikkönen' },
  { year: 2019, wins: 3, podiums: 19, points: 504, position: 2, driver1: 'Vettel', driver2: 'Leclerc' },
  { year: 2020, wins: 0, podiums: 3, points: 131, position: 6, driver1: 'Vettel', driver2: 'Leclerc' },
  { year: 2021, wins: 0, podiums: 5, points: 323, position: 3, driver1: 'Sainz', driver2: 'Leclerc' },
  { year: 2022, wins: 4, podiums: 20, points: 554, position: 2, driver1: 'Sainz', driver2: 'Leclerc' },
  { year: 2023, wins: 1, podiums: 12, points: 406, position: 3, driver1: 'Sainz', driver2: 'Leclerc' },
  { year: 2024, wins: 5, podiums: 18, points: 652, position: 2, driver1: 'Sainz', driver2: 'Leclerc' },
];

const legendsData = [
  { name: 'M. Schumacher', wins: 72, titles: 5, years: '1996-2006' },
  { name: 'N. Lauda', wins: 15, titles: 2, years: '1974-1977' },
  { name: 'A. Ascari', wins: 11, titles: 2, years: '1950-1953' },
  { name: 'K. Räikkönen', wins: 10, titles: 1, years: '2007-2009, 2014-2018' },
  { name: 'S. Vettel', wins: 14, titles: 0, years: '2015-2020' },
  { name: 'C. Leclerc', wins: 7, titles: 0, years: '2019-presente' },
];

const COLORS = ['#DC0000', '#FF4444', '#FF6666', '#FF8888', '#FFAAAA', '#FFCCCC'];

export default function StatsSection() {
  return (
    <section>
      {/* contenuto */}
    </section>
  );
}
