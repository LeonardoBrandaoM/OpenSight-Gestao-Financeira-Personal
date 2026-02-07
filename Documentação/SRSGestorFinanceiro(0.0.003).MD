
# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## Open Sight - Sistema de Gestão Financeira Pessoal via Open Finance

**Versão:** A | 0.0.003

**Data Inicial :** 29/09/2025  

**Status:** Draft  

**Autor:** Leonardo Brandão Maia Filho

**Organização:**

---

## 1. INTRODUÇÃO

### 1.1 Propósito
Este documento especifica os requisitos funcionais e não-funcionais para uma plataforma de gestão financeira pessoal que utiliza a Open Finance API para consolidação automática de dados bancários, categorização inteligente de transações e futuramente, projeção de cenários financeiros futuros, baseados no histórico individual de cada usuário

O sistema posiciona-se como uma camada de inteligência financeira, diferenciando-se por focar em projeções preditivas além do histórico de gastos.

### 1.2 Escopo do Produto

**Funcionalidades Incluídas:**
- Conexão segura com múltiplas instituições financeiras via Open Finance (modo somente leitura)
- Consolidação em tempo real de saldos, receitas e despesas
- Categorização automática de transações
- Dashboards analíticos com visualização de fluxo de caixa
- Projeções financeiras e simulação de cenários futuros
- Gestão de metas orçamentárias e alertas personalizados
- Compliance total com LGPD e regulamentações do Banco Central

**Funcionalidades Excluídas (Escopo Negativo):**
- Movimentação financeira (transferências, pagamentos, investimentos)
- Empréstimos ou serviços de crédito
- Funcionalidades de contabilidade empresarial ou fiscal

### 1.3 Definições, Acrônimos e Abreviações

| Termo | Definição |
|-------|-----------|
| **Open Finance** | Sistema regulado pelo Banco Central do Brasil para compartilhamento de dados financeiros entre instituições |
| **OAuth 2.0** | Protocolo de autorização aberto para acesso seguro a APIs |
| **LGPD** | Lei Geral de Proteção de Dados (Lei nº 13.709/2018) |
| **FIDC** | Fluxo de Informações de Dados do Cliente (padronização Open Finance) |
| **Read-Only** | Modo de acesso que impede qualquer movimentação ou alteração de dados financeiros |
| **AES-256** | Advanced Encryption Standard com chave de 256 bits |
| **SLA** | Service Level Agreement (Acordo de Nível de Serviço) |
| **MVP** | Minimum Viable Product (Produto Mínimo Viável) |
| **2FA** | Two-Factor Authentication (Autenticação de Dois Fatores) |

### 1.4 Referências

1. Banco Central do Brasil. *Regulamentação Open Finance*. Disponível em: https://www.bcb.gov.br/estabilidadefinanceira/openfinance
2. Lei nº 13.709, de 14 de agosto de 2018. *Lei Geral de Proteção de Dados Pessoais (LGPD)*.
3. ISO/IEC 27001:2013. *Information security management systems — Requirements*.
4. PCI DSS v4.0. *Payment Card Industry Data Security Standard*.

---

## 2. DESCRIÇÃO GERAL

### 2.1 Perspectiva do Produto

O sistema é uma aplicação SaaS (Software as a Service), multiplataforma (Web e Mobile(A priori somente web)), que atua como intermediária entre o usuário e suas instituições financeiras, oferecendo inteligência analítica sobre dados consolidados.

**Arquitetura de Alto Nível:**
| Camada | Componentes Principais | Responsabilidades e Tecnologias |
|--------|------------------------|---------------------------------|
| **Client Layer** | React, Vue, PWA, WebSockets | Interface do usuário (SPA), Cache local, suporte Offline e comunicação Realtime. |
| **Edge Layer** | CloudFlare, AWS CloudFront | Proteção perimetral (WAF, DDoS Protection), Rate Limiting e terminação TLS 1.3. |
| **API Gateway** | Kong, AWS Gateway | Autenticação JWT, SSL Termination e Roteamento de microserviços. |
| **Core & Auth** | OAuth2, 2FA, K8s, Docker | Gestão de identidade e orquestração de containers para serviços base. |
| **Processing Layer** | Microserviços de Negócio | User Mgmt, Conector Open Finance, ML (Categorização) e Motor de Analytics. |
| **Governance** | LGPD & Consentimentos | Gerenciamento de conformidade de dados e permissões do usuário. |
| **Infrastructure** | Redis, RabbitMQ | **Message Queue:** Sync Jobs assíncronos.<br>**Cache Layer:** Gestão de Sessão e baixa latência. |

