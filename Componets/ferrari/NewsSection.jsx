import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Clock, Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';

export default function NewsSection() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Sei un giornalista sportivo esperto di Formula 1. Genera 6 notizie recenti e realistiche riguardanti la Scuderia Ferrari per la stagione 2025.

Le notizie devono includere:
- Notizie sulla nuova partnership Ferrari-Hamilton
- Sviluppi tecnici della monoposto
- Dichiarazioni di Leclerc o Hamilton
- Strategie e preparazione per le gare
- Rumors e speculazioni sul team
- Confronti con altri team

Ogni notizia deve avere:
- Titolo accattivante in italiano
- Breve descrizione (2-3 frasi)
- Categoria (tecnica, piloti, team, rumors)
- Data recente fittizia ma plausibile (formato: DD MMM 2025)

Rendi le notizie realistiche e credibili.`,
