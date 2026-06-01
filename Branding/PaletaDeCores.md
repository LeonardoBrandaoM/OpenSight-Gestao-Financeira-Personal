# PALETA DE CORES — "Warmind Carmesim"

**Versão:** 1.0.0 · **Data:** 31/05/2026 · **Autor:** Leonardo Brandão Maia Filho

A paleta do OpenSight é construída sobre **escuridão + brasa**: o vazio metálico do Rasputin como base, o carmesim como assinatura, o âmbar/latão como detalhe nobre. Os tokens de implementação estão em [`Tokens/`](./Tokens/).

---

## 1. NÚCLEO DA MARCA — Carmesim Rasputin

O coração da identidade. **Use com escassez** (≤ 10% da área de tela).

| Token | HEX | RGB | Uso |
|-------|-----|-----|-----|
| `crimson` **(PRIMÁRIA)** | `#C1121F` | 193, 18, 31 | Ação primária, logo, brilho da harpia, foco de marca |
| `crimson-deep` | `#8A0B16` | 138, 11, 22 | Hover/pressed da primária, fundos carmesim profundos |
| `dried-blood` | `#6A040F` | 106, 4, 15 | Sombras carmesim, faixas escuras, vinhetas |
| `ember` **(ACCENT)** | `#F03A24` | 240, 58, 36 | Brasa viva: estados ativos, badges críticos, realces |
| `crimson-glow` | `#FF4D3D` | 255, 77, 61 | Glow/halo de "reator" (somente efeitos de luz, nunca texto) |

> **O "olho da harpia"** é sempre `ember` (#F03A24) com halo `crimson-glow`.

---

## 2. NEUTROS — Aço Soviético & Void

A estrutura inteira da interface. Frio, metálico, monolítico.

| Token | HEX | RGB | Uso |
|-------|-----|-----|-----|
| `void` | `#0A0B0D` | 10, 11, 13 | Fundo base da aplicação (o "vazio") |
| `obsidian` | `#121419` | 18, 20, 25 | Superfície nível 1 (containers, seções) |
| `gunmetal` | `#1C1F26` | 28, 31, 38 | Superfície nível 2 (cards, painéis) |
| `graphite` | `#2C3038` | 44, 48, 56 | Superfície nível 3, bordas, divisores |
| `steel` | `#4B515C` | 75, 81, 92 | Bordas ativas, ícones inativos, traços de grid |
| `ash` | `#8C929C` | 140, 146, 156 | Texto secundário, legendas, placeholders |
| `bone` | `#E8E4DB` | 232, 228, 219 | Texto primário (off-white, levemente quente) |

> O texto **não** é branco puro. É `bone` (#E8E4DB) — um osso levemente quente que evita o brilho clínico e combina com o aço.

---

## 3. METAL — Âmbar Warmind / Latão

O detalhe nobre. Evoca os displays âmbar e o metal envelhecido da Warmind. **Apenas em detalhes** — nunca grandes áreas.

| Token | HEX | RGB | Uso |
|-------|-----|-----|-----|
| `brass` | `#C8962C` | 200, 150, 44 | Divisores nobres, ícones de selo, número de destaque, ornamentos |
| `brass-bright` | `#E8B23E` | 232, 178, 62 | Hover de elementos em latão, micro-realces |
| `amber-signal` | `#E8A317` | 232, 163, 23 | Estado de aviso/atenção (warning semântico) |

---

## 4. SEMÂNTICAS FINANCEIRAS

Cores de **significado de dados**. Veja a *Regra do Duplo Vermelho* no [`GuiaDeMarca.md`](./GuiaDeMarca.md) §6.

| Token | HEX | RGB | Significado |
|-------|-----|-----|-------------|
| `gain` | `#2FA572` | 47, 165, 114 | Positivo / entrada / ganho / acima da meta |
| `gain-soft` | `#1E5C44` | 30, 92, 68 | Fundo sutil de área positiva (gráficos) |
| `loss` | `#E5484D` | 229, 72, 77 | Negativo / saída / prejuízo (**≠ carmesim-marca**) |
| `loss-soft` | `#5C1F24` | 92, 31, 36 | Fundo sutil de área negativa (gráficos) |
| `warning` | `#E8A317` | 232, 163, 23 | Atenção: meta próxima, consentimento expirando |
| `info` | `#5A92B0` | 90, 146, 176 | Informação neutra, dicas, estados de sincronização |
| `neutral` | `#8C929C` | 140, 146, 156 | Dados neutros / sem variação |

---

## 5. GRÁFICOS & DATAVIZ — Sequência categórica

Para categorização de gastos, séries e dashboards. Ordenada para máxima distinção sobre fundo `void`, mantendo o clima da marca:

| Ordem | Token | HEX | — |
|-------|-------|-----|---|
| 1 | `chart-1` | `#C1121F` | Carmesim |
| 2 | `chart-2` | `#C8962C` | Latão |
| 3 | `chart-3` | `#5A92B0` | Aço-azul |
| 4 | `chart-4` | `#2FA572` | Jade |
| 5 | `chart-5` | `#9B6BC9` | Ametista fria |
| 6 | `chart-6` | `#E8A317` | Âmbar |
| 7 | `chart-7` | `#6B7280` | Aço neutro |
| 8 | `chart-8` | `#D9737B` | Carmesim claro |

---

## 6. GRADIENTES & EFEITOS

| Nome | Definição | Uso |
|------|-----------|-----|
| **Reator** (glow) | radial `crimson-glow` → transparente | Halo do "olho", botão primário em foco |
| **Void Fade** | linear `void` → `obsidian` (180°) | Fundo de página, headers |
| **Aço Escovado** | linear `graphite` → `gunmetal` (135°) | Superfícies de painel |
| **Brasa** | linear `crimson-deep` → `ember` (135°) | Faixa de destaque, banner crítico |

---

## 7. CONTRASTE & ACESSIBILIDADE (WCAG)

Pares validados para **mínimo AA (4.5:1)** em texto normal:

| Texto | Sobre fundo | Razão | Nível |
|-------|-------------|-------|-------|
| `bone` #E8E4DB | `void` #0A0B0D | ~15.6:1 | AAA |
| `bone` #E8E4DB | `gunmetal` #1C1F26 | ~12.8:1 | AAA |
| `ash` #8C929C | `void` #0A0B0D | ~6.4:1 | AA |
| `bone` #E8E4DB | `crimson` #C1121F | ~5.1:1 | AA |
| `void` #0A0B0D | `brass` #C8962C | ~7.9:1 | AAA |

> **Regra:** carmesim como **fundo** sempre leva texto `bone` (nunca `ash`). Latão como fundo leva texto `void`. Nunca texto carmesim sobre void (reprova contraste — use `ember` se precisar de vermelho legível em texto, mas prefira evitar).

---

## 8. RESUMO RÁPIDO (copy-paste)

```
crimson      #C1121F   crimson-deep #8A0B16   dried-blood #6A040F
ember        #F03A24   crimson-glow #FF4D3D
void         #0A0B0D   obsidian     #121419   gunmetal    #1C1F26
graphite     #2C3038   steel        #4B515C   ash         #8C929C
bone         #E8E4DB
brass        #C8962C   brass-bright #E8B23E   amber-signal #E8A317
gain         #2FA572   loss         #E5484D   warning     #E8A317
info         #5A92B0
```

---

**Fim do Documento**