### 2.2 Classes e Características de Usuários

| Perfil | Descrição | Volume Estimado | Necessidades Principais |
|--------|-----------|----------------|------------------------|
| **Usuário Padrão** | Pessoa física com 1-2 contas bancárias | 60% | Controle básico de gastos, categorização automática, alertas simples |
| **Usuário Avançado** | Múltiplas contas/cartões, organização financeira ativa | 30% | Análise detalhada por categorias, metas complexas, projeções de longo prazo |
| **Investidor** | Carteira diversificada, foco em patrimônio |>10% | Análise de rendimentos, evolução patrimonial, integração com investimentos |

### 2.3 Ambiente de Operação

**Infraestrutura:**
- **Provedor de Nuvem:** AWS ou Google Cloud Platform ou Oracle Cloude Interface
- **Localização:** Região São Paulo (Brasil) - obrigatório por compliance
- **Banco de Dados:** PostgreSQL 14+ (criptografia at-rest)
- **Cache:** Redis para dados temporários e sessões
- **Filas:** A definir

**Clientes Suportados:**
- Navegadores: Chrome , Firefox , Safari , Edge 
- Mobile: iOS , Android 
- Resoluções mínimas: 320px (mobile), 1024px (desktop)

### 2.4 Restrições e Dependências

**Restrições Regulatórias:**
- Dados financeiros não podem ser transferidos para fora do território brasileiro
- Obrigatoriedade de certificação como instituição regulada ou parceria com participante do Open Finance (Esperada :Pluggy)
- Modo estritamente read-only (impossibilidade técnica de transações ou armazenamento)

**Dependências Técnicas:**
- Disponibilidade das APIs do Open Finance (instituições participantes(Pluggy))
- Serviços de autenticação OAuth 2.0 dos bancos
- Conectividade de internet do usuário para sincronização

---

## 3. REQUISITOS FUNCIONAIS

### 3.1 Módulo de Autenticação e Segurança

#### RF-001 - Cadastro e Autenticação de Usuários
**Prioridade:** Alta  
**Descrição:** O sistema deve permitir o cadastro de novos usuários e autenticação segura.

**Requisitos Específicos:**
- Cadastro via email/senha ou Single Sign-On (Google, Apple)
- Validação de email mediante envio de link de confirmação
- Política de senha: mínimo 12 caracteres, incluindo maiúsculas, minúsculas, números e símbolos
- Autenticação de dois fatores (2FA) obrigatória via TOTP (Google Authenticator) ou SMS
- Bloqueio temporário após 5 tentativas falhas de login
- Logout em todos os dispositivos via configurações de segurança

#### RF-002 - Gestão de Consentimentos Open Finance
**Prioridade:** Alta  
**Descrição:** Interface para autorização e revogação de compartilhamento de dados bancários.

**Requisitos Específicos:**
- Redirecionamento seguro para ambiente da instituição financeira via OAuth 2.0
- Visualização clara e granular do escopo de dados solicitados (saldo, transações, limites)
- Dashboard consolidado de todas as instituições conectadas
- Possibilidade de revogar consentimento individual por instituição
- Alerta automático 7 dias antes da expiração do consentimento (vigência padrão: 90 dias)
- Histórico de logs de consentimentos (data, escopo, IP, user-agent)

#### RF-003 - Sincronização de Dados Bancários
**Prioridade:** Alta  
**Descrição:** Coleta automática e sob demanda de dados via Open Finance API.

**Requisitos Específicos:**
- Sincronização automática a cada 6 horas
- Sincronização manual sob demanda (respeitando rate limits)
- Suporte a múltiplas instituições simultâneas (limite: 10 contas por usuário)
- Tratamento de falhas com retry automático (exponential backoff)
- Indicador visual de status: sincronizado, em andamento, falha, autenticação necessária
- Armazenamento de última atualização por instituição

### 3.2 Módulo de Processamento e Categorização

