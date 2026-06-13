import { useState } from 'react';
import { History, Play, Trash2, Check, Star, ChevronDown, ShieldCheck, Flag } from 'lucide-react';
import type { SimulationResult, DecisionMark } from '../../shared/types.js';
import { DECISION_LABELS } from '../../shared/types.js';
import { formatNumber, formatPercentage } from '../../shared/monteCarlo.js';

interface Props {
  simulations: SimulationResult[];
  currentId: string | null;
  onSelect: (sim: SimulationResult) => void;
  onDelete: (id: string) => void;
  onStar: (sim: SimulationResult) => void;
  onDecision: (sim: SimulationResult, decision: DecisionMark | null) => void;
  onKeyVersion: (sim: SimulationResult, isKey: boolean) => void;
}

export default function SimulationHistory({ simulations, currentId, onSelect, onDelete, onStar, onDecision, onKeyVersion }: Props) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const sorted = [...simulations].sort((a, b) => {
    if (a.keyVersion && !b.keyVersion) return -1;
    if (!a.keyVersion && b.keyVersion) return 1;
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <History className="w-5 h-5 text-monte-accent" />
        历史运行
        <span className="badge bg-monte-accent/20 text-monte-accent border border-monte-accent/30 ml-1">
          {simulations.length}
        </span>
      </h3>

      {simulations.length === 0 ? (
        <div className="text-center py-8 text-monte-muted text-sm">
          暂无历史记录，运行模拟后将自动保存
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {sorted.map((sim) => {
            const isActive = sim.id === currentId;
            const isLoss = sim.lossProbability > 0.3;
            const isStarred = !!sim.starred;
            const isKey = !!sim.keyVersion;
            const decisionCfg = sim.decision ? DECISION_LABELS[sim.decision] : null;
            return (
              <div
                key={sim.id}
                onClick={() => onSelect(sim)}
                className={`p-3 rounded-xl border cursor-pointer transition-all group ${
                  isKey
                    ? 'bg-monte-accent/5 border-monte-accent/40 shadow-glow/30'
                    : isStarred && !isActive
                    ? 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50'
                    : isActive
                    ? 'bg-monte-accent/10 border-monte-accent/50 shadow-glow'
                    : 'bg-monte-bg/50 border-monte-border/50 hover:border-monte-accent/30 hover:bg-monte-bg'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {isActive && <Check className="w-3.5 h-3.5 text-monte-accent flex-shrink-0" />}
                      {isKey && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-monte-accent/20 text-monte-accent border border-monte-accent/40">
                          <Flag className="w-2.5 h-2.5 fill-monte-accent" />
                          关键版本
                        </span>
                      )}
                      <span className={`text-sm font-medium truncate ${isActive ? 'text-monte-accent' : 'text-white'}`}>
                        {sim.runName}
                      </span>
                      {isStarred && !isKey && (
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 mb-2">
                      {decisionCfg ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === sim.id ? null : sim.id); }}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${decisionCfg.bg} ${decisionCfg.color} border ${decisionCfg.border} hover:brightness-110 transition-all`}
                          title="点击修改结论"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {decisionCfg.label}
                          <ChevronDown className="w-2.5 h-2.5 opacity-70" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === sim.id ? null : sim.id); }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-monte-border/60 text-monte-muted border border-monte-border hover:bg-monte-border hover:text-white transition-all"
                          title="设置结论"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          设结论
                          <ChevronDown className="w-2.5 h-2.5 opacity-70" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); onKeyVersion(sim, !isKey); }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                          isKey
                            ? 'bg-monte-accent/20 text-monte-accent border border-monte-accent/40'
                            : 'bg-monte-border/40 text-monte-muted border border-monte-border/60 hover:bg-monte-border/60 hover:text-white'
                        }`}
                        title={isKey ? '取消关键版本' : '设为关键决策版本'}
                      >
                        <Flag className={`w-3 h-3 ${isKey ? 'fill-monte-accent' : ''}`} />
                        {isKey ? '关键' : '标关键'}
                      </button>
                    </div>

                    <div className="text-xs text-monte-muted mb-2 flex items-center gap-3 flex-wrap">
                      <span>{new Date(sim.timestamp).toLocaleString('zh-CN')}</span>
                      <span className="font-mono">{formatNumber(sim.iterations, 0)} 次</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div className="p-1.5 rounded-md bg-monte-card/60">
                        <span className="text-monte-muted">均值</span>
                        <span className={`ml-1 font-mono font-semibold ${sim.mean >= 0 ? 'text-monte-safe' : 'text-monte-danger'}`}>
                          {formatNumber(sim.mean, 0)}
                        </span>
                      </div>
                      <div className="p-1.5 rounded-md bg-monte-card/60">
                        <span className="text-monte-muted">P50</span>
                        <span className="ml-1 font-mono font-semibold text-monte-accent">
                          {formatNumber(sim.percentiles.p50, 0)}
                        </span>
                      </div>
                      <div className="p-1.5 rounded-md bg-monte-card/60">
                        <span className="text-monte-muted">亏损</span>
                        <span className={`ml-1 font-mono font-semibold ${isLoss ? 'text-monte-danger' : 'text-monte-safe'}`}>
                          {formatPercentage(sim.lossProbability, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); onStar(sim); }}
                      className={`p-1.5 rounded-md transition-colors ${
                        isStarred
                          ? 'text-amber-400 bg-amber-400/15'
                          : 'text-monte-muted hover:text-amber-400 hover:bg-amber-400/10'
                      }`}
                      title={isStarred ? '取消收藏' : '收藏'}
                    >
                      <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400' : ''}`} />
                    </button>
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === sim.id ? null : sim.id); }}
                        className={`p-1.5 rounded-md transition-colors ${
                          decisionCfg
                            ? `${decisionCfg.color} ${decisionCfg.bg}`
                            : 'text-monte-muted hover:text-monte-accent hover:bg-monte-accent/10'
                        }`}
                        title="决策结论"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </button>
                      {openMenuId === sim.id && (
                        <div
                          className="absolute right-0 top-full mt-1 z-20 bg-monte-card border border-monte-border rounded-lg shadow-xl py-1 min-w-[150px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-monte-muted border-b border-monte-border/50 mb-1">
                            决策结论
                          </div>
                          {(Object.keys(DECISION_LABELS) as DecisionMark[]).map((key) => {
                            const cfg = DECISION_LABELS[key];
                            const isSelected = sim.decision === key;
                            return (
                              <button
                                key={key}
                                onClick={() => { onDecision(sim, isSelected ? null : key); setOpenMenuId(null); }}
                                className={`w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 transition-colors ${
                                  isSelected ? `${cfg.bg} ${cfg.color}` : 'text-monte-muted hover:text-white hover:bg-monte-border'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                                <span className={`font-medium ${cfg.color}`}>{cfg.label}</span>
                              </button>
                            );
                          })}
                          {sim.decision && (
                            <>
                              <div className="border-t border-monte-border my-1" />
                              <button
                                onClick={() => { onDecision(sim, null); setOpenMenuId(null); }}
                                className="w-full px-3 py-1.5 text-left text-xs text-monte-danger hover:bg-monte-danger/10 transition-colors"
                              >
                                清除结论
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelect(sim); }}
                      className={`p-1.5 rounded-md transition-colors ${
                        isActive
                          ? 'bg-monte-accent/20 text-monte-accent'
                          : 'text-monte-muted hover:text-monte-accent hover:bg-monte-accent/10'
                      }`}
                      title="查看结果"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(sim.id); }}
                      className="p-1.5 rounded-md text-monte-muted hover:text-monte-danger hover:bg-monte-danger/10 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
