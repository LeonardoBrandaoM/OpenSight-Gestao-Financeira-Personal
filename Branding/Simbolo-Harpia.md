# SÍMBOLO & LOGO — A Harpia de Aço

**Versão:** 1.0.0 · **Data:** 31/05/2026 · **Autor:** Leonardo Brandão Maia Filho

---

## 1. CONCEITO

O símbolo do OpenSight é a **cabeça frontal de uma harpia / gavião-real** (*Harpia harpyja*), **inscrita em um selo hexagonal** de Warmind. É ao mesmo tempo:

- **Ave de rapina** → visão, vigilância, predação de padrões (*OpenSight*)
- **Selo militar / emblema de IA** → guardião, autoridade, segurança (*Rasputin*)

O ponto focal absoluto é **o olho** — um único ponto de luz carmesim/brasa, o "reator" que prova que a máquina está **viva e observando**.

---

## 2. ANATOMIA DA MARCA

```
            ╱╲      ╱╲          ← crista dupla (duas "asas" angulares
           ╱  ╲    ╱  ╲            erguidas, a coroa da harpia)
          ╱    ╲  ╱    ╲
         ┌──────────────┐
        │   ◣        ◢   │       ← arcos superciliares angulares (o "cenho")
        │   ●        ●   │       ← OLHOS: o esquerdo apagado (steel),
        │       ▼        │          o direito = OLHO-REATOR (ember + glow)
        │      ╱ ╲       │       ← bico ganchudo, geométrico, descendo ao centro
         ╲    ╱   ╲    ╱
          ╲__╱     ╲__╱
        [ hexágono de selo, borda em latão ]
```

**Elementos obrigatórios:**
1. **Crista dupla** — duas formas triangulares/aladas erguidas no topo. É a assinatura inconfundível da harpia.
2. **Olho-reator** — um olho em `ember` (#F03A24) com halo `crimson-glow`. O outro olho pode ser `steel` (assimetria intencional: "um olho que vê tudo").
3. **Bico ganchudo angular** — descendo ao eixo central, em facetas geométricas.
4. **Selo hexagonal** — contorno em `brass`, evocando emblema de Warmind / placa de inventário militar.

---

## 3. CONSTRUÇÃO & GRID

- Desenhar sobre **grid hexagonal**; tudo simétrico no eixo vertical (exceto o olho-reator).
- **Apenas linhas retas e facetas** — construtivismo, não orgânico. Curvas só em raios mínimos de canto.
- Espessura de traço consistente (sistema de 2px na escala base de 240px).
- Ângulos preferenciais: 30°, 60°, 90°, 120° (geometria hexagonal).

---

## 4. VARIAÇÕES DO LOGO

| Variação | Descrição | Uso |
|----------|-----------|-----|
| **Emblema** | Símbolo completo no selo hexagonal | App icon, favicon, splash, marca d'água |
| **Símbolo simples** | Só a cabeça da harpia, sem hexágono | Espaços apertados, ícone de menu |
| **Lockup horizontal** | Símbolo + "OPENSIGHT" (Display caps) à direita | Header, documentos, e-mails |
| **Lockup vertical** | Símbolo acima de "OPENSIGHT" | Splash, materiais de marca |
| **Wordmark** | Só "OPENSIGHT" em Chakra Petch caps, tracking 0.08em | Contextos sem espaço para símbolo |
| **Monocromático** | Tudo em `bone` ou tudo em `void` | Impressão 1 cor, fundos complexos |

---

## 5. ÁREA DE PROTEÇÃO & TAMANHO MÍNIMO

- **Área de respiro:** margem livre = altura do hexágono ÷ 2 em todos os lados.
- **Tamanho mínimo:** 24px (favicon) para o símbolo; 120px de largura para o lockup horizontal.
- **Fundo preferencial:** `void` ou `obsidian`. Sobre fundos claros, usar a variação monocromática `void`.

---

## 6. NÃO FAÇA

- ❌ Foto ou ilustração realista de harpia
- ❌ Remover a crista dupla (descaracteriza a ave)
- ❌ Ambos os olhos acesos (perde o conceito do "olho-reator")
- ❌ Trocar o carmesim do olho por outra cor
- ❌ Distorcer proporção, aplicar sombra drop "fofa" ou bevel 3D brega
- ❌ Rotacionar o emblema

---

## 7. ARTE FINAL — Prompt para geração/ilustração

> Quando for produzir a arte vetorial definitiva (designer ou geração de imagem), use como briefing:

```
Emblema vetorial minimalista e geométrico de uma cabeça frontal de harpia
(gavião-real brasileiro) com crista dupla erguida, inscrita em um selo
hexagonal. Estilo construtivista soviético / retrofuturista militar, inspirado
na Warmind "Rasputin" de Destiny. Facetas angulares, linhas retas, simetria.
Paleta: fundo quase-preto (#0A0B0D), estrutura em aço/grafite (#2C3038,
#4B515C), contorno do selo em latão (#C8962C). UM olho aceso em vermelho-brasa
(#F03A24) com halo de brilho (glow), o outro olho apagado em aço. Bico ganchudo
angular. Sensação de máquina-guardiã antiga, vigilante e poderosa. Vetorial,
flat, alto contraste, sem gradientes fotográficos, sem texto. Fundo escuro.
```

Negativos sugeridos: `realista, penas detalhadas, fofo, colorido demais, 3D bevel, sombras suaves, texto, gradiente arco-íris`.

---

## 8. ARQUIVOS DO SÍMBOLO

A marca já existe em vetor (SVG, editável e escalável) e em PNG @2x (fundo transparente, prontos para uso direto):

| Variação | Vetor | Bitmap |
|----------|-------|--------|
| Símbolo (harpia isolada) | [`Assets/simbolo-harpia.svg`](./Assets/simbolo-harpia.svg) | `Assets/simbolo-harpia.png` (512×512) |
| Emblema (selo hexagonal) | [`Assets/emblema-opensight.svg`](./Assets/emblema-opensight.svg) | `Assets/emblema-opensight.png` (512×512) |
| Lockup horizontal | [`Assets/lockup-horizontal.svg`](./Assets/lockup-horizontal.svg) | `Assets/lockup-horizontal.png` (1720×512) |

**Notas de produção:**
- Construído 100% em geometria vetorial sobre a paleta oficial; o "olho-reator" usa `ember` (#F03A24) com halo `crimson-glow`.
- O bico é córneo (gradiente latão→âmbar escuro) para reforçar a leitura de *ave de rapina*.
- Os PNGs foram exportados via render headless; para regenerá-los basta re-renderizar os SVGs.
- **Pendência para arte final:** no lockup, o wordmark depende da fonte *Chakra Petch* instalada. Para distribuição (e-mail, terceiros), converter o texto em contornos/paths. Use o briefing da §7 caso queira uma releitura ilustrada de maior fidelidade.

---

**Fim do Documento**