#### RF-004 - Categorização Automática de Transações
**Prioridade:** Alta  
**Descrição:** Classificação inteligente de transações em categorias predefinidas utilizando machine learning.

**Categorias Base:**
1. Alimentação (supermercado, restaurantes, delivery)
2. Transporte (combustível, transporte público, aplicativos)
3. Moradia (aluguel, condomínio, energia, água, internet)
4. Saúde (plano de saúde, medicamentos, consultas)
5. Educação (mensalidades, cursos, materiais)
6. Lazer (cinema, viagens, hobbies, assinaturas)
7. Compras (vestuário, eletrônicos, presentes)
8. Serviços (telefone, seguros, manutenção)
9. Investimentos (aplicações, resgates, dividendos)
10. Receitas (salário, freelance, rendimentos)
11. Transferências (PIX, TED entre contas próprias)
12. Outros

**Requisitos Específicos:**
- Algoritmo de ML com acurácia mínima de 85% na categorização automática
- Possibilidade de recategorização manual pelo usuário
- Sistema de aprendizado: utilizar correções do usuário para melhorar futuras categorizações
- Criação de regras personalizadas (ex: "Todo PIX para [Nome] = Categoria X")
- Sugestão de categoria durante digitação para inclusão manual

#### RF-005 - Consolidação de Saldos e Posição Financeira
**Prioridade:** Alta  
**Descrição:** Visualização unificada de saldos de múltiplas contas e cartões.

**Requisitos Específicos:**
- Cálculo de saldo total consolidado em tempo real após sincronização
- Distinção entre: saldo disponível, saldo contábil, limite de crédito disponível
- Conversão automática para BRL quando houver contas em moeda estrangeira (cotação do dia)
- Alerta visual para saldo negativo consolidado ou próximo de zero
- Gráfico de evolução do patrimônio líquido ao longo do tempo

### 3.3 Módulo de Visualização e Analytics

#### RF-006 - Dashboard Principal
**Prioridade:** Alta  
**Descrição:** Visão geral consolidada da situação financeira do usuário.

**Componentes Obrigatórios:**
- Card de saldo total consolidado (todas as instituições)
- Gráfico de fluxo de caixa: receitas vs despesas (últimos 6 meses)
- Lista das últimas 10 transações com indicador de categoria
- Resumo de gastos por categoria no mês atual (gráfico donut)
- Alertas e notificações importantes (vencimentos, metas, anomalias)
- Comparativo percentual: mês atual vs mês anterior
- Acesso rápido para sincronização manual e configurações

#### RF-007 - Análise Detalhada por Categoria
**Prioridade:** Média  
**Descrição:** Drill-down detalhado de gastos por categoria específica.

**Requisitos Específicos:**
- Gráficos interativos (barras, linhas, pizza) filtráveis por período
- Navegação hierárquica: Categoria Principal → Subcategoria → Transações individuais
- Comparativo de períodos: semanal, mensal, trimestral, anual
- Identificação de maiores gastos (top 5 estabelecimentos/categorias)
- Indicador de variação em relação à média histórica (ex: "Você gastou 30% a mais em Alimentação este mês")
- Exportação de dados para CSV/Excel

#### RF-008 - Projeções Financeiras (Diferencial do Produto)
**Prioridade:** Alta (Altissima complexidade) 
**Descrição:** Simulação e projeção de cenários financeiros futuros baseados em histórico.

**Funcionalidades:**
- Projeção de saldo em 3, 6 e 12 meses baseada em média de gastos/receitas
- Simulador "E se...": permitir ajuste de variáveis (redução/aumento de gastos em categorias específicas)
- Identificação de tendências: crescimento de gastos em categorias específicas ao longo do tempo
- Previsão de "falta de dinheiro": alerta quando projeção indica saldo negativo futuro
- Cenários: otimista (redução de 10% em gastos variáveis), realista (média histórica), pessimista (aumento de 10%)
- Calendário de previsão: visualização diária de saldo previsto considerando receitas e despesas recorrentes

#### RF-009 - Gestão de Metas Orçamentárias
**Prioridade:** Média  
**Descrição:** Definição e acompanhamento de limites de gastos por categoria.

