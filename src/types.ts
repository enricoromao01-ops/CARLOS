/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StrategyType = 'BROWNFIELD' | 'GREENFIELD' | 'ALL';

export type TaskPhase = 'PREPARAÇÃO' | 'CUTOVER' | 'TESTES' | 'EXIT';

export type TaskStatus = 'Pendente' | 'Em Andamento' | 'Bloqueado' | 'Concluído';

export interface PilotScope {
  name: string;
  strategy: StrategyType;
  entity: string; // ex: "Filial SP01, Brasil", "Código de Empresa 1000"
  modules: string[]; // ex: ["FI", "CO", "MM", "SD", "PP", "Fiori"]
  downtimeTargetHours: number;
}

export interface ChecklistItem {
  id: string;
  phase: TaskPhase;
  task: string;
  description: string;
  role: 'Basis' | 'Funcional FI/CO' | 'Funcional MM/SD' | 'Pilot Lead' | 'ABAP Dev' | 'PM' | 'Negócio / SMEs' | 'Security / GRC';
  evidence: string;
  status: TaskStatus;
  strategyCompatibility: StrategyType;
  s4Impact: string; // Explicação técnica específica do S/4HANA (ex: ACDOCA, CVI, New Asset Accounting)
  notes?: string;
  isCustom?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  contextTask?: string; // Se a pergunta foi feita no contexto de uma tarefa específica
}
