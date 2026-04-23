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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-4xl font-black text-indigo-950 tracking-tighter italic">Order History</h2>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Full Transaction Metadata Tracking</p>
      </header>

      <div className="vibrant-card overflow-hidden bg-white">
        {transactions.length === 0 ? (
          <div className="py-40 text-center flex flex-col items-center opacity-20">
            <HistoryIcon size={64} className="text-indigo-900 mb-4" />
            <p className="text-xs font-black uppercase tracking-[0.2em]">Transaction Registry Empty</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-ui-border">
                <th className="px-8 py-5 font-black text-center w-24">Event</th>
                <th className="px-8 py-5 font-black">Contract</th>
                <th className="px-8 py-5 font-black text-center">Volume</th>
                <th className="px-8 py-5 font-black">Execution</th>
                <th className="px-8 py-5 font-black">Net Amount</th>
                <th className="px-8 py-5 font-black text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="group hover:bg-indigo-50/30 transition-all cursor-default">
                  <td className="px-8 py-6">
                    <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center shadow-sm ${tx.type === 'BUY' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {tx.type === 'BUY' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-indigo-950 tracking-tight">{tx.symbol}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Equity Order</p>
                  </td>
                  <td className="px-8 py-6 text-center font-mono font-black italic tracking-tighter text-slate-900 text-lg">{tx.shares}</td>
                  <td className="px-8 py-6 font-mono font-black italic tracking-tighter text-slate-900 text-lg">${tx.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-8 py-6">
                    <p className="font-mono font-black italic tracking-tighter text-indigo-600 text-lg underline decoration-2 decoration-indigo-100 underline-offset-4">
                      ${(tx.shares * tx.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className="text-[10px] font-black text-slate-900 uppercase">{new Date(tx.timestamp).toLocaleDateString()}</p>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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