**Requisitos Específicos:**
- Criação de metas mensais por categoria (valor máximo de gasto)
- Alertas progressivos: 50%, 80%, 100% do limite atingido
- Barra de progresso visual por categoria (cor verde/amarelo/vermelho conforme proximidade do limite)
- Histórico de cumprimento de metas (taxa de sucesso ao longo dos meses)
- Sugestão automática de metas baseadas em média dos últimos 3 meses menos 10%

### 3.4 Módulo de Comunicação e Alertas

#### RF-010 - Notificações Inteligentes
**Prioridade:** Média  
**Descrição:** Sistema de alertas proativos sobre situação financeira.

**Triggers de Notificação:**
- Gasto atípico detectado (acima de 2 desvios padrão da média histórica na categoria)
- Aproximação de limite de meta (80% atingido)
- Transação em alta valor (acima de R$ 1.000 ou configuração do usuário)
- Falha na sincronização de conta por mais de 24 horas
- Novo consentimento necessário (próximo à expiração)
- Previsão de saldo negativo baseada em projeções
- Resumo semanal por email (opcional)

**Canais:** Push notification (mobile), Email, In-app notification

#### RF-011 - Relatórios Periódicos
**Prioridade:** Baixa  
**Descrição:** Envio de relatórios consolidados via email.

**Requisitos:**
- Frequências: Semanal, Mensal, Anual (configurável pelo usuário)
- Conteúdo: Resumo de receitas e despesas, evolução patrimonial, categorias de maior gasto, dicas personalizadas baseadas em padrões
- Formato: Email responsivo HTML + anexo PDF opcional
- Opt-in/out configurável

---

## 4. REQUISITOS NÃO-FUNCIONAIS

### 4.1 Segurança (Crítico)

#### RNF-001 - Criptografia de Dados
**Obrigatório:**
- Dados em repouso: AES-256
- Dados em trânsito: TLS 1.3 (mínimo 1.2)
- Tokens de acesso bancário: criptografia assimétrica RSA-4096
- Chaves de criptografia: armazenadas em HSM (Hardware Security Module) ou AWS KMS com rotação automática trimestral
- Hash de senhas: bcrypt com salt (custo mínimo 12)

#### RNF-002 - Arquitetura Read-Only
**Imperativo Absoluto:**
- O sistema deve operar estritamente em modo de leitura
- Impossibilidade técnica de realizar transferências, pagamentos, investimentos ou qualquer operação de escrita nas instituições financeiras
- Auditoria trimestral de pentest para validação da impossibilidade de operações de escrita

#### RNF-003 - Compliance LGPD
**Requisitos Legais:**
- Termo de consentimento livre, específico e informado (em linguagem clara)
- Dashboard de privacidade acessível ao usuário:
  - Visualização de todos dados armazenados
  - Histórico de acessos e compartilhamentos
  - Portabilidade de dados (exportação em CSV/JSON)
  - Exclusão definitiva de conta e dados (direito ao esquecimento)
- Registro de auditoria (logs) mantidos por 5 anos
- Nomeação de DPO (Data Protection Officer) com canal de contato visível
- Data breach notification em até 72 horas após descoberta

#### RNF-004 - Controle de Acesso e Autenticação
- OAuth 2.0 + OpenID Connect para integração bancária (fluxo Authorization Code + PKCE)
- JWT tokens de acesso com expiração de 15 minutos (web)
- Refresh tokens com expiração de 30 dias (mobile)
- Rate limiting: máximo 100 requisições/minuto por IP, 10 tentativas de login/hora por usuário
- Bloqueio automático de conta após 5 tentativas falhas de 2FA

### 4.2 Performance e Escalabilidade

#### RNF-005 - Tempos de Resposta
- Carregamento inicial do dashboard: < 5 segundos (95%)
- Consulta de transações (últimos 90 dias): < 10 segundo
- Sincronização de dados por instituição: < 30 segundos
- Geração de projeções financeiras: < 30 segundos
- Upload de arquivos (se aplicável): < 15 segundos para 5MB

#### RNF-006 - Disponibilidade e Confiabilidade
- SLA de 99.9% uptime (máximo 8.76 horas de indisponibilidade por ano)
- Backup automático diário com retenção de 30 dias (hot) e 5 anos (cold)
- RPO (Recovery Point Objective): máximo 1 hora de perda de dados
- RTO (Recovery Time Objective): máximo 4 horas para restauração completa
- Janela de manutenção programada: domingos, 02h às 06h (horário de Brasília)

