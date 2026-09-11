/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { History as HistoryIcon, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';

const HistoryView: React.FC = () => {
  const { profile } = usePortfolio();

  const transactions = profile.transactions;

  return (
    <div className="space-y-12 ">
      <header>
        <h2 className="text-5xl vibrant-heading gold-gradient-text italic">Audit Ledger</h2>
        <p className="text-text-muted font-bold uppercase text-[9px] tracking-[0.3em] mt-2">Immutable Transaction Metadata Surveillance</p>
      </header>

      <div className="vibrant-card overflow-hidden">
        {transactions.length === 0 ? (
          <div className="py-48 text-center flex flex-col items-center opacity-10">
            <HistoryIcon size={80} className="text-gold mb-6" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Historical Void Registered</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-ui-bg/50 text-[9px] font-black text-text-muted uppercase tracking-[0.3em] border-b border-ui-border">
                <th className="px-10 py-6 font-black text-center w-28">Event</th>
                <th className="px-10 py-6 font-black">Contract</th>
                <th className="px-10 py-6 font-black text-center">Volume</th>
                <th className="px-10 py-6 font-black">Execution</th>
                <th className="px-10 py-6 font-black">Net Proceeds</th>
                <th className="px-10 py-6 font-black text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ui-border">
              {transactions.map((tx) => (
                <tr key={tx.id} className="group hover:bg-ui-surface transition-all cursor-default">
                  <td className="px-10 py-8">
                    <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center shadow-2xl ${tx.type === 'BUY' ? 'bg-gold/10 text-gold-light border border-gold/30' : 'bg-ui-surface text-text-muted border border-ui-border'}`}>
                      {tx.type === 'BUY' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="font-serif italic text-text-dark text-xl tracking-tight italic">{tx.symbol}</p>
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] leading-none mt-1.5">Asset protocol order</p>
                  </td>
                  <td className="px-10 py-8 text-center font-mono font-black italic tracking-tighter text-text-main text-xl">{tx.shares}</td>
                  <td className="px-10 py-8 font-mono font-black italic tracking-tighter text-text-main text-xl">${tx.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-10 py-8">
                    <p className="font-mono font-black italic tracking-tighter text-gold-light text-xl">
                      ${(tx.shares * tx.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <p className="text-[11px] font-black text-text-dark uppercase tracking-wide">{new Date(tx.timestamp).toLocaleDateString()}</p>
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mt-1.5 font-mono">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
