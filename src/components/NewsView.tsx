/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Clock, RefreshCw, AlertTriangle, TrendingUp, Filter, ChevronRight, Globe } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { NewsArticle } from '../types.ts';

const CATEGORIES = ['Trending', 'Markets', 'Technology', 'Earnings', 'Economy'];
const SPECIFIC_CATEGORIES = ['Markets', 'Technology', 'Earnings', 'Economy'];

const NewsView = () => {
  const { marketContext } = usePortfolio();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categoryHighlights, setCategoryHighlights] = useState<Record<string, NewsArticle>>({});
  const [loading, setLoading] = useState(true);
  const [loadingHighlights, setLoadingHighlights] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('Trending');

  const isIndia = marketContext === 'IN';
  const regionTag = isIndia ? 'IN' : 'US';

  const fetchHighlights = async () => {
    setLoadingHighlights(true);
    try {
      const promises = SPECIFIC_CATEGORIES.map(async (cat) => {
        const query = isIndia ? `India ${cat} market` : `US ${cat} Wall Street market`;
        const response = await fetch(`/api/news?q=${encodeURIComponent(query)}&region=${regionTag}&count=1`);
        if (!response.ok) return { category: cat, article: null };
        const data = await response.json();
        return { category: cat, article: data[0] || null };
      });
      
      const results = await Promise.all(promises);
      const highlightsObj: Record<string, NewsArticle> = {};
      results.forEach(res => {
        if (res.article) highlightsObj[res.category] = res.article;
      });
      setCategoryHighlights(highlightsObj);
    } catch (err) {
      console.error("Failed to fetch highlights", err);
    } finally {
      setLoadingHighlights(false);
    }
  };

  const fetchNews = async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      let query = '';
      if (isIndia) {
        query = category === 'Trending' ? 'Indian stock market NSE BSE' : `India ${category} stock market`;
      } else {
        query = category === 'Trending' ? 'US stock market Wall Street S&P 500' : `US ${category} Wall Street`;
      }
      const response = await fetch(`/api/news?q=${encodeURIComponent(query)}&region=${regionTag}&count=25`);
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
    fetchHighlights();
  }, [activeCategory, marketContext]);

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
    <div className="space-y-8 min-h-screen">
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl md:text-5xl vibrant-heading text-text-main flex items-center gap-3">
                <Newspaper className="text-primary hidden md:block" size={36} />
                In the News
              </h2>
            </div>
            <p className="text-text-muted mt-2 text-sm font-medium tracking-wide flex items-center gap-1.5">
              <span>{isIndia ? '🇮🇳 Indian Market Focus: Dalal Street, NSE & BSE headlines' : '🇺🇸 U.S. Market Focus: Wall Street, S&P 500 & Nasdaq headlines'}</span>
            </p>
          </div>
          <button 
            onClick={() => {
              fetchNews(activeCategory);
              if (activeCategory === 'Trending') fetchHighlights();
            }}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-ui-border bg-ui-surface hover:bg-ui-surface-hover text-xs font-bold text-text-main transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-primary' : 'text-primary'} />
            {loading ? 'Updating...' : 'Refresh Feed'}
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-2 border-b border-ui-border">
          <div className="flex items-center justify-center pl-2 pr-4 border-r border-ui-border mr-2">
             <Filter size={14} className="text-text-muted" />
          </div>
          {CATEGORIES.map((category, cIdx) => (
            <button
              key={`${category}-${cIdx}`}
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

      {/* Latest Trending News by Category (Only visible on Trending tab) */}
      {activeCategory === 'Trending' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-text-main">Top Trending by Category</h3>
            <div className="h-[1px] flex-1 bg-ui-border ml-4"></div>
          </div>
          
          {loadingHighlights ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse h-32 rounded-2xl bg-ui-surface border border-ui-border p-4 flex flex-col justify-between">
                  <div className="h-3 w-1/3 bg-text-muted/20 rounded"></div>
                  <div className="space-y-2 mt-2">
                    <div className="h-3 bg-text-muted/20 rounded"></div>
                    <div className="h-3 bg-text-muted/20 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SPECIFIC_CATEGORIES.map((category, scIdx) => {
                const article = categoryHighlights[category];
                if (!article) return null;
                
                return (
                  <a 
                    key={`${category}-${scIdx}`}
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col justify-between p-4 rounded-2xl bg-ui-surface border border-ui-border hover:border-primary/40 hover:bg-ui-surface-hover transition-all shadow-sm hover:shadow-md relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink size={14} className="text-primary" />
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary-dark bg-primary/10 px-2 py-1 rounded-md inline-block mb-2">
                        {category}
                      </span>
                      <h4 className="text-sm font-bold text-text-main group-hover:text-primary transition-colors line-clamp-3 leading-snug">
                        {article.title}
                      </h4>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-ui-border/50">
                      <span className="text-[9px] font-bold text-text-muted truncate max-w-[100px]">
                        {article.publisher}
                      </span>
                      <span className="text-[9px] text-text-muted flex items-center gap-1 font-mono">
                        <Clock size={10} />
                        {formatTime(article.providerPublishTime)}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}

      {error ? (
        <div className="p-8 border border-negative/30 bg-negative/5 rounded-2xl flex flex-col items-center justify-center text-center">
          <AlertTriangle size={32} className="text-negative mb-4" />
          <p className="text-text-main font-bold mb-2">Failed to load news feed</p>
          <p className="text-text-muted text-sm">{error}</p>
        </div>
      ) : loading && articles.length === 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-bold text-text-main">Feed</h3>
          </div>
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
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-text-main">{activeCategory === 'Trending' ? 'General Feed' : `${activeCategory} Feed`}</h3>
          </div>
          <div className="grid gap-4">
            {articles.map((article, idx) => (
              <a
                key={article.uuid ? `${article.uuid}-${idx}` : `article-${idx}`}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col-reverse sm:flex-row gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl border border-ui-border bg-ui-surface hover:border-primary/30 hover:bg-ui-surface-hover transition-all duration-300 shadow-sm hover:shadow-md ${
                  idx === 0 && activeCategory !== 'Trending' ? 'sm:flex-col-reverse md:flex-row md:items-center' : ''
                }`}
              >
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary-dark bg-primary/10 px-2 py-0.5 rounded-sm">
                        {article.publisher}
                      </span>
                      <span className="text-[10px] text-text-muted flex items-center gap-1 font-mono">
                        <Clock size={10} />
                        {formatTime(article.providerPublishTime)}
                      </span>
                    </div>
                    <h3 className={`font-serif font-black text-text-main group-hover:text-primary transition-colors leading-snug ${
                      idx === 0 && activeCategory !== 'Trending' ? 'text-xl sm:text-2xl lg:text-3xl' : 'text-lg sm:text-xl'
                    }`}>
                      {article.title}
                    </h3>
                  </div>
                  
                  {article.relatedTickers && article.relatedTickers.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {article.relatedTickers.slice(0, 4).map((ticker, tIdx) => (
                        <span key={`${ticker}-${tIdx}`} className="text-[9px] font-mono font-bold text-text-muted border border-ui-border px-1.5 py-0.5 rounded bg-ui-bg">
                          {ticker}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {article.thumbnail?.resolutions && article.thumbnail.resolutions.length > 0 && (
                  <div className={`shrink-0 overflow-hidden rounded-xl bg-ui-bg ${
                    idx === 0 && activeCategory !== 'Trending' ? 'w-full sm:w-full md:w-1/3 aspect-video md:aspect-[4/3]' : 'w-full sm:w-32 lg:w-48 aspect-video'
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
        </div>
      )}
    </div>
  );
};

export default NewsView;
