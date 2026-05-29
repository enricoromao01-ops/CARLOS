/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChecklistItem, StrategyType, TaskPhase } from '../types';
import { Play, CheckCircle2, AlertTriangle, Clock, Layers, Filter, CheckSquare } from 'lucide-react';

interface DashboardProps {
  items: ChecklistItem[];
  selectedStrategy: StrategyType;
  onChangeStrategy: (strategy: StrategyType) => void;
  selectedRole: string;
  onChangeRole: (role: string) => void;
  roles: string[];
  pilotScope: {
    entity: string;
    modules: string[];
    downtimeTargetHours: number;
  };
}

export default function Dashboard({
  items,
  selectedStrategy,
  onChangeStrategy,
  selectedRole,
  onChangeRole,
  roles,
  pilotScope
}: DashboardProps) {
  
  // Calculate stats based on active lists (filtered implicitly by strategy but total dashboard counts everything)
  const totalTasks = items.length;
  const completedTasks = items.filter(i => i.status === 'Concluído').length;
  const inProgressTasks = items.filter(i => i.status === 'Em Andamento').length;
  const blockedTasks = items.filter(i => i.status === 'Bloqueado').length;
  const pendingTasks = items.filter(i => i.status === 'Pendente').length;

  const totalPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Progress per phase
  const phases: { name: TaskPhase; label: string; color: string }[] = [
    { name: 'PREPARAÇÃO', label: '1. Preparação & Readiness', color: 'bg-indigo-600' },
    { name: 'CUTOVER', label: '2. Execução & Cutover (Weekend)', color: 'bg-emerald-600' },
    { name: 'TESTES', label: '3. Testes & Smoke Validation', color: 'bg-sky-500' },
    { name: 'EXIT', label: '4. Critérios de Sucesso (Exit/Go-NoGo)', color: 'bg-violet-600' }
  ];

  const phaseStats = phases.map(p => {
    const phaseItems = items.filter(i => i.phase === p.name);
    const total = phaseItems.length;
    const completed = phaseItems.filter(i => i.status === 'Concluído').length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { ...p, total, completed, pct };
  });

  // Calculate simulated downtime progression
  // Each completed cutover item reduces the risk. Cutover total downtime budget: e.g. 48 hours.
  const cutoverItems = items.filter(i => i.phase === 'CUTOVER');
  const cutoverCompleted = cutoverItems.filter(i => i.status === 'Concluído').length;
  const cutoverPending = cutoverItems.length - cutoverCompleted;
  const simulatedRisk = cutoverItems.length > 0 
    ? Math.round((items.filter(i => i.phase === 'CUTOVER' && i.status === 'Bloqueado').length / cutoverItems.length) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* 1. MAIN RADIAL OVERVIEW */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-mono text-emerald-400 font-semibold tracking-wider uppercase">Rollout Zero / Piloto</span>
            <h3 className="text-lg font-bold font-sans tracking-tight mt-1">Progresso Geral do Piloto</h3>
          </div>
          <div className="p-2 bg-slate-800/80 rounded-lg text-emerald-400">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Big gauge */}
        <div className="flex items-center justify-center py-6">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-emerald-500 transition-all duration-1000 ease-out"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * totalPercent) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold font-sans tracking-tight">{totalPercent}%</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-1">Concluído</span>
            </div>
          </div>
        </div>

        {/* Small stats summary */}
        <div className="grid grid-cols-4 gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800/50 text-center font-mono text-xs">
          <div>
            <div className="text-slate-400 font-semibold">{pendingTasks}</div>
            <div className="text-[10px] text-slate-500 mt-1">Pend</div>
          </div>
          <div>
            <div className="text-indigo-400 font-semibold">{inProgressTasks}</div>
            <div className="text-[10px] text-slate-500 mt-1">Andam</div>
          </div>
          <div>
            <div className="text-red-400 font-semibold">{blockedTasks}</div>
            <div className="text-[10px] text-slate-500 mt-1">Bloq</div>
          </div>
          <div>
            <div className="text-emerald-400 font-semibold">{completedTasks}</div>
            <div className="text-[10px] text-slate-500 mt-1">Ok</div>
          </div>
        </div>
      </div>

      {/* 2. STRATEGIC FILTERS & SCOPE SUMMARY */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Parâmetros Selecionados do Piloto</h3>
          
          <div className="space-y-3 mb-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Escopo da Entidade:</span>
              <span className="text-xs font-semibold text-slate-800 truncate max-w-[180px]">{pilotScope.entity || "Universal Group"}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Janela de Cutover:</span>
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" /> {pilotScope.downtimeTargetHours} Horas (Alvo)
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {pilotScope.modules.map(mod => (
                <span key={mod} className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded border border-indigo-100">
                  {mod}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Global strategy switcher widget */}
        <div className="border-t border-slate-100 pt-4">
          <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2">
            Estratégia de Transição SAP S/4HANA
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
            {(['ALL', 'BROWNFIELD', 'GREENFIELD'] as StrategyType[]).map(strategy => (
              <button
                key={strategy}
                onClick={() => onChangeStrategy(strategy)}
                className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-all duration-200 ${
                  selectedStrategy === strategy
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {strategy === 'ALL' ? 'Ambas' : strategy}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRole}
              onChange={(e) => onChangeRole(e.target.value)}
              className="text-xs bg-transparent border-none text-slate-700 font-medium focus:ring-0 cursor-pointer outline-none w-full"
            >
              <option value="ALL">Visualizar Todas as Responsabilidades</option>
              {roles.map(r => (
                <option key={r} value={r}>Filtrar por: {r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. PHASE PROGRESS ACCORDIONS */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800 font-sans">Status por Fase (SAP Activate)</h3>
            <span className="text-[11px] font-mono bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full font-medium">
              Onda Piloto (Rollout Zero)
            </span>
          </div>

          <div className="space-y-3.5">
            {phaseStats.map(stat => (
              <div key={stat.name} className="group">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">{stat.label}</span>
                  <span className="font-mono text-slate-500 font-semibold">{stat.completed}/{stat.total} ({stat.pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${stat.color} h-full rounded-full transition-all duration-700`}
                    style={{ width: `${stat.pct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Down-time risk factor */}
        <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${simulatedRisk > 10 ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase">Fator de Risco do Cutover</p>
              <p className="text-xs font-bold text-slate-800">
                {blockedTasks > 0 ? `${blockedTasks} Tarefa(s) Bloqueada(s)` : 'Sem bloqueios identificados'}
              </p>
            </div>
          </div>
          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
            simulatedRisk > 20 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-slate-50 text-slate-600'
          }`}>
            Alerta: {blockedTasks > 0 ? 'ALTO' : 'OK'}
          </span>
        </div>
      </div>
    </div>
  );
}
