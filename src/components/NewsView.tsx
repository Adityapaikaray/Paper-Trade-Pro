/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Clock, RefreshCw, AlertTriangle, TrendingUp, Filter } from 'lucide-react';
import { NewsArticle } from '../types.ts';

const CATEGORIES = ['Trending', 'Markets', 'Technology', 'Earnings', 'Economy'];

const NewsView = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('Trending');

  const fetchNews = async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = category === 'Trending' ? 'finance' : `${category} market`;
      const response = await fetch(`/api/news?q=${encodeURIComponent(query)}&count=25`);
      if (!response.ok) throw new Error('Failed to fetch news');
      const data = await response.json();
      setArticles(data || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching news.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(activeCategory);
  }, [activeCategory]);

  const formatTime = (unixTime: number) => {
    const date = new Date(unixTime * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-8  min-h-screen">
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl md:text-5xl vibrant-heading text-text-main flex items-center gap-3">
                <Newspaper className="text-gold hidden md:block" size={36} />
                In the News
              </h2>
            </div>
            <p className="text-text-muted mt-2 text-sm font-medium tracking-wide">
              Live market intelligence and trending financial headlines
            </p>
          </div>
          <button 
            onClick={() => fetchNews(activeCategory)}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-ui-border bg-ui-surface hover:bg-ui-surface-hover text-xs font-bold text-text-main transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-gold' : 'text-gold'} />
            {loading ? 'Updating...' : 'Refresh Feed'}
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-2 border-b border-ui-border">
          <div className="flex items-center justify-center pl-2 pr-4 border-r border-ui-border mr-2">
             <Filter size={14} className="text-text-muted" />
          </div>
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-text-main text-ui-bg'
                  : 'bg-ui-surface border border-ui-border text-text-muted hover:border-text-muted/50'
              }`}
            >
              {category === 'Trending' && <TrendingUp size={12} className="inline mr-1.5 -mt-0.5" />}
              {category}
            </button>
          ))}
        </div>
      </header>

      {error ? (
        <div className="p-8 border border-negative/30 bg-negative/5 rounded-2xl flex flex-col items-center justify-center text-center">
          <AlertTriangle size={32} className="text-negative mb-4" />
          <p className="text-text-main font-bold mb-2">Failed to load news feed</p>
          <p className="text-text-muted text-sm">{error}</p>
        </div>
      ) : loading && articles.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex gap-6 p-6 rounded-2xl border border-ui-border bg-ui-surface h-32">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-2 bg-text-muted/20 rounded w-3/4"></div>
                <div className="space-y-3">
                  <div className="h-2 bg-text-muted/20 rounded"></div>
                  <div className="h-2 bg-text-muted/20 rounded w-5/6"></div>
                </div>
              </div>
              <div className="w-32 h-20 bg-text-muted/20 rounded-xl hidden sm:block"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {articles.map((article, idx) => (
            <a
              key={article.uuid}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-col-reverse sm:flex-row gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl border border-ui-border bg-ui-surface hover:border-gold/30 hover:bg-ui-surface-hover transition-all duration-300 shadow-sm hover:shadow-md ${
                idx === 0 ? 'sm:flex-col-reverse md:flex-row md:items-center' : ''
              }`}
            >
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gold-dark bg-gold/10 px-2 py-0.5 rounded-sm">
                      {article.publisher}
                    </span>
                    <span className="text-[10px] text-text-muted flex items-center gap-1 font-mono">
                      <Clock size={10} />
                      {formatTime(article.providerPublishTime)}
                    </span>
                  </div>
                  <h3 className={`font-serif font-black text-text-main group-hover:text-gold transition-colors leading-snug ${
                    idx === 0 ? 'text-xl sm:text-2xl lg:text-3xl' : 'text-lg sm:text-xl'
                  }`}>
                    {article.title}
                  </h3>
                </div>
                
                {article.relatedTickers && article.relatedTickers.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {article.relatedTickers.slice(0, 4).map(ticker => (
                      <span key={ticker} className="text-[9px] font-mono font-bold text-text-muted border border-ui-border px-1.5 py-0.5 rounded bg-ui-bg">
                        {ticker}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {article.thumbnail?.resolutions && article.thumbnail.resolutions.length > 0 && (
                <div className={`shrink-0 overflow-hidden rounded-xl bg-ui-bg ${
                  idx === 0 ? 'w-full sm:w-full md:w-1/3 aspect-video md:aspect-[4/3]' : 'w-full sm:w-32 lg:w-48 aspect-video'
                }`}>
                  <img 
                    src={article.thumbnail.resolutions[0].url} 
                    alt="" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
              )}
              
              {/* Fallback empty block for flex alignment if no image */}
              {!(article.thumbnail?.resolutions && article.thumbnail.resolutions.length > 0) && (
                <div className="hidden sm:flex shrink-0 w-32 lg:w-48 aspect-video items-center justify-center bg-ui-bg rounded-xl border border-ui-border">
                  <Newspaper size={24} className="text-text-muted/30" />
                </div>
              )}
            </a>
          ))}
          
          {articles.length === 0 && !loading && (
             <div className="py-20 text-center text-text-muted flex flex-col items-center">
              <Newspaper size={40} className="mb-4 opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Trending News Found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsView;
