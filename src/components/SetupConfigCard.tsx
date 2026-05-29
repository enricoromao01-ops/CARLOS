/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StrategyType, TaskPhase } from '../types';
import { SettingUpChecklistItem } from '../App';
import { Settings, Plus, Info, Clock, AlertTriangle, Briefcase, FileText } from 'lucide-react';

interface SetupConfigCardProps {
  pilotScope: {
    name: string;
    entity: string;
    modules: string[];
    downtimeTargetHours: number;
    strategy: StrategyType;
  };
  onUpdateScope: (updatedFields: any) => void;
  onAddCustomTask: (task: {
    phase: TaskPhase;
    task: string;
    description: string;
    role: 'Basis' | 'Funcional FI/CO' | 'Funcional MM/SD' | 'Pilot Lead' | 'ABAP Dev' | 'PM' | 'Negócio / SMEs' | 'Security / GRC';
    evidence: string;
  }) => void;
}

export default function SetupConfigCard({
  pilotScope,
  onUpdateScope,
  onAddCustomTask
}: SetupConfigCardProps) {
  
  // Custom Task states
  const [taskName, setTaskName] = useState('');
  const [taskPhase, setTaskPhase] = useState<TaskPhase>('PREPARAÇÃO');
  const [taskRole, setTaskRole] = useState<'Basis' | 'Funcional FI/CO' | 'Funcional MM/SD' | 'Pilot Lead' | 'ABAP Dev' | 'PM' | 'Negócio / SMEs' | 'Security / GRC'>('Pilot Lead');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskEvidence, setTaskEvidence] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Scope customization states
  const AVAILABLE_MODULES = ["FI (Contabilidade Geral)", "CO (Controladoria)", "MM (Suprimentos)", "SD (Vendas e Distribuição)", "PP (Produção)", "FI-AA (Ativos)", "SAP Fiori UX", "Localização Brasil (Tax/DF)"];

  const handleModuleToggle = (mod: string) => {
    const isSelected = pilotScope.modules.includes(mod);
    let updated: string[];
    if (isSelected) {
      updated = pilotScope.modules.filter(m => m !== mod);
    } else {
      updated = [...pilotScope.modules, mod];
    }
    onUpdateScope({ modules: updated });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    onAddCustomTask({
      task: taskName,
      phase: taskPhase,
      role: taskRole,
      description: taskDesc || "Tarefa customizada inserida pelo Líder do Piloto corporativo.",
      evidence: taskEvidence || "Ata assinada pelos líderes de célula do piloto."
    });

    setTaskName('');
    setTaskDesc('');
    setTaskEvidence('');
    setSuccessMsg('Tarefa inserida com sucesso no checklist!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Scope Settings */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-indigo-600 animate-spin-slow" />
          <h3 className="text-sm font-bold text-slate-800 font-sans uppercase tracking-wider">
            Escopo da Onda Zero (Rollout Piloto)
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
              Unidade/Divisão de Escopo do Piloto
            </label>
            <input
              type="text"
              value={pilotScope.entity}
              onChange={(e) => onUpdateScope({ entity: e.target.value })}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Ex: Filial Campinas (BR01) & Código de Empresa 1000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                Janela Limite de Downtime (Horas)
              </label>
              <input
                type="number"
                value={pilotScope.downtimeTargetHours}
                onChange={(e) => onUpdateScope({ downtimeTargetHours: parseInt(e.target.value) || 24 })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
                min={2}
                max={168}
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                Estratégia Recomendada
              </label>
              <select
                value={pilotScope.strategy}
                onChange={(e) => onUpdateScope({ strategy: e.target.value as StrategyType })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-indigo-505"
              >
                <option value="BROWNFIELD">Brownfield (System Conversion)</option>
                <option value="GREENFIELD">Greenfield (New Implementation)</option>
                <option value="ALL">Foco Misto (Ambas)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 text-slate-500">
              Módulos e Localizações Críticas Ativas no Piloto
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_MODULES.map(mod => {
                const isSelected = pilotScope.modules.includes(mod);
                return (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => handleModuleToggle(mod)}
                    className={`text-left p-2 rounded text-[11px] transition-colors border font-medium ${
                      isSelected 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                        : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {mod}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Write Custom Checklist Items */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Plus className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800 font-sans uppercase tracking-wider">
            Injetar Atividade Customizada
          </h3>
        </div>

        <form onSubmit={handleAddTask} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">
                Fase (SAP Activate)
              </label>
              <select
                value={taskPhase}
                onChange={(e) => setTaskPhase(e.target.value as TaskPhase)}
                className="w-full text-[11px] p-2 rounded-lg border border-slate-200 outline-none"
              >
                <option value="PREPARAÇÃO">1. Preparação (Pre-Go-Live)</option>
                <option value="CUTOVER">2. Cutover (The Weekend Run)</option>
                <option value="TESTES">3. Testes & Smoke Tests</option>
                <option value="EXIT">4. Critérios de Sucesso (Exit)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">
                Cargo / Responsável
              </label>
              <select
                value={taskRole}
                onChange={(e) => setTaskRole(e.target.value as any)}
                className="w-full text-[11px] p-2 rounded-lg border border-slate-200 outline-none"
              >
                <option value="Pilot Lead">Pilot Lead</option>
                <option value="Basis">Basis</option>
                <option value="Funcional FI/CO">Funcional FI/CO</option>
                <option value="Funcional MM/SD">Funcional MM/SD</option>
                <option value="ABAP Dev">ABAP Dev</option>
                <option value="PM">PM</option>
                <option value="Negócio / SMEs">Negócio / SMEs</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">
              Atividade / Nome da Tarefa *
            </label>
            <input
              type="text"
              required
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-none"
              placeholder="Ex: Auditoria de Emissão de Nota Fiscal Eletrônica no Piloto"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">
                Definição do escopo técnico
              </label>
              <input
                type="text"
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                className="w-full text-[11px] p-2 rounded-lg border border-slate-200 outline-none"
                placeholder="Indique as configurações afetadas..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">
                Evidência requerida
              </label>
              <input
                type="text"
                value={taskEvidence}
                onChange={(e) => setTaskEvidence(e.target.value)}
                className="w-full text-[11px] p-2 rounded-lg border border-slate-200 outline-none"
                placeholder="Ex: Log de simulação verde no ATC..."
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {successMsg ? (
              <span className="text-xs text-emerald-600 font-medium animate-pulse">{successMsg}</span>
            ) : (
              <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-indigo-400" /> Preencha para expandir seu plano de migração.
              </span>
            )}
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Inserir Tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
