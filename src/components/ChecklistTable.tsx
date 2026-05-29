/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChecklistItem, TaskStatus, TaskPhase, StrategyType } from '../types';
import { 
  CheckCircle, 
  Clock, 
  AlertOctagon, 
  Circle, 
  Search, 
  Cpu, 
  Sparkles, 
  ExternalLink, 
  Trash2, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Compass,
  CornerDownRight
} from 'lucide-react';

interface ChecklistTableProps {
  items: ChecklistItem[];
  selectedStrategy: StrategyType;
  selectedRole: string;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDeleteCustomTask: (id: string) => void;
  onAskCopilotForTask: (task: ChecklistItem) => void;
  activeCopilotTaskName: string | null;
}

export default function ChecklistTable({
  items,
  selectedStrategy,
  selectedRole,
  onUpdateStatus,
  onUpdateNotes,
  onDeleteCustomTask,
  onAskCopilotForTask,
  activeCopilotTaskName
}: ChecklistTableProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Local states for editing notes before saving
  const [editingNotes, setEditingNotes] = useState<{ [id: string]: string }>({});

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleNotesChange = (id: string, text: string) => {
    setEditingNotes(prev => ({ ...prev, [id]: text }));
  };

  const handleNotesSave = (id: string) => {
    onUpdateNotes(id, editingNotes[id] ?? "");
  };

  // 1. FILTER ITEMS BY STRATEGY, SEARCH, AND ROLE
  const filteredItems = items.filter(item => {
    // Strategy matches
    const strategyMatch = 
      selectedStrategy === 'ALL' || 
      item.strategyCompatibility === 'ALL' || 
      item.strategyCompatibility === selectedStrategy;

    // Role matches
    const roleMatch = selectedRole === 'ALL' || item.role === selectedRole;

    // Search matches
    const matchesSearch = 
      item.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.s4Impact.toLowerCase().includes(searchTerm.toLowerCase());

    return strategyMatch && roleMatch && matchesSearch;
  });

  // 2. GROUP ITEMS BY PHASE
  const phases: { key: TaskPhase; name: string; desc: string; colorClass: string; bgClass: string }[] = [
    { 
      key: 'PREPARAÇÃO', 
      name: '1. Preparação e Pré-requisitos (SAP Readiness & CVI)', 
      desc: 'Validações pré-conversão, mapeamento de Business Partners e limpezas operacionais no ECC.',
      colorClass: 'border-l-4 border-l-indigo-500', 
      bgClass: 'bg-indigo-50/50' 
    },
    { 
      key: 'CUTOVER', 
      name: '2. Execução Técnica e Cutover (The Weekend Run)', 
      desc: 'Processamento do SUM, migração de tabelas, carregamento financeiro e transições de banco de dados.',
      colorClass: 'border-l-4 border-l-emerald-500', 
      bgClass: 'bg-emerald-50/40' 
    },
    { 
      key: 'TESTES', 
      name: '3. Testes de Fumaça & Validação (Smoke Tests + Fiori)', 
      desc: 'Execução de transações chaves no S/4HANA (FB50, O2C, PTP), validação de conexões e experiência Fiori.',
      colorClass: 'border-l-4 border-l-sky-500', 
      bgClass: 'bg-sky-50/40' 
    },
    { 
      key: 'EXIT', 
      name: '4. Critérios de Sucesso & Lições Aprendidas (Exit Criteria)', 
      desc: 'Homologação contábil rigorosa, termo de Go/No-Go para rollouts globais e atualização de runbooks.',
      colorClass: 'border-l-4 border-l-violet-500', 
      bgClass: 'bg-violet-50/40' 
    }
  ];

  // Render Status Badge component
  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case 'Concluído':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Em Andamento':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Bloqueado':
        return 'bg-red-50 text-red-700 border-red-200 animate-pulse';
      case 'Pendente':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'Concluído':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'Em Andamento':
        return <Clock className="w-4 h-4 text-indigo-600 animate-spin-slow" />;
      case 'Bloqueado':
        return <AlertOctagon className="w-4 h-4 text-red-600" />;
      case 'Pendente':
      default:
        return <Circle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
      
      {/* Search Header toolbar */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-800 font-sans">Checklist Operacional do Pilot Lead</h2>
        </div>
        
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Pesquisar atividades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Main Checklist Phase Groups */}
      {phases.map(phase => {
        const itemsInPhase = filteredItems.filter(item => item.phase === phase.key);
        
        if (itemsInPhase.length === 0) return null;

        return (
          <div key={phase.key} className="border-b border-slate-100 last:border-b-0">
            {/* Phase Group Title Bar */}
            <div className={`p-4 ${phase.bgClass} ${phase.colorClass} flex flex-col md:flex-row md:items-center justify-between gap-2`}>
              <div>
                <h3 className="text-xs font-bold text-slate-800 tracking-tight uppercase flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-slate-600" />
                  {phase.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">{phase.desc}</p>
              </div>
              <span className="text-[10px] bg-white text-slate-500 font-mono font-bold px-2 py-0.5 rounded-full border border-slate-200/60 self-start md:self-center">
                {itemsInPhase.length} item(ns) filtrado(s)
              </span>
            </div>

            {/* List Table items in Phase */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr className="bg-slate-50/30 text-slate-400 text-[10px] uppercase font-mono tracking-widest text-left">
                    <th className="py-2.5 px-4 font-semibold w-12 text-center">ID</th>
                    <th className="py-2.5 px-4 font-semibold w-24">Perfis</th>
                    <th className="py-2.5 px-4 font-semibold">Atividade / Tarefa</th>
                    <th className="py-2.5 px-4 font-semibold w-24 text-center font-sans">Metodologia</th>
                    <th className="py-2.5 px-4 font-semibold w-36">Status</th>
                    <th className="py-2.5 px-4 font-semibold w-32 text-right">Consultor IA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {itemsInPhase.map((item) => {
                    const isExpanded = expandedId === item.id;
                    const isConsulting = activeCopilotTaskName === item.id;
                    
                    return (
                      <React.Fragment key={item.id}>
                        {/* Summary Row */}
                        <tr 
                          className={`hover:bg-slate-50/50 cursor-pointer transition-colors duration-150 ${
                            isExpanded ? 'bg-indigo-50/10' : ''
                          }`}
                          onClick={() => toggleExpand(item.id)}
                          id={`task-row-${item.id}`}
                        >
                          {/* ID code */}
                          <td className="py-3 px-4 font-mono font-bold text-slate-500 text-center text-[10px] bg-slate-50/40">
                            {item.id}
                          </td>
                          {/* S/4 Role owner */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 font-medium rounded-md text-[10px]">
                              <User className="w-2.5 h-2.5 text-slate-400" />
                              {item.role}
                            </span>
                          </td>
                          {/* Task Name & summary description snippet */}
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-semibold text-slate-800 leading-tight">
                                {item.task}
                              </p>
                              {!isExpanded && (
                                <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-lg">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </td>
                          {/* Compatibility Strategy */}
                          <td className="py-3 px-4 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              item.strategyCompatibility === 'BROWNFIELD' ? 'bg-amber-100 text-amber-800' :
                              item.strategyCompatibility === 'GREENFIELD' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {item.strategyCompatibility === 'ALL' ? 'Ambas' : item.strategyCompatibility}
                            </span>
                          </td>
                          {/* Interactive Status Selector */}
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5">
                              <span className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-full text-[10px] font-bold ${getStatusStyle(item.status)}`}>
                                {getStatusIcon(item.status)}
                                {item.status}
                              </span>
                              
                              {/* Small Quick-toggle dropdown list */}
                              <select
                                value={item.status}
                                onChange={(e) => onUpdateStatus(item.id, e.target.value as TaskStatus)}
                                className="border-none bg-transparent hover:bg-slate-100 px-1 py-1 rounded max-w-[20px] focus:ring-0 cursor-pointer text-slate-400"
                                title="Alterar Status"
                              >
                                <option value="Pendente">Marcar como Pendente</option>
                                <option value="Em Andamento">Marcar como Em Andamento</option>
                                <option value="Bloqueado">Marcar como Bloqueado</option>
                                <option value="Concluído">Marcar como Concluído</option>
                              </select>
                            </div>
                          </td>
                          {/* AI Copilot Advisor Action */}
                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => onAskCopilotForTask(item)}
                              className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md border font-semibold transition-all duration-200 ${
                                isConsulting 
                                  ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse shadow-sm'
                                  : 'bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-300'
                              }`}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{isConsulting ? 'Analisando...' : 'Copiloto'}</span>
                            </button>
                          </td>
                        </tr>

                        {/* Expandable Details Panel on Select */}
                        {isExpanded && (
                          <tr className="bg-slate-50/40">
                            <td colSpan={6} className="py-4 px-6 border-l-2 border-l-indigo-500">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left: Specific Details & Deliverables */}
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Descrição Detalhada</h4>
                                    <p className="text-slate-700 font-sans leading-relaxed mt-1 text-[11.5px]">
                                      {item.description}
                                    </p>
                                  </div>
                                  
                                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1">
                                      <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                                      Critério de Aceite / Evidência Requerida
                                    </h4>
                                    <p className="text-slate-650 leading-normal mt-1 text-[11px]">
                                      {item.evidence}
                                    </p>
                                  </div>

                                  {item.isCustom && (
                                    <button
                                      onClick={() => onDeleteCustomTask(item.id)}
                                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 hover:underline pt-2"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Remover tarefa personalizada
                                    </button>
                                  )}
                                </div>

                                {/* Right: Architectural Impact & Notes Log */}
                                <div className="space-y-3 flex flex-col justify-between">
                                  <div className="bg-indigo-950 text-indigo-100 p-3.5 rounded-lg border border-indigo-900/40">
                                    <h4 className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider font-mono flex items-center gap-1">
                                      <Cpu className="w-4 h-4 text-indigo-400" />
                                      Impacto Técnico SAP S/4HANA (Arquitetura)
                                    </h4>
                                    <p className="text-indigo-200 leading-normal mt-1 text-[11px]">
                                      {item.s4Impact}
                                    </p>
                                  </div>

                                  {/* Notes section */}
                                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1">
                                      Anotações Operacionais do Pilot Lead
                                    </label>
                                    <div className="flex gap-2">
                                      <textarea
                                        placeholder="Adicione observações de progresso, pendências ou discussões deste item específico..."
                                        value={editingNotes[item.id] !== undefined ? editingNotes[item.id] : (item.notes || '')}
                                        onChange={(e) => handleNotesChange(item.id, e.target.value)}
                                        className="w-full text-xs p-2 rounded border border-slate-200 bg-slate-50/50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 h-14 resize-none"
                                      />
                                      <button
                                        onClick={() => handleNotesSave(item.id)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-2.5 rounded hover:shadow-sm"
                                      >
                                        Salvar
                                      </button>
                                    </div>
                                    {item.notes && (
                                      <span className="block text-[9px] text-emerald-600 font-mono font-medium mt-1">
                                        ✓ Anotação ativa salva
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Empty State Banner */}
      {filteredItems.length === 0 && (
        <div className="py-12 text-center text-slate-500">
          <AlertOctagon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold">Nenhuma atividade corresponde aos filtros atuais.</p>
          <p className="text-xs text-slate-400 mt-1">Experimente alterar a estratégia de migração ou limpar o termo de pesquisa.</p>
        </div>
      )}
    </div>
  );
}
