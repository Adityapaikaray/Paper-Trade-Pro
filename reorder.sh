#!/bin/bash

# Top part up to end of Chart (line 333)
head -n 333 current_futurewealth.txt > new_layout.tsx

echo '        </div>' >> new_layout.tsx
echo '        {/* UPPER RIGHT: Inputs */}' >> new_layout.tsx
echo '        <div className="w-full xl:w-[32%] shrink-0 flex flex-col gap-4">' >> new_layout.tsx

# Projection details (lines 455 to 574)
sed -n '455,574p' current_futurewealth.txt >> new_layout.tsx

echo '        </div>' >> new_layout.tsx
echo '      </div>' >> new_layout.tsx
echo '      {/* LOWER DASHBOARD */}' >> new_layout.tsx
echo '      <div className="flex flex-col xl:flex-row gap-4">' >> new_layout.tsx
echo '        {/* LOWER LEFT: Summary, Breakdown, Recent Activity */}' >> new_layout.tsx
echo '        <div className="flex-1 w-full xl:w-[68%] min-w-0 flex flex-col gap-3">' >> new_layout.tsx

# Summary Cards + Projection Breakdown (lines 334 to 450)
sed -n '334,450p' current_futurewealth.txt >> new_layout.tsx

# ADD RECENT ACTIVITY HERE
cat << 'ACTIVITY' >> new_layout.tsx
          {/* Recent Activity */}
          <div className="bg-ui-bg border border-ui-border rounded-xl p-3 shadow-sm mt-2">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[10px] font-bold text-text-main uppercase tracking-widest">Recent Activity</h3>
              <button 
                onClick={() => navigate('transactions')}
                className="text-[9px] font-bold text-text-muted hover:text-primary transition-colors flex items-center gap-1 uppercase tracking-wider">
                View All <ArrowRight size={12} />
              </button>
            </div>
            
            <div className="space-y-2">
              {profile.transactions && profile.transactions.length > 0 ? (
                profile.transactions.slice(0, 3).map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-ui-surface border border-ui-border rounded-lg hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-ui-bg border border-ui-border flex items-center justify-center shadow-sm shrink-0">
                        {activity.type === 'BUY' ? <ArrowUpRight size={14} className="text-primary" /> : <TrendingUp size={14} className="text-positive" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-text-main truncate capitalize">{activity.type.toLowerCase()} {activity.symbol}</p>
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5 truncate">
                          {activity.type === 'BUY' ? 'Investment' : 'Withdrawal'} • {new Date(activity.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <p className={`text-[11px] font-mono font-bold ${activity.type === 'SELL' ? 'text-positive' : 'text-text-main'}`}>
                        {activity.type === 'SELL' ? '+' : ''}{formatCompactCurrency(activity.shares * activity.price)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center">
                  <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase mb-2">No recent activity</p>
                  <p className="text-[9px] text-text-muted/60 mb-3 max-w-[200px] mx-auto">Your latest investments and transactions will appear here.</p>
                  <button onClick={() => navigate('transactions')} className="text-[9px] bg-ui-surface border border-ui-border py-1.5 px-3 rounded-lg text-text-main font-bold uppercase tracking-wider hover:text-primary transition-colors">
                    View Transactions
                  </button>
                </div>
              )}
            </div>
          </div>
ACTIVITY

echo '        </div>' >> new_layout.tsx
echo '        {/* LOWER RIGHT: Value, Insights, Quick Actions */}' >> new_layout.tsx
echo '        <div className="w-full xl:w-[32%] shrink-0 flex flex-col gap-4">' >> new_layout.tsx

# Projected Value + Insights + Quick Actions (lines 575 to 667)
sed -n '575,667p' current_futurewealth.txt >> new_layout.tsx

echo '        </div>' >> new_layout.tsx
echo '      </div>' >> new_layout.tsx

# Rest of the file (lines 671 to end)
sed -n '671,$p' current_futurewealth.txt >> new_layout.tsx

mv new_layout.tsx src/components/FutureWealthProjection.tsx
