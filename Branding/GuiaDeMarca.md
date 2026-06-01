# GUIA DE MARCA — OpenSight

## Sistema Visual "Warmind Carmesim"

**Versão:** 1.0.0
**Data:** 31/05/2026
**Status:** Draft
**Autor:** Leonardo Brandão Maia Filho
**Referência cruzada:** `Documentação/ArquiteturaOpenSight.md`

---

## 1. NARRATIVA DA MARCA

O OpenSight não é "mais um app de finanças". É um **guardião**. A inspiração estética nasce de duas figuras:

### 1.1 Rasputin — a Warmind

No universo de Destiny, **Rasputin** é uma *Warmind*: uma superinteligência militar da Era Dourada, construída para **proteger** a humanidade. Sua estética é **soviético-retrofuturista**: monolítica, brutalista, em aço e concreto, com o icônico **brilho carmesim** pulsando em meio à escuridão. É frio, antigo, imensamente poderoso — e absolutamente vigilante.

O OpenSight herda essa postura: um sistema **security-first**, **defense-in-depth**, que observa e protege os dados financeiros do usuário sem nunca tocá-los (modo estritamente READ-ONLY).

### 1.2 A Harpia — o animal-símbolo

A **harpia / gavião-real** (*Harpia harpyja*) é a ave de rapina mais poderosa das Américas e um ícone da fauna brasileira. Tem **visão aguçada**, garras descomunais, uma **crista dupla** que se ergue como uma coroa, e um olhar de predador de topo que nada escapa.

Ela é a tradução perfeita de **OpenSight**: *visão aberta, total, penetrante*. A harpia **vê tudo** do alto, identifica padrões, antecipa o movimento — exatamente o que o produto faz com analytics, projeções e detecção de anomalias.

### 1.3 A síntese

> **OpenSight = a harpia de aço da Warmind.**
> Um predador-guardião carmesim que enxerga cada centavo, prevê cada tendência, e jamais move um único real sem você.

---

## 2. PRINCÍPIOS ESTÉTICOS

Toda decisão visual deve passar por estes cinco princípios:

### P1 — Monolítico e blindado
Superfícies escuras, sólidas, com sensação de **peso e blindagem**. Cantos podem ser levemente chanfrados/angulares (chanfro de 2–4px), evocando placas de aço. Nada "fofo", nada arredondado em excesso.

### P2 — O carmesim é poder, não decoração
O vermelho-carmesim é a assinatura, mas é **escasso por design**. Aparece em: ação primária, alertas críticos, o brilho do "olho" da harpia, indicadores de estado ativo. Um dashboard inteiro vermelho destrói o conceito. **Regra prática: ≤ 10% da área de qualquer tela em carmesim.**

### P3 — Frio por padrão, quente no detalhe
A estrutura (fundos, painéis, bordas) é cinza-aço **frio**. O **âmbar/latão** da Warmind entra apenas em detalhes nobres: divisores, ícones de selo, números de destaque, micro-ornamentos.

### P4 — Geometria construtivista
Inspiração no construtivismo soviético: **diagonais fortes, hexágonos, linhas radiais, grids visíveis, simetria**. Ornamentos sutis de "engrenagem/circuito" são bem-vindos como textura de fundo (baixíssima opacidade).

### P5 — Vigilância silenciosa
Animações lentas, deliberadas, "mecânicas". Nada de bounce alegre. Estados ativos **pulsam como um reator** (glow lento). Transições com easing `ease-in-out` longas (250–400ms). A interface respira como uma máquina antiga e poderosa.

---

## 3. TERRITÓRIO VISUAL

**Está dentro do território:**
- Aço escovado, concreto, placas metálicas rebitadas
- Brilho carmesim pulsante em ambientes escuros (vibe "reator/sensor ativo")
- Estêncil militar, numeração de série, marcações de inventário
- Hexágonos, grids, linhas de varredura (scanlines sutis), HUD
- Iconografia de "selo" / brasão / emblema militar
- A silhueta angular da harpia e sua crista dupla

