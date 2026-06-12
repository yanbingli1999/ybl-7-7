import { useState } from 'react';
import { History, Play, Trash2, Check, Star, ChevronDown } from 'lucide-react';
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
}

function DecisionBadge({ decision, onRemove }: { decision: DecisionMark; onRemove: () => void }) {
  const cfg = DECISION_LABELS[decision];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.color} border ${cfg.border} cursor-pointer`}
      onClick={(e) => { e.stopPropagation(); onRemove(); }}
      title="点击移除决策标记"
    >
      {cfg.label}
      <span className="opacity-60 hover:opacity-100">×</span>
    </span>
  );
}

export default function SimulationHistory({ simulations, currentId, onSelect, onDelete, onStar, onDecision }: Props) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const sorted = [...simulations].sort((a, b) => {
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
            const decisionCfg = sim.decision ? DECISION_LABELS[sim.decision] : null;
            return (
              <div
                key={sim.id}
                onClick={() => onSelect(sim)}
                className={`p-3 rounded-xl border cursor-pointer transition-all group ${
                  isStarred && !isActive
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
                      <span className={`text-sm font-medium truncate ${isActive ? 'text-monte-accent' : 'text-white'}`}>
                        {sim.runName}
                      </span>
                      {isStarred && (
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                      )}
                      {sim.decision && (
                        <DecisionBadge
                          decision={sim.decision}
                          onRemove={() => onDecision(sim, null)}
                        />
                      )}
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
                        title="决策标记"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      {openMenuId === sim.id && (
                        <div
                          className="absolute right-0 top-full mt-1 z-20 bg-monte-card border border-monte-border rounded-lg shadow-xl py-1 min-w-[130px]"
                          onClick={(e) => e.stopPropagation()}
                        >
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
                                清除标记
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
