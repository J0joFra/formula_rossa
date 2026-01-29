import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Trophy, TrendingUp, Users, Calendar, ChevronRight } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('panoramica');

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-ferrari-yellow" />
            <h2 className="text-4xl font-bold text-white">Statistiche & Storici</h2>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Esplora i dati delle ultime stagioni e le leggende che hanno reso grande la Scuderia
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { value: '27', label: 'Vittorie (2015-2024)', icon: Trophy, color: 'bg-ferrari-red' },
            { value: '144', label: 'Podi Totali', icon: TrendingUp, color: 'bg-ferrari-yellow' },
            { value: '449', label: 'Media Punti/Anno', icon: Users, color: 'bg-ferrari-red' },
            { value: '15', label: 'Piloti Campioni', icon: Calendar, color: 'bg-ferrari-yellow' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 text-center"
            >
              <div className={`inline-flex p-3 rounded-xl ${stat.color} mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
          <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-4 mb-6">
            {['panoramica', 'vittorie', 'leggende', 'evoluzione', 'posizione'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium capitalize ${
                  activeTab === tab
                    ? 'bg-ferrari-red text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'panoramica' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Vittorie e Podi per Stagione</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={historicalData}>
                        <XAxis dataKey="year" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
                        />
                        <Bar dataKey="wins" fill="#DC0000" name="Vittorie" />
                        <Bar dataKey="podiums" fill="#FFD700" name="Podi" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Distribuzione Vittorie</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={legendsData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, wins }) => `${name}: ${wins}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="wins"
                        >
                          {legendsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'evoluzione' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Evoluzione Punti</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData}>
                      <XAxis dataKey="year" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
                      />
                      <Line type="monotone" dataKey="points" stroke="#DC0000" strokeWidth={3} dot={{ fill: '#DC0000' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'leggende' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {legendsData.map((legend, index) => (
                  <div key={index} className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-ferrari-red to-red-700 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-white">{legend.name.split(' ')[1][0]}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{legend.name}</h4>
                        <p className="text-sm text-gray-400">{legend.years}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-ferrari-red">{legend.wins}</div>
                        <div className="text-sm text-gray-400">Vittorie</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-ferrari-yellow">{legend.titles}</div>
                        <div className="text-sm text-gray-400">Titoli</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}