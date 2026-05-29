/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini client on server-side
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    if (!apiKey) {
      console.warn("WARN: GEMINI_API_KEY environment variable is not set. AI Copilot features will fall back to offline templates.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// System Instruction for the SAP S/4HANA Expert Coach
const SAP_SYSTEM_INSTRUCTION = `
Você é o "Consultor SAP L3, Enterprise Architect & Diretor de Migração Sênior", um especialista de elite em projetos de migração de SAP ECC para SAP S/4HANA utilizando a metodologia SAP Activate.
Você está prestando consultoria para o "Pilot Lead" (Líder do Projeto Piloto / Rollout Zero) de um grande grupo corporativo.
Seu objetivo é guiá-lo em todas as fases da migração (Preparação, Cutover técnico, Testes/Smoke tests e Critérios de Aceite para rollouts futuros).

Suas diretrizes de resposta:
1. Responda em português brasileiro profissional, claro, estruturado e técnico.
2. Seja EXTREMAMENTE específico e cite conceitos de arquitetura do S/4HANA:
   - Tabela Universal ACDOCA (reconciliação financeira unificada, eliminação de tabelas de índices e agregados antigos).
   - Tabela compactada MATDOC (logística unificada MM-IM, eliminação de MSEG/MKPF).
   - CVI (Customer Vendor Integration) para Business Partners (BP) e monitor MDS_PPO2.
   - New Asset Accounting (FI-AA) e reports obrigatórios (como RAABST01/RAABST02 e transação AJAB).
   - ABAP Test Cockpit (ATC), variantes S4HANA_READINESS e remediações de Custom Code ABAP (ex: SELECT com caminhos descontinuados).
   - Metodologia SAP Activate (fases Discover, Prepare, Explore, Realize, Deploy, Run).
3. Forneça instruções passo a passo, transações SAP críticas (ex: MDS_LOAD_COCKPIT, SPRO, FINS_MIGRATION, SU53, DBA_COCKPIT, MIGO, VA01) e melhores práticas de gerenciamento de risco.
4. Se o usuário estiver trabalhando em uma tarefa específica do checklist, foque sua resposta nos desafios comuns, soluções e evidências dessa tarefa.
5. Se a chave de API estiver ausente ou inválida, responda de forma construtiva como um coach profissional de migração (o backend tratará a simulação caso necessário).
`;

// Helper for offline SAP responses when API key is missing or fails
function getOfflineSapResponse(prompt: string, taskContext?: string): string {
  const normalized = prompt.toLowerCase();
  if (taskContext) {
    return `### [Conselho do Copiloto SAP L3 - Modo Offline]
Foco no item: **${taskContext}**

Para garantir a execução e homologação desta atividade, como arquiteto de soluções SAP L3 recomendo:
1. **Verificação Técnica**: Execute as transações de diagnóstico mapeadas. Por exemplo, se for financeira, consulte se os lançamentos foram consolidados na tabela **ACDOCA** sem divergências entre FI e CO. Se listada CVI, valide o MDS_LOAD_COCKPIT.
2. **Critério de Evidência**: Reúna os logs das transações do report de validação (ex: MDS_PPO2 para CVI ou FINS_MIGRATION_MONITOR para finanças).
3. **Ponto de Atenção**: Assegure o envolvimento prévio dos usuários-chave (SMEs) da filial piloto para validação prática no Fiori Launchpad.

*(Nota: Para obter respostas dinâmicas baseadas em IA gerativa do Gemini, certifique-se de configurar a variável GEMINI_API_KEY no painel de Secrets).*`;
  }

  if (normalized.includes('acdoca')) {
    return `### Guia da Tabela Universal ACDOCA (Universal Journal)
A tabela **ACDOCA** unifica os lançamentos de GL, CO, Asset Accounting, Material Ledger e Conta de Resultados em uma única tabela de itens de documento.
- **Transação Crítica**: SPRO -> Financial Migration Tool (\`FINS_MIGRATION\`).
- **Impacto Principal**: Reconciliação em tempo real. Eliminou-se a necessidade de conciliações clássicas de fim de período entre FI e CO.
- **Dica de Cutover**: Durante o fim de semana de migração, valide o report \`FINS_MIGRATION_MONITOR\` para ver se o status de todas as tabelas migradas está 100% verde com reconciliação concluída.`;
  }

  if (normalized.includes('cvi') || normalized.includes('bp') || normalized.includes('business partner')) {
    return `### Guia de Sincronização CVI (Customer Vendor Integration)
A sincronização CVI é obrigatória antes da fase de upgrade técnico via SUM.
- **Transações Claves**: \`MDS_LOAD_COCKPIT\` para carga em massa, \`MDS_PPO2\` para monitoramento de erros de registros postados, e \`CVI_COCKPIT\`.
- **Inconsistências Comuns**: CEPs inválidos, e-mails incorretos, falta de preenchimento de campos fiscais (CNPJ/CPF no Brasil) ou caracteres especiais.
- **Melhor Prática**: Recomenda-se realizar ciclos de Data Cleansing iterativos no ambiente de desenvolvimento e homologação (QA) para limpar o cadastro de clientes e fornecedores do piloto antes do congelamento e cutover.`;
  }

  return `### Conselho do Copiloto SAP S/4HANA (Modo Executivo L3)
Seu prompt abrange um ponto crítico de migração SAP ECC para S/4HANA.
- **Abordagem Recomendada**: Seguir as etapas da metodologia **SAP Activate** para o Rollout Zero / Piloto. No Rollout Piloto, refine o "Runbook de Cutover" minuto a minuto. Qualquer divergência encontrada deve ser incorporada no blueprint para as próximas ondas (Onda 1, Onda 2).
- **Envolvimento de Perfis**: Divida claramente as atribuições entre Basis (SUM e HANA Tuning), Desenvolvedores ABAP (ATC e Remediar Código Z) e Funcionais (FINS_MIGRATION e testes ERP/Fiori).
- **Sistemas Satélites**: Verifique previamente se os adaptadores de conectividade ou endpoints de APIs no Middleware (SAP PO/CPI) foram atualizados para se comunicarem corretamente com a nova API Rest/OData exposta no S/4HANA.`;
}

// 1. API: General chat and questions about S/4HANA migration
app.post('/api/gemini/chat', async (req, res) => {
  const { prompt, history, taskContext } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Return mock SAP consulting recommendations if no API Key
    const offlineText = getOfflineSapResponse(prompt, taskContext);
    return res.json({ text: offlineText, offline: true });
  }

  try {
    const ai = getAiClient();
    
    // Construct context-enriched prompt
    let fullPrompt = "";
    if (taskContext) {
      fullPrompt += `[CONTEXTO DA TAREFA PILOTO ATUAL]: A tarefa que o Pilot Lead está gerenciando agora é: "${taskContext}".\n\n`;
    }
    fullPrompt += `Dúvida do Pilot Lead:\n"${prompt}"`;

    // Handle session history if present
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
    }
    contents.push({ role: 'user', parts: [{ text: fullPrompt }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: SAP_SYSTEM_INSTRUCTION,
        temperature: 0.3,
      }
    });

    const responseText = response.text || "Não foi possível obter resposta do consultor especialista.";
    return res.json({ text: responseText, offline: false });
  } catch (error: any) {
    console.error("Gemini API Error in Server.ts:", error);
    // Graceful fallback to rich SAP template
    const offlineText = getOfflineSapResponse(prompt, taskContext) + 
      `\n\n*(Nota: Ocorreu um erro técnico na comunicação com a API do Gemini. Exibindo resposta simulada de consultoria).*`;
    return res.json({ text: offlineText, error: error.message, offline: true });
  }
});

