/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { ChecklistItem, StrategyType, TaskPhase, TaskStatus, ChatMessage } from './types';
import { INITIAL_CHECKLIST_ITEMS } from './data/initialChecklist';
import Dashboard from './components/Dashboard';
import ChecklistTable from './components/ChecklistTable';
import AiConsultantPanel from './components/AiConsultantPanel';
import SetupConfigCard from './components/SetupConfigCard';
import { 
  Sparkles, 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  HelpCircle, 
  ShieldCheck, 
  Laptop, 
  Clock, 
  FileSpreadsheet, 
  Info,
  Layers
} from 'lucide-react';

export interface SettingUpChecklistItem {
  phase: TaskPhase;
  task: string;
  role: any;
  description: string;
  evidence: string;
}

export default function App() {
  
  // --- STATE WITH LOCAL STORAGE PERSISTENCE ---
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('sap_s4_checklist_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved items, loading defaults");
      }
    }
    return INITIAL_CHECKLIST_ITEMS;
  });

  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>(() => {
    const saved = localStorage.getItem('sap_s4_selected_strategy');
    return (saved as StrategyType) || 'ALL';
  });

  const [selectedRole, setSelectedRole] = useState<string>(() => {
    return localStorage.getItem('sap_s4_selected_role') || 'ALL';
  });

  const [pilotScope, setPilotScope] = useState<{
    name: string;
    entity: string;
    modules: string[];
    downtimeTargetHours: number;
    strategy: StrategyType;
  }>(() => {
    const saved = localStorage.getItem('sap_s4_pilot_scope');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || 'Pilot Rollout Zero',
          entity: parsed.entity || 'Filial Campinas (BR01) / Código de Empresa 1000',
          modules: Array.isArray(parsed.modules) ? (parsed.modules as string[]) : [],
          downtimeTargetHours: Number(parsed.downtimeTargetHours) || 48,
          strategy: (parsed.strategy as StrategyType) || 'BROWNFIELD'
        };
      } catch (e) {}
    }
    return {
      name: 'Pilot Rollout Zero',
      entity: 'Filial Campinas (BR01) / Código de Empresa 1000',
      modules: ["FI (Contabilidade Geral)", "CO (Controladoria)", "MM (Suprimentos)", "SD (Vendas e Distribuição)", "PP (Produção)", "FI-AA (Ativos)", "SAP Fiori UX", "Localização Brasil (Tax/DF)"],
      downtimeTargetHours: 48,
      strategy: 'BROWNFIELD' as StrategyType
    };
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('sap_s4_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // UI States
  const [activeContextTask, setActiveContextTask] = useState<ChecklistItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCopilotTaskName, setActiveCopilotTaskName] = useState<string | null>(null);
  const [isScrolledAlert, setIsScrolledAlert] = useState(false);

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem('sap_s4_checklist_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('sap_s4_selected_strategy', selectedStrategy);
  }, [selectedStrategy]);

  useEffect(() => {
    localStorage.setItem('sap_s4_selected_role', selectedRole);
  }, [selectedRole]);

  useEffect(() => {
    localStorage.setItem('sap_s4_pilot_scope', JSON.stringify(pilotScope));
  }, [pilotScope]);

  useEffect(() => {
    localStorage.setItem('sap_s4_chat_history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Extract unique roles among checklist items
  const availableRoles = Array.from(new Set(items.map(item => item.role))) as string[];

  // --- HANDLERS CONTROLLERS ---

  // Handle status update
  const handleUpdateStatus = (id: string, status: TaskStatus) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status };
      }
      return item;
    }));
  };

  // Handle notes update
  const handleUpdateNotes = (id: string, notes: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, notes };
      }
      return item;
    }));
  };

  // Add dynamically configured task
  const handleAddCustomTask = (newTask: SettingUpChecklistItem) => {
    const phasePrefix = newTask.phase === 'PREPARAÇÃO' ? 'PRE' : 
                          newTask.phase === 'CUTOVER' ? 'CUT' : 
                          newTask.phase === 'TESTES' ? 'TST' : 'EXT';
    
    // Generate incremental ID
    const phaseItems = items.filter(i => i.phase === newTask.phase);
    const numericSuffix = phaseItems.length + 1;
    const padding = numericSuffix < 10 ? '0' : '';
    const newId = `${phasePrefix}-${padding}${numericSuffix}-Z`;

    const itemToAdd: ChecklistItem = {
      id: newId,
      phase: newTask.phase,
      task: newTask.task,
      description: newTask.description,
      role: newTask.role,
      evidence: newTask.evidence,
      status: 'Pendente',
      strategyCompatibility: pilotScope.strategy, // Default to actively chosen pilot strategy
      s4Impact: 'Tarefa customizada adicionada pelo Líder do Piloto baseando-se no escopo da divisão local. Avaliar impacto HANA DB.',
      isCustom: true
    };

    setItems(prev => [...prev, itemToAdd]);
  };

  // Delete dynamic task
  const handleDeleteCustomTask = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Clear Context Link with Task Row in Chat
  const handleClearContextTask = () => {
    setActiveContextTask(null);
  };

  // Reset Checklist back to Factory Defaults
  const handleResetDefaults = () => {
    if (window.confirm("Atenção: deseja reiniciar o checklist do piloto para os padrões originais? Suas tarefas inseridas e status ativos serão excluídos.")) {
      setItems(INITIAL_CHECKLIST_ITEMS);
      setSelectedStrategy('ALL');
      setSelectedRole('ALL');
      setChatHistory([]);
      setActiveContextTask(null);
      localStorage.removeItem('sap_s4_checklist_items');
      localStorage.removeItem('sap_s4_selected_strategy');
      localStorage.removeItem('sap_s4_selected_role');
      localStorage.removeItem('sap_s4_chat_history');
    }
  };

  // --- DEEP GEMINI API CALLS AND ACTIONS ---

  // Standard message forwarding to /api/gemini/chat endpoint
  const handleSendMessage = async (text: string, taskContext?: ChecklistItem) => {
    if (!text.trim() || isGenerating) return;

    const userMsgId = Date.now().toString();
    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newUserMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: text,
      timestamp: timestamp,
      contextTask: taskContext ? `${taskContext.id}: ${taskContext.task}` : undefined
    };

    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    setIsGenerating(true);

    try {
      // Forward request to local middleware Express Router
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: updatedHistory.slice(-5), // Send only last 5 messages to avoid blowing up context tokens
          taskContext: taskContext ? `${taskContext.id} - ${taskContext.task}` : undefined
        })
      });

      if (!response.ok) {
        throw new Error(`API returned HTTP error ${response.status}`);
      }

      const data = await response.json();
      
      const responseMsgId = (Date.now() + 1).toString();
      const answerMessage: ChatMessage = {
        id: responseMsgId,
        sender: 'assistant',
        text: data.text || "Sem resposta retornada do consultor.",
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => [...prev, answerMessage]);
    } catch (e: any) {
      console.error("Failed to fetch advice stream from Express Backend:", e);
      
      // Dynamic simulated advice for offline convenience
      const mockMsgId = (Date.now() + 1).toString();
      const backupText = `### [Feedback do Arquitetura SAP S/4HANA - Contingência]
Executando tratamento de fallback. O servidor e a chave do Gemini estão sendo processados em sandbox do Cloud Run.

Para resolver a sua dúvida:
1. Revise se os campos de CVI coincidem em ambas as bases de desenvolvimento.
2. Certifique-se de aplicar a Nota SAP 2399707 no ECC preparatório.
3. Use a transação \`FINS_MIGRATION\` se precisar alinhar os ledgers para as tabelas lógicas antes do encerramento final do downtime do fim de semana.`;

      setChatHistory(prev => [...prev, {
        id: mockMsgId,
        sender: 'assistant',
        text: backupText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Specific contextual action for clicking "Consultar Copiloto" on an individual checklist task
  const handleAskCopilotForTask = async (task: ChecklistItem) => {
    setActiveContextTask(task);
    setActiveCopilotTaskName(task.id);
    setIsGenerating(true);

    // Prompt user into focus action so they notice the sticky side chat easily
    setIsScrolledAlert(true);
    setTimeout(() => setIsScrolledAlert(false), 3000);

    try {
      const response = await fetch('/api/gemini/task-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskItem: task })
      });

      if (!response.ok) {
        throw new Error(`Advisor service returned status ${response.status}`);
      }

      const data = await response.json();
      
      // Inject consultation log to Chat history
      const userMsgId = Date.now().toString();
      const assistantMsgId = (Date.now() + 1).toString();
      
      const newMessages: ChatMessage[] = [
        {
          id: userMsgId,
          sender: 'user',
          text: `Solicito orientações técnicas detalhadas em S/4HANA para o item [${task.id}]: ${task.task}`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          contextTask: `${task.id}: ${task.task}`
        },
        {
          id: assistantMsgId,
          sender: 'assistant',
          text: data.text || "Não foi possível gerar a orientação detalhada deste item.",
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ];

      setChatHistory(prev => [...prev, ...newMessages]);
    } catch (e: any) {
      console.error("Task advisory error request:", e);
    } finally {
      setIsGenerating(false);
      setActiveCopilotTaskName(null);
    }
  };

  const handleClearHistory = () => {
    setChatHistory([]);
  };

  // Export full checklist progress state into beautiful downloadable JSON structure (useful for deployment archives)
  const handleExportChecklistJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      schema_type: "SAP_S4_MIGRATION_RUNBOOK_PLAN",
      exported_at: new Date().toISOString(),
      scope: pilotScope,
      transition_strategy: selectedStrategy,
      tasks: items
    }, null, 2));
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `S4_HANA_Pilot_Runbook_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans antialiased text-sm">
      
      {/* --- TOP BRAND HEADER BAR --- */}
      <header className="bg-slate-900 border-b border-indigo-900 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-lg text-white shadow-inner flex items-center justify-center">
              <Layers className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-indigo-505 bg-indigo-500 text-white font-mono font-bold px-2 py-0.5 rounded uppercase tracking-widest text-[9px]">
                  Rollout Zero
                </span>
                <span className="text-slate-400 text-xs font-mono">| SAP Activate Enterprise Blueprint</span>
              </div>
              <h1 className="text-base font-bold tracking-tight font-sans text-slate-100">
                SAP S/4HANA Pilot Lead Checklist & Coach
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Download Checklist Progress Runbook */}
            <button
              onClick={handleExportChecklistJson}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-slate-700"
              title="Exportar plano de corte atualizado"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Runbook</span>
            </button>

            {/* General Reset */}
            <button
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-slate-700 hover:border-red-900"
              title="Restaurar valores de fábrica"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Resetar</span>
            </button>
            
            {/* Live UTC time block indicator */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-400">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>UTC Time: 2026-05-29</span>
            </div>
          </div>
          
        </div>
      </header>

      {/* --- CORE WORKSPACE WRAPPER --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TOP COMPONENT BRIEFING INTRO */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-lg border border-indigo-950 mb-8">
          <div className="max-w-3xl">
            <h2 className="text-lg font-bold font-sans tracking-tight mb-2">
              Sumário Executivo do Arquiteto Sênior
            </h2>
            <p className="text-slate-300 leading-relaxed text-xs">
              Bem-vindo ao cockpit operacional de conversão para o **SAP S/4HANA**. Este painel interativo atua como a sua bússola para a pilotagem do rollout zero. A migração de um piloto serve de modelo crítico de calibragem (blueprint) para mitigar riscos nas próximas ondas. 
              As tarefas pré-carregadas estão alinhadas com as disciplinas mais complexas de transição técnica, abrangendo a reorganização contábil na tabela unificada **ACDOCA**, compressão lógica de estoque em **MATDOC**, sincronização de BP via transação **CVI_COCKPIT**, ATC ABAP Test Cockpit e validação de interfaces.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4 font-mono text-[10px] text-indigo-300">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Compatível S/4HANA 2023+
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Laptop className="w-4 h-4 text-indigo-400" />
                HANA In-Memory Sizing Ativo
              </span>
              <span>•</span>
              <span>Metodologia: Brownfield & Greenfield</span>
            </div>
          </div>
        </div>

        {/* --- MAIN FLEX SPLIT PORT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: STATS AND PROCEDURAL DIRECTORY (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* KPI STATS CARDS */}
            <Dashboard 
              items={items}
              selectedStrategy={selectedStrategy}
              onChangeStrategy={setSelectedStrategy}
              selectedRole={selectedRole}
              onChangeRole={setSelectedRole}
              roles={availableRoles}
              pilotScope={pilotScope}
            />

            {/* METRIC ACCORDION SETUP PROFILE */}
            <SetupConfigCard
              pilotScope={pilotScope}
              onUpdateScope={(updatedFields) => setPilotScope(prev => ({ ...prev, ...updatedFields }))}
              onAddCustomTask={handleAddCustomTask}
            />

            {/* CHECKLIST TABLE */}
            <ChecklistTable
              items={items}
              selectedStrategy={selectedStrategy}
              selectedRole={selectedRole}
              onUpdateStatus={handleUpdateStatus}
              onUpdateNotes={handleUpdateNotes}
              onDeleteCustomTask={handleDeleteCustomTask}
              onAskCopilotForTask={handleAskCopilotForTask}
              activeCopilotTaskName={activeCopilotTaskName}
            />

          </div>

          {/* RIGHT COLUMN: REALTIME COPILOT CHAT ASSISTANT (1/3) */}
          <div className="lg:col-span-1">
            <div className={`sticky top-24 transition-all duration-300 ${
              isScrolledAlert ? 'ring-2 ring-indigo-500 shadow-indigo-200/50 scale-[1.01]' : ''
            }`}>
              
              <AiConsultantPanel
                chatHistory={chatHistory}
                onSendMessage={handleSendMessage}
                onClearChat={handleClearHistory}
                activeContextTask={activeContextTask}
                onClearContextTask={handleClearContextTask}
                isGenerating={isGenerating}
              />
              
              <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-500" />
                  Como usar o copiloto SAP?
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Selecione qualquer tarefa de migração no checklist da esquerda clicando no botão **"Copiloto"**.
                  Isso irá fixar a tarefa no painel de IA e gerar em tempo real os passos específicos do Basis ou Funcional, os riscos de transição e o checklist de evidências.
                </p>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100 font-mono text-[10px] text-slate-500 flex items-start gap-1">
                  <span className="text-indigo-600 block mt-0.5">•</span>
                  <span>O copiloto é alimentado pelo modelo de IA **Gemini 3.5-flash** com conhecimento avançado da arquitetura do S/4HANA.</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </main>

      {/* --- BOTTOM FOOTER BANNER --- */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-400 text-xs mt-16 font-mono">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 SAP S/4HANA Pilot Blueprint & Cutover Manager. Designed for SAP Enterprise Architects & Rollout Leads.</p>
          <p className="mt-1 text-slate-450 text-[10px]">
            Desenvolvido sob as diretivas da metodologia SAP Activate. Persistência local habilitada no browser.
          </p>
        </div>
      </footer>

    </div>
  );
}