#### RNF-007 - Capacidade e Escalabilidade
- Suporte inicial a 10.000 usuários ativos simultâneos
- Arquitetura escalável horizontalmente para 100.000+ de usuários
- Processamento de 10 milhões de transações/mês na fase inicial
- Auto-scaling baseado em carga (CPU > 70% ou memória > 80%)

### 4.3 Usabilidade e Acessibilidade

#### RNF-008 - Interface do Usuário
- Design responsivo (Mobile First) adaptável a telas de 320px a 1920px+
- Suporte a temas: Claro (light mode) e Escuro (dark mode)
- Linguagem simples e clara (evitar jargões financeiros sem explicação)
- Tooltips explicativos em todos os elementos técnicos
- Onboarding guiado para primeiro acesso (ideal : máximo 5 passos)

#### RNF-009 - Acessibilidade
- Conformidade WCAG 2.1 nível AA
- Suporte a leitores de tela (screen readers): ARIA labels, roles semânticos
- Navegação completa via teclado (tabindex lógico)
- Contraste mínimo 4.5:1 para textos
- Fonte redimensionável até 200% sem perda de funcionalidade
- Alternativas textuais para todos os gráficos e imagens

### 4.4 Manutenibilidade e Qualidade

#### RNF-010 - Código e Documentação
- Cobertura de testes automatizados: mínimo 80% (unitários + integração)
- Documentação de API no padrão OpenAPI 3.0
- Logs estruturados (JSON) com níveis apropriados (ERROR, WARN, INFO, DEBUG)
- Monitoramento contínuo (APM) com alertas para erro 500, latência alta

#### RNF-011 - Compatibilidade
- Retrocompatibilidade: suporte a 2 versões anteriores da API mobile
- Graceful degradation: funcionalidades essenciais operam mesmo com JavaScript desabilitado (versão estática)

---

## 5. REQUISITOS DE INTERFACE

### 5.1 Interfaces de Usuário (UI)

**Fluxos de Navegação Principais:**

1. **Fluxo de Primeiro Acesso:**
   Landing Page → Cadastro/Login → 2FA → Tour Guiado → Conectar Primeiro Banco → Dashboard

2. **Fluxo de Uso Diário:**
   Login (biometria) → Dashboard → Verificar Saldos → Análise Rápida → Sincronização (se necessário)

3. **Fluxo de Análise Financeira:**
   Dashboard → Relatórios → Selecionar Período → Filtrar Categorias → Exportar/Compartilhar

**Telas Principais:**

- **Tela de Login:** Clean, fundo branco/cinza claro, destaque para selos de segurança (cadeado, "Banco Central Regulado")
- **Dashboard:** Cards com métricas principais no topo, gráfico central de evolução, lista de transações recentes na lateral/baixo
- **Tela de Transações:** Tabela/Lista com filtros laterais, busca por texto, botão de recategorização
- **Tela de Projeções:** Gráfico de linhas com múltiplas séries (cenários), controles deslizantes para simulação
- **Tela de Configurações:** Abas para Perfil, Segurança, Bancos Conectados (com botões de revogação), Preferências de Notificação

### 5.2 Interfaces de Software (APIs e Integrações)

**Integrações Externas Obrigatórias:**
- **Open Finance API Brasil:** Versão 3.0 ou superior (Fase 3 - Dados de Contas e Transações)
- **Provedores de Identidade:** Google Identity Platform, Sign in with Apple
- **Serviços de Email:** SendGrid, AWS SES ou Mailgun (para transacionais e newsletters)
- **Push Notifications:** Firebase Cloud Messaging (FCM) para Android, APNS para iOS
- **Analytics:** Google Analytics 4 (anônimo, sem PII) ou Mixpanel
- **Monitoramento:** DataDog, New Relic ou similar

**APIs Internas:**
- RESTful API para comunicação frontend-backend (JSON)
- Autenticação via JWT Bearer tokens
- Versionamento de API: /api/v1/, /api/v2/

### 5.3 Interfaces de Hardware