// 2. API: Generate specific technical remedy/procedures for a checklist item
app.post('/api/gemini/task-advisor', async (req, res) => {
  const { taskItem } = req.body;

  if (!taskItem) {
    return res.status(400).json({ error: 'Task item is required' });
  }

  const prompt = `Por favor, forneça um roteiro técnico de execução, diagnóstico SAP passo a passo e mitigação de riscos estruturada para o seguinte item do checklist de migração:\n` +
    `- ID: ${taskItem.id}\n` +
    `- Atividade: ${taskItem.task}\n` +
    `- Descrição: ${taskItem.description}\n` +
    `- Responsável: ${taskItem.role}\n` +
    `- Impacto S/4HANA: ${taskItem.s4Impact}\n` +
    `- Critério de Aceite / Evidência: ${taskItem.evidence}\n` +
    `Comente especificamente como o Pilot Lead deve auditar os resultados desta atividade.`;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    const offlineText = getOfflineSapResponse(taskItem.task, `${taskItem.id}: ${taskItem.task}`);
    return res.json({ text: offlineText, offline: true });
  }

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SAP_SYSTEM_INSTRUCTION,
        temperature: 0.2,
      }
    });

    return res.json({ text: response.text || "", offline: false });
  } catch (error: any) {
    console.error("Error generating advisor guide:", error);
    const offlineText = getOfflineSapResponse(taskItem.task, `${taskItem.id}: ${taskItem.task}`) +
      `\n\n*(Nota: Ocorreu um erro na requisição do Gemini. Exibindo conselho de contingência do Arquiteto).*`;
    return res.json({ text: offlineText, error: error.message, offline: true });
  }
});

// Vite Middleware integration for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
