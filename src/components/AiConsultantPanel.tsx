/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChecklistItem } from '../types';
import { Sparkles, Send, Trash2, Cpu, RefreshCw, Layers, HelpCircle, FileBarChart, CheckCircle } from 'lucide-react';

interface AiConsultantPanelProps {
  chatHistory: ChatMessage[];
  onSendMessage: (text: string, taskContext?: ChecklistItem) => Promise<void>;
  onClearChat: () => void;
  activeContextTask: ChecklistItem | null;
  onClearContextTask: () => void;
  isGenerating: boolean;
}

export default function AiConsultantPanel({
  chatHistory,
  onSendMessage,
  onClearChat,
  activeContextTask,
  onClearContextTask,
  isGenerating
}: AiConsultantPanelProps) {
  
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    
    // Send message with active row contextual item if available
    onSendMessage(inputText, activeContextTask || undefined);
    setInputText('');
  };

  // Predefined highly specific S/4HANA migration consult threads
  const SUGGESTED_PROMPTS = [
    {
      title: 'Tabela ACDOCA',
      prompt: 'Como devo planejar a validação e reconciliação dos saldos de ECC para a ACDOCA (fase Cutover)?',
      icon: <Layers className="w-3.5 h-3.5 text-indigo-400" />
    },
    {
      title: 'Sincronização CVI/BP',
      prompt: 'Quais os maiores erros que ocorrem no MDS_LOAD_COCKPIT durante a conversão preparatória para Business Partner e como tratá-los no ECC?',
      icon: <Cpu className="w-3.5 h-3.5 text-indigo-400" />
    },
    {
      title: 'Localização Fiscal',
      prompt: 'No projeto piloto brasileiro, como o S/4HANA impacta o módulo de TAX / Document Compliance (Nota Fiscal Eletrônica e SAP TDF)?',
      icon: <FileBarChart className="w-3.5 h-3.5 text-indigo-400" />
    },
    {
      title: 'Plano de Contingência',
      prompt: 'Quais são os principais pontos de rollback no "Go/No-Go" na fase técnica do SUM se uma inconsistência impossibilitar o uptime?',
      icon: <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
    }
  ];

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[650px]">
      
      {/* 1. COMPONENT HEADER */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600/30 rounded-lg text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-sans tracking-tight">Copiloto SAP S/4HANA L3</h3>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">
              Architect & PM AI Coach
            </span>
          </div>
        </div>
        
        <button
          onClick={onClearChat}
          className="p-1 px-2.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-300 rounded text-[11px] font-mono font-bold flex items-center gap-1 transition-colors"
          title="Limpar Histórico"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* 2. TASK CONTEXT NOTIFIER CARD */}
      {activeContextTask && (
        <div className="bg-indigo-950/80 p-3.5 border-b border-indigo-900/60 flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 text-xs leading-normal">
            <div className="p-1.5 bg-indigo-600 rounded text-indigo-200 font-mono font-bold text-[10px] mt-0.5">
              {activeContextTask.id}
            </div>
            <div>
              <p className="font-semibold text-indigo-200">
                Foco Ativo: <span className="text-white italic">"{activeContextTask.task}"</span>
              </p>
              <p className="text-[11px] text-indigo-300 mt-0.5 font-sans">
                A resposta da IA será totalmente customizada para este passo de {activeContextTask.role}.
              </p>
            </div>
          </div>
          <button
            onClick={onClearContextTask}
            className="text-[10px] text-indigo-300 hover:text-white hover:bg-indigo-900 py-0.5 px-2 rounded-md font-semibold border border-indigo-800"
          >
            Limpar Filtro
          </button>
        </div>
      )}

      {/* 3. CHAT THREAD PORT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[460px]">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col justify-between py-2 text-center text-slate-500">
            
            {/* Greeting explanation */}
            <div className="space-y-3 mt-4">
              <Cpu className="w-12 h-12 text-slate-700 mx-auto" />
              <h4 className="text-slate-300 font-bold font-sans text-sm">Olá, Pilot Lead! Como posso ajudar hoje?</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Eu sou o seu Consultor Técnico L3 em SAP S/4HANA. Posso tirar dúvidas sobre tabelas Universais, SUM DMO, CVI, migração contábil, Fiori, ou propor planos de ação para os itens do checklist.
              </p>
            </div>

            {/* Quick starts */}
            <div className="space-y-2 mt-6">
              <p className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">Tópicos recomendados de arquitetura:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {SUGGESTED_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(item.prompt, activeContextTask || undefined)}
                    className="p-2.5 bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 rounded-lg text-left transition-all duration-200 text-xs text-slate-300 flex items-start gap-2 group"
                  >
                    <div className="mt-0.5 p-1 bg-slate-800 border border-slate-700 group-hover:bg-indigo-900 rounded group-hover:border-indigo-700 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 block text-[11px]">{item.title}</span>
                      <span className="block text-[10px] text-slate-400 font-sans mt-0.5 line-clamp-1">{item.prompt}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        ) : (
          chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Context Tag bubble if question was made under a checklist context */}
              {msg.contextTask && msg.sender === 'user' && (
                <span className="text-[9px] text-slate-500 font-mono tracking-wider mb-1 flex items-center gap-1">
                  <Cpu className="w-2.5 h-2.5" /> Vinculado ao {msg.contextTask}
                </span>
              )}

              {/* Message bubble */}
              <div
                className={`max-w-[85%] rounded-xl p-3.5 text-xs shadow-md leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-950 text-slate-200 rounded-tl-none border border-slate-800 font-sans'
                }`}
              >
                {/* Parse Markdown-like titles safely */}
                <div className="space-y-2 whitespace-pre-wrap">
                  {msg.text.split('\n').map((line, i) => {
                    if (line.startsWith('### ')) {
                      return <h4 key={i} className="font-bold text-indigo-300 font-sans text-[12px] mt-2 border-b border-indigo-950/50 pb-0.5">{line.substring(4)}</h4>;
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <strong key={i} className="text-white block font-bold font-sans mt-2">{line.replaceAll('**', '')}</strong>;
                    }
                    if (line.startsWith('- ')) {
                      return <li key={i} className="ml-2 list-disc list-inside">{line.substring(2)}</li>;
                    }
                    return <p key={i}>{line}</p>;
                  })}
                </div>
              </div>

              {/* Timestamp info */}
              <span className="text-[9px] text-slate-500 tracking-wider mt-1 px-1 font-mono">
                {msg.timestamp}
              </span>
            </div>
          ))
        )}

        {/* Typing indicator spinner */}
        {isGenerating && (
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <div className="p-2 bg-indigo-650 rounded-full animate-bounce">
              <Sparkles className="w-3 h-3 text-indigo-400 rotate-animation" />
            </div>
            <span className="font-mono text-[10px] tracking-widest uppercase animate-pulse">
              Consultor sênior formulando roteiro técnico...
            </span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* 4. TEXT CONTROLLER FORM */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          placeholder={
            activeContextTask 
              ? `Perguntar sobre ${activeContextTask.id}...` 
              : "Dúvida de conversão (ex: CVI, New Asset Accounting, ACDOCA)..."
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isGenerating}
          className="flex-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-500 text-xs"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isGenerating}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg flex items-center justify-center shadow-lg transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