- **Sensor de Biometria:** Suporte a Touch ID (iOS), Face ID (iOS), Impressão digital (Android), Windows Hello (Desktop)
- **Câmera:** Para escaneamento de QR Code (facilitar conexão OAuth em mobile)
- **Requisitos Mínimos de Dispositivo:** 2GB RAM, 100MB espaço livre (para cache offline)

---

## 6. REQUISITOS DE DADOS

### 6.1 Modelo de Dados Lógico

**Entidades Principais:**

| Entidade | Descrição | Campos Principais |
|----------|-----------|-------------------|
| **Usuario** | Cadastro do usuário | id, email, nome_completo, hash_senha, data_criacao, email_verificado, data_ultimo_acesso |
| **InstituicaoConectada** | Bancos conectados via Open Finance | id, usuario_id, instituicao_id, access_token (criptografado), refresh_token, data_conexao, data_expiracao_consentimento, status |
| **Conta** | Contas corrente, poupança, crédito | id, instituicao_conectada_id, tipo (corrente/poupanca/credito), agencia, numero_conta, saldo_atual, limite_total, moeda |
| **Transacao** | Movimentações financeiras | id, conta_id, valor, data_transacao, descricao_original, descricao_user, categoria_id, tipo (debito/credito), status (efetivada/pendente) |
| **Categoria** | Classificação de gastos | id, nome, icone, cor, tipo (receita/despesa/transferencia), usuario_id (null para defaults) |
| **MetaOrcamentaria** | Limites de gastos | id, usuario_id, categoria_id, valor_limite, mes_ano, alerta_80_enviado |
| **Projecao** | Cenários simulados | id, usuario_id, nome_cenario, data_criacao, params_json (variáveis ajustadas), resultado_json |

### 6.2 Políticas de Retenção e Arquivamento

- **Dados de Transações:** Retenção mínima de 5 anos (obrigatoriedade legal contábil/fiscal)
- **Dados de Consentimento:** Retenção de 5 anos após revogação (auditoria)
- **Logs de Auditoria (Acesso):** 5 anos
- **Dados de Usuário Inativo:** Notificação após 1 ano de inatividade, anonimização ou exclusão opcional após 2 anos
- **Backup:** Hot (últimos 30 dias disponíveis imediatamente), Cold (até 5 anos, recuperação em até 24h)

### 6.3 Qualidade de Dados

- **Validação:** Valores monetários em centavos (inteiro), datas no formato ISO 8601, campos obrigatórios não nulos
- **Normalização:** Descrições de transações truncadas/limpas (remover caracteres especiais desnecessários)
- **Deduplicação:** Identificação e eliminação de transações duplicadas baseadas em hash (instituicao + data + valor + descricao)

---

## 7. REGRAS DE NEGÓCIO

### RN-001 - Aprendizado de Máquina para Categorização
Se um usuário alterar manualmente a categoria de uma transação com descrição similar (95% de similaridade textual) por 3 vezes consecutivas, o sistema deve criar uma regra implícita e aplicar automaticamente essa categoria para futuras transações com padrão similar por 6 meses.

### RN-002 - Expiração e Renovação de Consentimento
Consentimentos Open Finance têm validade máxima de 90 dias. O sistema deve:
- Alertar o usuário no dia 83 (7 dias antes)
- Bloquear sincronização automática no dia 91
- Permitir renovação em fluxo simplificado (1 clique) mantendo histórico de dados anteriores

### RN-003 - Limites de Sincronização
Por limitações técnicas e custos de API:
- Máximo de 1 sincronização manual a cada 4 horas por instituição
- Máximo de 10 instituições conectadas simultaneamente por usuário
- Dados históricos limitados aos últimos 24 meses ( restrição Open Finance)

### RN-004 - Cálculo de Projeções
Projeções financeiras só serão exibidas se o usuário possuir:
- Histórico mínimo de 60 dias de dados sincronizados, OU
- Mínimo de 20 transações registradas
Caso contrário, exibir mensagem orientando o usuário a aguardar mais dados.

### RN-005 - Consolidação de Transferências entre Contas Próprias
Quando detectada transação de saída em uma conta e transação de entrada correspondente (mesmo valor, data +/- 1 dia, descrição similar) em outra conta do mesmo usuário, ambas devem ser categorizadas como "Transferência" e não computadas como despesa nem receita no fluxo de caixa consolidado.

