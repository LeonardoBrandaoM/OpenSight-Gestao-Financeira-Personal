# TIPOGRAFIA — OpenSight

**Versão:** 1.0.0 · **Data:** 31/05/2026 · **Autor:** Leonardo Brandão Maia Filho

A tipografia do OpenSight equilibra **três vozes**: um display **técnico-militar** (a Warmind), um corpo **industrial e legível** (a estrutura), e um monoespaçado **tabular** para dados financeiros (o predador que conta cada centavo). Todas as famílias são **open-source** (Google Fonts), com bom suporte a latim e cirílico — reforçando a herança soviética.

---

## 1. FAMÍLIAS

### 1.1 Display — `Chakra Petch`
Fonte techno-militar, geométrica, com cortes angulares que evocam estêncil e HUD. **Uso:** títulos, números de destaque grandes, marcações de "selo", labels em caixa-alta.

- Pesos: **500 (Medium)**, **600 (SemiBold)**, **700 (Bold)**
- Caixa-alta com `letter-spacing` de **0.04em–0.08em** para o efeito "estêncil militar"
- *Alternativas equivalentes:* `Saira`, `Rajdhani`, `Oswald` (condensada)

### 1.2 Corpo — `IBM Plex Sans`
Neutra, industrial, com personalidade técnica sem ruído. Excelente legibilidade em telas escuras e suporte a cirílico/latim. **Uso:** texto corrido, parágrafos, UI, formulários.

- Pesos: **400 (Regular)**, **500 (Medium)**, **600 (SemiBold)**
- *Alternativas equivalentes:* `Inter`, `Roboto`

### 1.3 Dados / Mono — `IBM Plex Mono`
Monoespaçada da mesma superfamília, garantindo coesão. **Uso obrigatório para todo valor financeiro, código, IDs, timestamps e tabelas numéricas.**

- Pesos: **400 (Regular)**, **500 (Medium)**, **600 (SemiBold)**
- **Sempre com `font-variant-numeric: tabular-nums`** — números alinham em colunas, essencial para finanças
- *Alternativas equivalentes:* `JetBrains Mono`, `Roboto Mono`

---

## 2. IMPORT (frontend)

```css
/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
```

```css
:root {
  --font-display: 'Chakra Petch', 'Saira', system-ui, sans-serif;
  --font-body:    'IBM Plex Sans', 'Inter', system-ui, sans-serif;
  --font-mono:    'IBM Plex Mono', 'JetBrains Mono', monospace;
}
```

---

## 3. ESCALA TIPOGRÁFICA

Escala modular **1.250 (Major Third)**, base 16px.

| Token | Tamanho | Família | Peso | Uso |
|-------|---------|---------|------|-----|
| `display-xl` | 61px / 3.815rem | Display | 700 | Hero, números de saldo gigantes |
| `display-l` | 49px / 3.052rem | Display | 700 | Títulos de página |
| `h1` | 39px / 2.441rem | Display | 600 | Seção principal |
| `h2` | 31px / 1.953rem | Display | 600 | Subseção |
| `h3` | 25px / 1.563rem | Display | 500 | Card title / grupo |
| `body-l` | 20px / 1.25rem | Body | 400 | Texto de destaque |
| `body` | 16px / 1rem | Body | 400 | Texto padrão |
| `body-s` | 13px / 0.8rem | Body | 400 | Legendas, ajuda |
| `caption` | 11px / 0.7rem | Display | 600 | Labels caixa-alta, tags, eixos |
| `mono-l` | 24px / 1.5rem | Mono | 500 | Valor financeiro principal |
| `mono` | 16px / 1rem | Mono | 400 | Valores em tabela |
| `mono-s` | 13px / 0.8rem | Mono | 400 | IDs, timestamps, metadados |

---

## 4. REGRAS DE USO

### 4.1 Labels "estêncil militar"
Labels, tags, abas e eixos de gráfico usam **Display em CAIXA-ALTA** com tracking ampliado:

```css
.label-stencil {
  font-family: var(--font-display);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.7rem;
  color: var(--ash);
}
```

### 4.2 Valores financeiros (crítico)
Todo valor monetário usa **mono tabular**, com cor semântica (`gain`/`loss`) apenas no número:

```css
.valor {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}
.valor--ganho { color: var(--gain); }
.valor--perda { color: var(--loss); }   /* nunca o carmesim-marca */
```

Formato monetário BR: `R$ 1.234,56` — o símbolo `R$` pode vir em `ash`, o número em cor semântica.

### 4.3 Corpo de texto
- Altura de linha: **1.6** para parágrafos, **1.3** para títulos
- Largura máxima de leitura: **~70ch**
- Nunca justificar; sempre alinhado à esquerda
- Cor: `bone` para primário, `ash` para secundário

### 4.4 Não faça
- ❌ Display em parágrafos longos (cansativo)
- ❌ Números financeiros em fonte não-mono (desalinha colunas)
- ❌ Caixa-alta em blocos de texto corrido
- ❌ Mais de 3 famílias na mesma tela

---

## 5. EXEMPLO — Anatomia de um card de conta

```
┌─────────────────────────────────────┐
│ CONTA CORRENTE          [caption]    │  ← Display caps, ash, tracking 0.08em
│ Banco do Brasil         [body-s]     │  ← Body, ash
│                                      │
│ R$ 12.480,73            [mono-l]     │  ← Mono tabular, bone (ou gain/loss)
│ ▲ +R$ 320,10 (mês)      [mono-s]     │  ← Mono, gain (#2FA572)
└─────────────────────────────────────┘
```

---

**Fim do Documento**
