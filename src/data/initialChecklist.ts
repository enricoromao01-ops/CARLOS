/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChecklistItem } from '../types';

export const INITIAL_CHECKLIST_ITEMS: ChecklistItem[] = [
  // PHASE 1: PREPARAÇÃO
  {
    id: 'PRE-01',
    phase: 'PREPARAÇÃO',
    task: 'Execução do SAP Readiness Check para S/4HANA e aplicação de Notas Técnicas',
    description: 'Executar o SAP Readiness Check 2.0 através do report /SDF/HANA_BW_SIZING no ECC. Analisar o dashboard de Simplification Items, tamanho de memória HANA e compatibilidade de Business Functions.',
    role: 'Basis',
    evidence: 'Relatório gerado no SAP Portal do Readiness Check com status Green/Yellow em itens críticos de infraestrutura.',
    status: 'Pendente',
    strategyCompatibility: 'ALL',
    s4Impact: 'Mapeia antecipadamente todos os itens de simplificação obrigatórios para a versão target do S/4HANA (ex: eliminação de LIS, conversão para FI-AA).'
  },
  {
    id: 'PRE-02',
    phase: 'PREPARAÇÃO',
    task: 'Sincronização CVI (Customer Vendor Integration) para Business Partners (BP)',
    description: 'Executar a conversão preparatória de Clientes/Fornecedores para Business Partners (BP) no ECC através das transações MDS_LOAD_COCKPIT e CVI_COCKPIT. Resolver todas as inconsistências de dados cadastrais e preencher campos obrigatórios.',
    role: 'Funcional FI/CO',
    evidence: 'Tabela CVI_CUST_LINK e CVI_VEND_LINK 100% sincronizadas. Erros zerados no monitor MDS_PPO2.',
    status: 'Pendente',
    strategyCompatibility: 'BROWNFIELD',
    s4Impact: 'No S/4HANA, o cadastro tradicional de Clientes (XD01/VD01) e Fornecedores (XK01/MK01) é obsoleto. Toda inteiração cadastral é feita centralizada na transação BP. Obrigatório antes do SUM.'
  },
  {
    id: 'PRE-03',
    phase: 'PREPARAÇÃO',
    task: 'Limpeza de Dados (Data Cleansing) e Arquivamento (Archiving) Específico do Piloto',
    description: 'Executar arquivamento de logs técnicos antigos (tabelas BALHDR, IDOCs, BDCP2) e transações antigas no escopo da filial piloto. Limpar dados inconsistentes de estoque e reconciliar balancetes.',
    role: 'Funcional MM/SD',
    evidence: 'Redução volumétrica medida em GB nas tabelas foco através da transação DB02. Relatório de inventário físico assinado do piloto.',
    status: 'Pendente',
    strategyCompatibility: 'ALL',
    s4Impact: 'HANA é um banco de dados in-memory; reduzir a volumetria reduz significativamente o custo de licenciamento (RAM sizing) e diminui drasticamente a janela de downtime técnico (SUM).'
  },
  {
    id: 'PRE-04',
    phase: 'PREPARAÇÃO',
    task: 'Pré-requisitos de Ativos Fixos (New Asset Accounting - FI-AA)',
    description: 'Executar o reconciliador de ativos fixos no ECC (reports RAABST01 e RAABST02). Garantir que o encerramento do exercício anterior em FI-AA esteja concluído (transação AJAB) e reconciliado com o Razão Geral (OAMK).',
    role: 'Funcional FI/CO',
    evidence: 'Notas SAP 2332030 aplicadas. Sem divergências apontadas no report de reconciliação ECC de ativos.',
    status: 'Pendente',
    strategyCompatibility: 'BROWNFIELD',
    s4Impact: 'O S/4HANA exige a ativação obrigatória do "New Asset Accounting". Estruturas antigas de tabelas de ativos como ANEP, ANEA, ANLP e ANLC são transformadas em visões de compatibilidade e a reconciliação pós-migração é feita na tabela ACDOCA.'
  },
  {
    id: 'PRE-05',
    phase: 'PREPARAÇÃO',
    task: 'Análise de Custom Code (ABAP) com ABAP Test Cockpit (ATC) e Simplification Item DB',
    description: 'Executar varredura de código customizado (Z e Y) no sistema ECC usando o ATC com check variant "S4HANA_READINESS". Exportar lista de correções de sintaxe de banco (selects sem chave nas velhas tabelas BSIS, BSIK, MSEG) e customizações obsoletas.',
    role: 'ABAP Dev',
    evidence: 'Relatório resumido com a priorização de correções de código (Erros de Prioridade 1 e 2 documentados).',
    status: 'Pendente',
    strategyCompatibility: 'BROWNFIELD',
    s4Impact: 'Garante que os programas Z não quebrem no S/4HANA devido à substituição/eliminação de tabelas lógicas (ex: agregados e índices de FI substituídos pela view de compatibilidade sobre ACDOCA).'
  },
  {
    id: 'PRE-06',
    phase: 'PREPARAÇÃO',
    task: 'Validação de Conectividade Base do Piloto (Sizing de Infraestrutura & Basis)',
    description: 'Dimensionamento do tamanho da instância HANA corporativa baseada no piloto (HANA TDI/Sizing). Configurar infraestrutura de rede, caminhos RFC e preparar o servidor de sandbox/piloto isolado para simulação de go-live.',
    role: 'Basis',
    evidence: 'Quick Sizer report assinado e canais VPN / MPLS para a localidade piloto validados com ping inferior a 15ms.',
    status: 'Pendente',
    strategyCompatibility: 'ALL',
    s4Impact: 'Infrastrutura de nuvem ou on-premise dimensionada corretamente para garantir a performance e a escalabilidade necessárias exigidas pela memória RAM in-memory do SAP HANA.'
  },
  {
    id: 'PRE-07',
    phase: 'PREPARAÇÃO',
    task: 'Remapeamento de T-Codes Obsoletos de Logística e Vendas para Fiori/MIGO',
    description: 'Identificar T-codes clássicos de logística que serão removidos (MB01, MB11, MB1A, MB1B, MB21 e MB31) e planejar a migração de fluxos de processos para a transação MIGO ou apps Fiori correspondentes.',
    role: 'Funcional MM/SD',
    evidence: 'Plano de treinamento operacional desenhado com 100% dos T-codes Mapeados no Manual de Processos do Piloto.',
    status: 'Pendente',
    strategyCompatibility: 'ALL',
    s4Impact: 'Simplificações de logística do S/4HANA eliminam redundâncias de interface. A transação unificada MIGO e apps Fiori substituem mais de 15 transações clássicas do ECC.'
  },

  // PHASE 2: CUTOVER (THE WEEKEND RUN)
  {
    id: 'CUT-01',
    phase: 'CUTOVER',
    task: 'Bloqueio de Usuários e Início do Downtime Técnico (ECC Lockout)',
    description: 'Enviar aviso corporativo (SM02), bloquear logins de usuários do piloto (exceto equipe técnica), encerrar todos os background jobs (BTCTRNS1) e desligar canais RFC ativos para conexões com sistemas satélites de remessa.',
    role: 'Basis',
    evidence: 'Log de usuários vazios no sistema ECC (AL08) e log de jobs pausados.',
    status: 'Pendente',
    strategyCompatibility: 'ALL',
    s4Impact: 'Assegura a consistência transacional absoluta congelando a gravação de banco de dados imediatamente antes do snapshot de backup pré-conversão.'
  },
  {
    id: 'CUT-02',
    phase: 'CUTOVER',
    task: 'Execução do SUM (Software Update Manager) com Conversão de Banco de Dados DMO',
    description: 'Disparar a ferramenta SUM em modo conversão S/4HANA com a opção DMO (Database Migration Option). Monitorar fases do SUM: UPTIME, SHADOW_SYSTEM, OFFLINE DOWNTIME e DATABASE MIGRATION.',
    role: 'Basis',
    evidence: 'Logs do SUM sem erros críticos. Status final do SUM indicando "Conversion completed successfully". HANA Studio acessível.',
    status: 'Pendente',
    strategyCompatibility: 'BROWNFIELD',
    s4Impact: 'Processo automatizado que realiza o upgrade do dicionário de dados (SAP DDIC), conversão lógica e migração física do banco (Oracle/DB2 -> SAP HANA) em uma única etapa.'
  },
  {
    id: 'CUT-03',
    phase: 'CUTOVER',
    task: 'Fator de Conversão de Dados Financeiros (FINS_MIGRATION) e Consolidação no ACDOCA',
    description: 'Rodar transações de migração de dados financeiros no S/4HANA (SPRO -> FINS_MIGRATION_START). Processar os steps de Business Partner CVI, Ledger Mapping, Ledger Geral de FI e mapeamento do Universal Journal.',
    role: 'Funcional FI/CO',
    evidence: 'Monitor de migração financeira FINS_MIGRATION_MONITOR 100% verde para todos os passos técnicos obrigatórios.',
    status: 'Pendente',
    strategyCompatibility: 'BROWNFIELD',
    s4Impact: 'Consolida todos os subledgers anteriores do ECC (FI-GL, FI-AP, FI-AR, FI-AA e CO) dentro da tabela Universal Journal "ACDOCA", reduzindo redundâncias e dispensando conciliações mensais.'
  },
  {
    id: 'CUT-04',
    phase: 'CUTOVER',
    task: 'Reconciliação Contábil e Migração do Ativo Fixo (New FI-AA) na ACDOCA',
    description: 'Após FINS_MIGRATION contábil, rodar a migração específica do subledger de Ativos Fixos. Validar os saldos migrados e reconciliar com o balanço de fechamento pré-conversão.',
    role: 'Funcional FI/CO',
    evidence: 'Transação FAGLF101 e relatórios de ativo fixo (S_ALR_87011964) reconciliados sem centavos de divergência.',
    status: 'Pendente',
    strategyCompatibility: 'BROWNFIELD',
    s4Impact: 'O banco de dados HANA passa a gerenciar a depreciação e movimentações do ativo fixo diretamente no ACDOCA no nível de item de documento, integrando-se nativamente com moedas paralelas.'
  },
  {
    id: 'CUT-05',
    phase: 'CUTOVER',
    task: 'Remediação e Ativação de Custom Code (Programas Z) em S/4HANA',
    description: 'Aplicar correções previamente mapeadas de custom code usando o Quick Fixer do Eclipse (ADT) ou manualmente nos reports/user-exits prioritários do piloto. Tratar selects em tabelas obsoletas convertendo-os para chamadas compatíveis ou utilizando views de compatibilidade do S/4HANA.',
    role: 'ABAP Dev',
    evidence: 'ATC rodado limpo para objetos remediados. Código Z ativo no ABAP Repository do S/4HANA.',
    status: 'Pendente',
    strategyCompatibility: 'BROWNFIELD',
    s4Impact: 'Programas customizados antigos do ECC precisam ser compatibilizados com o novo dicionário S/4HANA e código assíncrono para garantir não interrupção operacional.'
  },
  {
    id: 'CUT-06',
    phase: 'CUTOVER',
    task: 'Migração de Dados Logísticos para Novo Modelo de Dados Simplificado (MATDOC)',
    description: 'Executar reports de simplificação logística para ajustar tabelas de inventário antigas. Migrar dados históricos de MM-IM (tabelas MKPF/MSEG) para o novo formato compactado da tabela MATDOC.',
    role: 'Funcional MM/SD',
    evidence: 'Logs limpos de S/4HANA Logistics Data Migration Monitor. Quantidades e valores de estoque batendo com o final do ECC.',
    status: 'Pendente',
    strategyCompatibility: 'BROWNFIELD',
    s4Impact: 'MATDOC substitui o modelo antigo que fragmentava cabeçalho (MKPF) e itens (MSEG), melhorando expressivamente o tempo de execução do cálculo de MRP clássico / MRP Live.'
  },
  {
    id: 'CUT-07',
    phase: 'CUTOVER',
    task: 'Apontamento DNS de API Gateways e Switchover de Integrações para o Piloto',
    description: 'Alterar URLs de endpoints físicos, credenciais de segurança e rotas de roteamento no Middleware (SAP PO/CPI/MuleSoft) para apontamentos voltados ao novo servidor SAP S/4HANA.',
    role: 'Basis',
    evidence: 'Testes de ping e handshake SSL/TLS com sistemas satélites aprovados. Mock de envio de payload do middleware para S/4HANA okay.',
    status: 'Pendente',
    strategyCompatibility: 'ALL',
    s4Impact: 'Evita a perda de transações ou desvio de dados integrados (XML, Idocs, RFC) direcionando-os em tempo real ao novo core produtivo.'
  },

  // PHASE 3: TESTES E VALIDAÇÃO (SMOKE & HYPERCARE)
  {
    id: 'TST-01',
    phase: 'TESTES',
    task: 'Teste de Caixa-Preta (Smoke Test) de Lançamento e Razão Geral (Contabilidade)',
    description: 'Lançar documento contábil simples de teste (transação FB50), lançar baixa manual e consultar lançamento instantâneo na tabela ACDOCA via transação SE16N ou app Fiori correspondente.',
    role: 'Funcional FI/CO',
    evidence: 'Documento contábil registrado com sucesso, número do documento capturado e campos de controle preenchidos corretamentes em ACDOCA.',
    status: 'Pendente',
    strategyCompatibility: 'ALL',
    s4Impact: 'Valida a integridade do Universal Journal de ponta a ponta e assegura a funcionalidade básica do Razão Geral unificado.'
  },
  {
    id: 'TST-02',
    phase: 'TESTES',
    task: 'Smoke Test do Fluxo Logístico Order-To-Cash (O2C)',
    description: 'Criar uma Ordem de Vendas para cliente do piloto (VA01), gerar Ordem de Remessa/Delivery (VL01N), confirmar Saída de Mercadorias (VL02N) e faturar (VF01). Garantir emissão correta de Nota Fiscal/Documento de Faturamento com impostos.',
    role: 'Funcional MM/SD',
    evidence: 'Fluxo O2C encerrado com status Concluído. Documento de Fatura ativo e movimentação física gravada no MATDOC.',
    status: 'Pendente',
    strategyCompatibility: 'ALL',
    s4Impact: 'Testa a interoperabilidade de três submódulos críticos (SD, MM, FI) sob o modelo simplificado de banco HANA e as novas tabelas prontas de precificação.'
  },
  {
    id: 'TST-03',
    phase: 'TESTES',
    task: 'Smoke Test do Fluxo Logístico Procure-To-Pay (PTP)',
    description: 'Registrar Requisição de Compras no Piloto (ME51N), converter para Pedido de Compras (ME21N), efetuar Recebimento Físico MIGO (Mapeamento de Estoque) e registrar Nota e Fatura de Fornecedor via MIRO.',
    role: 'Funcional MM/SD',
    evidence: 'Entrada de mercadorias lançada gerando movimentação física + documento fiscal registrado. Passagem pelo Razão Geral de forma íntegra.',
    status: 'Pendente',
    strategyCompatibility: 'ALL',
    s4Impact: 'Confirma o correto funcionamento da transação MIGO sob o novo modelo MATDOC e as regras de controle de Business Partner de fornecedores.'
  },
  {
    id: 'TST-04',
    phase: 'TESTES',
    task: 'Validação de Conectividade e Integração com Sistemas Satélites em Tempo Real',
    description: 'Executar testes de recebimento e envio de dados simulando interfaces reais (ex: sistema de faturamento corporativo, CRM Salesforce, WMS em lote). Verificar processamento de IDOCs e logs de chamadas OData rest.',
    role: 'Pilot Lead',
    evidence: 'Transações de monitoramento de interface (WE20, SRT_MONI, CPI Logs) indicam 100% de transmissões corretas.',
    status: 'Pendente',
    strategyCompatibility: 'ALL',
    s4Impact: 'O S/4HANA expõe Web Services em REST/OData nativamente. Valida que os legados de ECC que usavam RFC/IDOC continuam compatíveis via visões S/4HANA.'
  },
  {
    id: 'TST-05',
    phase: 'TESTES',
    task: 'Avaliador de Performance e Usabilidade do SAP Fiori Launchpad para Usuários Piloto',
    description: 'Medir tempos de carregamento do SAP Fiori Launchpad em redes móveis e corporativas locais da filial piloto. Validar que as Tiles corretas baseadas nos perfis de negócio (Business Catalog) aparecem sem erros de kernel.',
    role: 'Pilot Lead',
    evidence: 'Métrica de tempo de resposta Fiori em transação FGI (Fiori Diagnostic) abaixo de 2 segundos. Checklist de testes de usabilidade assinado pelos usuários chaves.',
    status: 'Pendente',
    strategyCompatibility: 'ALL',
    s4Impact: 'Fiori é o novo front-end padrão do S/4HANA. Substitui a interface SAP GUI em grande parte das operações e necessita de verificação rigorosa de latência de rede.'
  },
  {
    id: 'TST-06',
    phase: 'TESTES',
    task: 'Teste de Autorização e GRC sob Novos Perfis de Perfis / Roles S/4HANA',
    description: 'Executar as transações e apps chave utilizando os perfis de usuário revisados para o piloto para identificar falhas de permissão (erros SU53) causadas pelas mudanças de T-codes obsoletos.',
    role: 'Security / GRC',
    evidence: 'Logs SU53 vazios após rodar todo o manual de faturamento. Auditoria de Segregação de Funções (SoD) realizada.',
    status: 'Pendente',
    strategyCompatibility: 'ALL',
    s4Impact: 'Como novos aplicativos e T-codes de controle são introduzidos, as permissões clássicas de SAP GUI perdem validade, necessitando novos catálogos baseados em perfis Fiori.'
  },

  // PHASE 4: CRITÉRIOS DE SUCESSO (EXIT & BLUEPRINT REVIEW)
  {
    id: 'EXT-01',
    phase: 'EXIT',
    task: 'Aprovação Contábil e Auditoria de Reconciliação Contábil ECC vs S/4HANA',
    description: 'Reunir com os controllers e controllers de planta da filial piloto para auditar se todas os saldos migrados fecham com os relatórios históricos contábeis gerados pré-conversão.',
    role: 'Negócio / SMEs',
    evidence: 'Ata de homologação contábil assinada por Diretor de Controladoria do Piloto. Relatórios comparativos em anexo.',
    status: 'Pendente',
    strategyCompatibility: 'BROWNFIELD',
    s4Impact: 'Garante o compliance absoluto da migração de dados históricos fiscais e financeiros com o fisco nacional e internacional.'
  },
  {
    id: 'EXT-02',
    phase: 'EXIT',
    task: 'Assinatura Oficial do Termo Go/No-Go para Rollout das Próximas Ondas (Onda 1)',
    description: 'Pilot Lead com o Comitê Executivo avalia o percentual de tickets de suporte abertos durante a primeira semana de hypercare. Confirmar estabilidade do ambiente e prontidão do core S/4HANA.',
    role: 'Pilot Lead',
    evidence: 'Termo de Encerramento do Piloto (Gate Approval) assinado e arquivado pelo PMO.',
    status: 'Pendente',
    strategyCompatibility: 'ALL',
    s4Impact: 'O piloto serve de laboratório vivo (rollout zero). Sua estabilidade determina a aprovação segura de investimento físico para as próximas filiais e divisões.'
  },
  {
    id: 'EXT-03',
    phase: 'EXIT',
    task: 'Consolidação de Lições Aprendidas e Atualização do Runbook / Manual de Conversão',
    description: 'Consolidar todas os problemas técnicos encontrados no sumário de lições aprendidas (ex: travamento do SUM, custom code Z contábil que falhou, ajuste de perfis). Ajustar o plano de corte (Cutover Runbook) para refletir os tempos reais refinados.',
    role: 'PM',
    evidence: 'Runbook v2.0 atualizado, com cronograma de horas de Cutover reduzido para a Onda 1 baseando-se no aprendizado do piloto.',
    status: 'Pendente',
    strategyCompatibility: 'ALL',
    s4Impact: 'Mitiga os riscos das próximas migrações aplicando melhorias contínuas, garantindo que os mesmos gargalos não se repitam nos rollouts globais.'
  },
  {
    id: 'EXT-04',
    phase: 'EXIT',
    task: 'Revisão de SLAs de Processamento e Desempenho Operacional (HANA DB Tuning)',
    description: 'Avaliar tempo de processamento de rotinas pesadas (ex: cálculo de MRP piloto, execução de reavaliação cambial, encerramento de período pós-conversão). Executar DB Tuning do banco de dados HANA se identificado gargalos.',
    role: 'Basis',
    evidence: 'Relatório do Monitor Hana (DBA_COCKPIT) atestando que tempos operacionais do piloto são iguais ou melhores que no ECC antigo.',
    status: 'Pendente',
    strategyCompatibility: 'ALL',
    s4Impact: 'Performance de longo prazo assegurada por otimização corretiva pós migração sobre o hardware in-memory.'
  }
];