**Está FORA do território:**
- Gradientes pastel, cantos super-arredondados, ilustrações "flat" alegres
- Verde/azul como cores dominantes de marca (são apenas semânticos)
- Estética "fintech genérica" (roxo neon, glassmorphism colorido, emojis)
- Qualquer coisa que sugira leveza, descontração ou fragilidade
- Realismo fotográfico de aves (a harpia é sempre **estilizada/geométrica**)

---

## 4. PILARES DA APLICAÇÃO

| Pilar | Diretriz |
|-------|----------|
| **Cor** | Ver [`PaletaDeCores.md`](./PaletaDeCores.md). Fundo `void`, estrutura em aço, carmesim escasso, âmbar no detalhe. |
| **Tipografia** | Ver [`Tipografia.md`](./Tipografia.md). Display técnico-militar; corpo neutro-industrial; números **monoespaçados tabulares** para finanças. |
| **Símbolo** | Ver [`Simbolo-Harpia.md`](./Simbolo-Harpia.md). A harpia inscrita em selo hexagonal; o "olho" é o ponto focal carmesim. |
| **Voz** | Ver [`TomEVoz.md`](./TomEVoz.md). Sóbrio, preciso, protetor. Fala como um guardião — nunca como um vendedor. |
| **Movimento** | Lento, mecânico, pulsante. Glow de reator. Easing longo. |

---

## 5. DOS & DON'TS

| ✅ Faça | ❌ Não faça |
|---------|-------------|
| Usar `void`/`obsidian` como base de quase tudo | Telas claras (light mode) como padrão* |
| Reservar carmesim para ação primária e alerta | Pintar cards, gráficos e botões secundários de vermelho |
| Diferenciar **vermelho-marca** de **vermelho-perda** (ver §6) | Usar o mesmo vermelho para "botão" e "prejuízo" |
| Números financeiros em fonte mono tabular | Números em fonte display ou com kerning irregular |
| Âmbar/latão apenas em detalhes nobres | Âmbar como cor de grandes áreas |
| Harpia sempre estilizada e geométrica | Foto realista de ave ou clip-art |
| Espaço negativo generoso, sensação de "vazio do void" | Telas densas e poluídas |

\* *Light mode pode existir como tema secundário de acessibilidade, mas a **identidade-mãe é escura**.*

---

## 6. A REGRA DO DUPLO VERMELHO (crítico para finanças)

O OpenSight é um produto financeiro **e** uma marca vermelha. Isso cria um risco: confundir o **vermelho da marca** (poder/ação) com o **vermelho de perda** (dinheiro saindo). Para resolver:

- **Carmesim-marca** (`#C1121F`) → identidade, ação primária, brilho da harpia. **Mais escuro e profundo.**
- **Vermelho-perda** (`#E5484D`) → exclusivamente valores financeiros negativos. **Mais claro e levemente rosado.**
- **Verde-ganho** (`#2FA572`) → valores financeiros positivos. Jade frio, dessaturado.

> Botões e elementos de ação **nunca** usam o vermelho-perda; valores monetários negativos **nunca** usam o carmesim-marca. São propositalmente distintos.

---

## 7. CHECKLIST DE APROVAÇÃO DE PEÇA

Antes de publicar qualquer artefato visual, confirme:

- [ ] Fundo escuro (`void`/`obsidian`) como base?
- [ ] Carmesim ocupa ≤ 10% da área?
- [ ] Âmbar usado só em detalhe nobre?
- [ ] Vermelho-marca diferenciado de vermelho-perda?
- [ ] Números financeiros em mono tabular?
- [ ] Harpia (se presente) estilizada e geométrica?
- [ ] Contraste de texto ≥ WCAG AA (4.5:1)?
- [ ] Tom de voz sóbrio e protetor (sem hype)?

---

## HISTÓRICO DE REVISÕES

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 31/05/2026 | Leonardo Brandão Maia Filho | Versão inicial do guia de marca |

---

**Fim do Documento**