### RN-006 - Alerta de Gasto Atípico
Um gasto é considerado atípico se:
- Valor > 2 desvios padrão da média da categoria nos últimos 3 meses, E
- Valor > R$ 100,00 (evitar alertas para valores irrelevantes)

### RN-007 - Privacidade de Dados Agregados
Dados utilizados para treinamento de modelos de ML (categorização) devem ser anonimizados (remoção de IDs, nomes, valores exatos arredondados para múltiplos de 10) antes do processamento em ambientes de analytics.

---

## 8. CRITÉRIOS DE ACEITAÇÃO GERAIS

O sistema será considerado aceito para produção quando:

1. **Funcionalidade:** 100% dos RF de prioridade Alta implementados e testados
2. **Segurança:** Aprovação em pentest externo, certificação de conformidade LGPD
3. **Performance:** Tempos de resposta conforme rnf-005 em ambiente de produção
4. **Qualidade:** Cobertura de testes > 80%, zero bugs críticos (que causem perda de dados ou segurança)
5. **Usabilidade:** Aprovação em teste de usabilidade com 10 usuários beta (SUS score > 80)
6. **Compliance:** Homologação técnica com pelo menos 5 instituições financeiras participantes do Open Finance

---

## 9. APÊNDICES

### Apêndice A - Benchmark e Referências Competitivas

**Visor Finance (Principal Referência):**
- Foco em projeções temporais e "futuro financeiro"
- Interface minimalista e limpa
- Forte ênfase em segurança e conformidade

**Outras Referências:**
- **Mobills:** Categorização detalhada e metas visuais
- **Guiabolso:** Experiência de conexão bancária e cashback
- **Organizze:** Simplicidade e educação financeira
- **YNAB (You Need A Budget):** Metodologia de planejamento propositivo

### Apêndice B - Roadmap de Desenvolvimento experado 

**Fase 1 - MVP (Meses 1-3):**
- RF-001 (Autenticação), RF-002 (Consentimento), RF-003 (Sincronização)
- RF-005 (Consolidação), RF-006 (Dashboard básico)
- Conexão com Top 5 bancos (Itaú, Bradesco, Nubank, Inter, Caixa)

**Fase 2 - Inteligência (Meses 4-8):**
- RF-004 (Categorização ML), RF-007 (Análise detalhada)
- RF-010 (Notificações básicas)
- App mobile nativo (iOS/Android)

**Fase 3 - Diferenciação (Meses 9-11):**
- RF-008 (Projeções financeiras), RF-009 (Metas)
- RF-011 (Relatórios)
- Cobertura total de instituições Open Finance (100+)

**Fase 4 - Escala (Mês 12+):**
- Recursos sociais (compartilhamento de metas com família)
- Open Insurance (dados de seguros)
- OpenData (dados abertos para comparação de mercado)

### Apêndice C - Glossário de Termos Financeiros/Open Finance

- **Consentimento:** Autorização expressa do titular para compartilhamento de dados
- **DPO:** Data Protection Officer (Encarregado de Dados LGPD)
- **FIDC:** Fluxo de Informações de Dados do Cliente (padrão de dados do Open Finance)
- **Payload:** Conjunto de dados transmitidos em uma chamada de API
- **Webhook:** Mecanismo de callback para notificações em tempo real
- **PKCE:** Proof Key for Code Exchange (extensão de segurança OAuth 2.0 para mobile)

---

## 10. HISTÓRICO DE REVISÕES

| Versão | Data | Autor | Descrição das Alterações |
|--------|------|-------| ------------------------- |
| 0.0.001 | 29/09/2025 | Leonardo Brandão Maia Filho | Versão inicial do documento |
| 0.0.002 | 17/11/2025 | Leonardo Brandão Maia Filho | Organização de RFs & RNFs, e correções ortograficas |
| 0.0.003 | 18/12/2025 | Leonardo Brandão Maia Filho | Adição de potencial operadora & RFs  |
| | | | |

---

**Fim do Documento**

*Este SRS deve ser revisado e aprovado por:*
- *Product Owner*
- *Arquiteto de Software*
- *DPO (Oficial de Proteção de Dados)*
- *Representante de Segurança da Informação*
- *Eu Sou Todos eles*
