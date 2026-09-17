import re

with open('src/components/WealthView.tsx', 'r') as f:
    content = f.read()

# I will rewrite the WealthView grid completely
grid_start = content.find('            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">')
grid_end = content.find('          </motion.div>')

if grid_start != -1 and grid_end != -1:
    new_grid = """            <div className="flex flex-col gap-8 pb-12">
              
              {/* 1. WEALTH HERO */}
              <div className="bg-ui-surface border border-ui-border rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                
                <div className="relative z-10">
                  <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Total Wealth</h2>
                  <div className="flex items-end gap-4 mb-2">
                    <p className="text-4xl md:text-5xl font-mono font-black text-text-main tracking-tight">
                      {isBalancesHidden ? '••••••••' : formatCurrency(summary.currentValue)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-mono font-bold ${summary.totalReturn >= 0 ? 'text-positive' : 'text-negative'} flex items-center bg-positive/10 px-2 py-1 rounded-md`}>
                      {summary.totalReturn >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                      {summary.totalReturn >= 0 ? '+' : ''}{formatCurrency(summary.totalReturn)} ({summary.totalReturn >= 0 ? '+' : ''}{((summary.totalReturn / summary.investedAmount) * 100 || 0).toFixed(2)}%)
                    </span>
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider bg-ui-bg px-2 py-1 rounded-md border border-ui-border">All Time</span>
                  </div>
                </div>

                <div className="relative z-10 flex flex-row md:flex-col gap-4 md:gap-6 w-full md:w-auto overflow-x-auto custom-scrollbar pb-2 md:pb-0">
                  <div className="min-w-[140px]">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Invested Assets</p>
                    <p className="text-lg font-mono font-bold text-text-main">{isBalancesHidden ? '••••••••' : formatCurrency(summary.investedAmount)}</p>
                  </div>
                  <div className="min-w-[140px]">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Available Cash</p>
                    <p className="text-lg font-mono font-bold text-text-main">{isBalancesHidden ? '••••••••' : formatCurrency(160000)}</p>
                  </div>
                </div>
              </div>

              {/* 2. WEALTH PERFORMANCE & SNAPSHOT */}
              <div className="bg-ui-surface border border-ui-border rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Performance</h3>
                  
                  <div className="flex items-center bg-ui-bg rounded-lg p-1 border border-ui-border">
                    {['1M', '6M', '1Y', '3Y', 'All'].map(period => (
                      <button 
                        key={period}
                        onClick={() => setGrowthPeriod(period as any)}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${growthPeriod === period ? 'bg-ui-surface shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'}`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="h-[250px] md:h-[300px] w-full mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={['dataMin - 10000', 'dataMax + 10000']} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-ui-surface border border-ui-border rounded-xl shadow-xl p-3 min-w-[150px]">
                                <p className="text-[10px] text-text-muted font-bold mb-2 uppercase">{payload[0].payload.date}</p>
                                <p className="text-sm font-mono font-bold text-text-main mb-1">
                                  {isBalancesHidden ? '••••••••' : formatCurrency(payload[0].value as number)}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Wealth Snapshot Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-ui-border">
                  <div className="bg-ui-bg p-4 rounded-2xl border border-ui-border">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Invested</p>
                    <p className="text-sm font-mono font-bold text-text-main">{isBalancesHidden ? '••••••••' : formatCurrency(summary.investedAmount)}</p>
                  </div>
                  <div className="bg-ui-bg p-4 rounded-2xl border border-ui-border">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Returns</p>
                    <p className={`text-sm font-mono font-bold ${summary.totalReturn >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {summary.totalReturn >= 0 ? '+' : ''}{isBalancesHidden ? '••••••••' : formatCurrency(summary.totalReturn)}
                    </p>
                  </div>
                  <div className="bg-ui-bg p-4 rounded-2xl border border-ui-border">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Return %</p>
                    <p className={`text-sm font-mono font-bold ${summary.totalReturn >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {summary.totalReturn >= 0 ? '+' : ''}{((summary.totalReturn / summary.investedAmount) * 100 || 0).toFixed(2)}%
                    </p>
                  </div>
                  <div className="bg-ui-bg p-4 rounded-2xl border border-ui-border">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Today's P&L</p>
                    <p className="text-sm font-mono font-bold text-positive">+₹4,250</p>
                  </div>
                </div>
              </div>

              {/* 3. ASSET ALLOCATION & INVESTMENTS (2-COLUMN) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Asset Allocation */}
                <div className="bg-ui-surface border border-ui-border rounded-3xl p-6 shadow-sm flex flex-col">
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-widest mb-6">Asset Allocation</h3>
                  
                  {assetAllocation.length > 0 ? (
                    <div className="flex flex-col md:flex-row items-center gap-8 flex-1">
                      <div className="h-[200px] w-[200px] relative shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={assetAllocation}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                            >
                              {assetAllocation.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: number) => [isBalancesHidden ? '••••••••' : `${currencySymbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Value']}
                              contentStyle={{ backgroundColor: 'var(--color-ui-surface)', borderColor: 'var(--color-ui-border)', borderRadius: '12px' }}
                              itemStyle={{ color: 'var(--color-text-main)', fontWeight: 'bold' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-[10px] font-bold text-text-muted uppercase">Assets</span>
                          <span className="text-xl font-mono font-black text-text-main">{assetAllocation.length}</span>
                        </div>
                      </div>
                      
                      <div className="w-full space-y-3">
                        {assetAllocation.map(alloc => (
                          <div key={alloc.name} className="flex items-center justify-between group cursor-pointer p-3 bg-ui-bg border border-ui-border rounded-xl hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: alloc.color }} />
                              <div>
                                <span className="text-sm font-bold text-text-main block">{alloc.name}</span>
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{alloc.percent.toFixed(1)}%</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-mono font-bold text-text-main">{isBalancesHidden ? '••••••••' : formatCompactCurrency(alloc.value)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 flex-1 flex flex-col justify-center">
                      <PieChartIcon size={40} className="mx-auto text-ui-border mb-4" />
                      <p className="text-sm text-text-muted font-bold">No allocation data</p>
                    </div>
                  )}
                </div>

                {/* Investments Overview */}
                <div className="bg-ui-surface border border-ui-border rounded-3xl p-6 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Investments</h3>
                    <button onClick={() => navigate('portfolio')} className="text-xs font-bold text-text-muted hover:text-primary transition-colors flex items-center gap-1">
                      View All <ArrowRight size={14} />
                    </button>
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    <div className="bg-ui-bg border border-ui-border p-4 rounded-2xl hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate('portfolio')}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-text-main">Stocks</h4>
                        <p className="text-sm font-mono font-bold text-text-main">{isBalancesHidden ? '••••••••' : formatCurrency(summary.currentValue)}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                          <p>Invested: {isBalancesHidden ? '••••••••' : formatCurrency(summary.investedAmount)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-mono font-bold ${summary.totalReturn >= 0 ? 'text-positive' : 'text-negative'}`}>
                            {summary.totalReturn >= 0 ? '+' : ''}{isBalancesHidden ? '••••••••' : formatCurrency(summary.totalReturn)}
                            <span className="ml-1">({summary.totalReturn >= 0 ? '+' : ''}{((summary.totalReturn / summary.investedAmount) * 100 || 0).toFixed(2)}%)</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-ui-bg border border-ui-border p-4 rounded-2xl opacity-60">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-text-main">Mutual Funds</h4>
                        <p className="text-sm font-mono font-bold text-text-main">{isBalancesHidden ? '••••••••' : '₹0'}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                          <p>Invested: {isBalancesHidden ? '••••••••' : '₹0'}</p>
                        </div>
                        <div className="text-right">
                          <button className="text-[10px] font-bold text-primary uppercase tracking-widest">Explore</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. FINANCIAL GOALS & INSIGHTS (2-COLUMN) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Financial Goals */}
                <div className="bg-ui-surface border border-ui-border rounded-3xl p-6 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Financial Goals</h3>
                    <button onClick={() => setStep('CREATE_GOAL')} className="text-xs font-bold text-primary hover:text-primary-hover transition-colors flex items-center gap-1">
                      <Plus size={14} /> Create Goal
                    </button>
                  </div>
                  
                  {goals.length === 0 ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center py-10 bg-ui-bg rounded-2xl border border-ui-border border-dashed">
                       <Target size={40} className="text-ui-border mb-4" />
                       <h4 className="text-sm font-bold text-text-main mb-2">Create your first financial goal</h4>
                       <p className="text-xs text-text-muted max-w-xs mb-4">Set a target and we'll help you track your progress over time.</p>
                       <button onClick={() => setStep('CREATE_GOAL')} className="bg-primary text-black px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider">
                         + Create Goal
                       </button>
                     </div>
                  ) : (
                    <div className="space-y-4 flex-1">
                      {goals.map(goal => {
                        const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                        return (
                          <div 
                            key={goal.id} 
                            onClick={() => setSelectedGoal(goal)}
                            className="bg-ui-bg border border-ui-border rounded-2xl p-5 hover:border-primary/50 transition-colors cursor-pointer group"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="text-sm font-bold text-text-main uppercase tracking-wider">{goal.name}</h4>
                                <p className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-widest">Target: {new Date(goal.targetDate).getFullYear()}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-mono font-bold text-text-main">
                                  {isBalancesHidden ? '••••••••' : formatCompactCurrency(goal.currentAmount)} / <span className="text-text-muted">{isBalancesHidden ? '••••••••' : formatCompactCurrency(goal.targetAmount)}</span>
                                </p>
                                <p className="text-[10px] text-primary font-bold mt-1 uppercase tracking-widest">{progress.toFixed(0)}% Complete</p>
                              </div>
                            </div>
                            
                            <div className="h-1.5 w-full bg-ui-border rounded-full overflow-hidden mb-3">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-primary"
                              />
                            </div>
                            
                            <div className="flex justify-between items-center text-[10px] text-text-muted font-bold uppercase tracking-widest">
                              <span>Monthly Contrib: {isBalancesHidden ? '••••••••' : `₹${(25000).toLocaleString('en-IN')}`}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Insights & Actions */}
                <div className="flex flex-col gap-8">
                  {/* Wealth Insights */}
                  <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-widest mb-5">
                      <Info size={16} /> Wealth Insights
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-ui-surface p-4 rounded-2xl border border-ui-border">
                        <p className="text-xs text-text-main font-bold leading-relaxed">
                          Your portfolio value increased by <span className="font-mono text-positive">+₹4,250</span> today.
                        </p>
                      </div>
                      <div className="bg-ui-surface p-4 rounded-2xl border border-ui-border">
                        <p className="text-xs text-text-main font-bold leading-relaxed">
                          Equities represent <span className="font-mono text-primary">{assetAllocation.find(a => a.name === 'Equities')?.percent.toFixed(0) || '0'}%</span> of your current portfolio allocation.
                        </p>
                      </div>
                      {goals.length > 0 && (
                        <div className="bg-ui-surface p-4 rounded-2xl border border-ui-border">
                          <p className="text-xs text-text-main font-bold leading-relaxed">
                            Your <span className="uppercase">{goals[0].name}</span> goal is <span className="font-mono text-primary">{((goals[0].currentAmount / goals[0].targetAmount) * 100).toFixed(0)}%</span> complete.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-ui-surface border border-ui-border rounded-3xl p-6 shadow-sm flex-1">
                    <h3 className="text-sm font-bold text-text-main uppercase tracking-widest mb-5">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => navigate('market')} className="bg-primary hover:bg-primary-hover text-black font-bold py-3 px-4 rounded-xl text-xs transition-colors uppercase tracking-wider flex flex-col items-center justify-center gap-2 shadow-md shadow-primary/20 h-24">
                        <TrendingUp size={20} />
                        Invest
                      </button>
                      <button className="bg-ui-bg hover:bg-ui-surface-hover text-text-main border border-ui-border font-bold py-3 px-4 rounded-xl text-xs transition-colors uppercase tracking-wider flex flex-col items-center justify-center gap-2 h-24">
                        <ArrowUpRight size={20} />
                        Add Money
                      </button>
                      <button onClick={() => setStep('CREATE_GOAL')} className="bg-ui-bg hover:bg-ui-surface-hover text-text-main border border-ui-border font-bold py-3 px-4 rounded-xl text-xs transition-colors uppercase tracking-wider flex flex-col items-center justify-center gap-2 h-24">
                        <Target size={20} />
                        Create Goal
                      </button>
                      <button onClick={() => navigate('portfolio')} className="bg-ui-bg hover:bg-ui-surface-hover text-text-main border border-ui-border font-bold py-3 px-4 rounded-xl text-xs transition-colors uppercase tracking-wider flex flex-col items-center justify-center gap-2 h-24">
                        <PieChartIcon size={20} />
                        Portfolio
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. FUTURE WEALTH PROJECTION */}
              <div className="w-full">
                <FutureWealthProjection />
              </div>

              {/* 6. WEALTH ACTIVITY */}
              <div className="bg-ui-surface border border-ui-border rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Recent Activity</h3>
                  <button className="text-xs font-bold text-text-muted hover:text-primary transition-colors flex items-center gap-1">
                    View All <ArrowRight size={14} />
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    { title: 'Monthly Investment', date: 'Today', amount: '₹25,000', icon: <ArrowUpRight size={16} className="text-primary" /> },
                    { title: 'Dividend Received', date: '12 Sep', amount: '+₹2,450', icon: <TrendingUp size={16} className="text-positive" /> },
                    { title: 'Goal Contribution', date: '10 Sep', amount: '₹15,000', icon: <Target size={16} className="text-primary" /> }
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-ui-bg border border-ui-border rounded-2xl hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-ui-surface border border-ui-border flex items-center justify-center">
                          {activity.icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-main">{activity.title}</p>
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{activity.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-mono font-bold ${activity.amount.startsWith('+') ? 'text-positive' : 'text-text-main'}`}>
                          {isBalancesHidden ? '••••••••' : activity.amount}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
"""
    content = content[:grid_start] + new_grid + content[grid_end:]
    
    with open('src/components/WealthView.tsx', 'w') as f:
        f.write(content)
    print("Success")
else:
    print("Failed to find grid start/end")

