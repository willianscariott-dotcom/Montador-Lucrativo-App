# Design System - Montador Lucrativo (Padrão Industrial DeWalt Premium)

## 1. Stack de Estilização
- **Framework:** Tailwind CSS v4.0.
- **Configuração:** NÃO crie `tailwind.config.js`. Utilize configuração CSS-First via diretiva `@theme` diretamente no arquivo CSS global (ex: `app.css` ou `globals.css`) [2, 6].

## 2. Paleta de Cores (Slate & Amber)
A interface adota o "Dark Mode" por padrão (alta visibilidade no sol e redução de fadiga visual) [3].
- **Fundo / Base (Slate 950):** `#0f172a` ou Steel Gray `#1F2326` (Textura metálica) [3, 7].
- **Ação / Destaque (Amber 500):** `#f59e0b` (Garante proporção de contraste AAA) [7, 8].
- **Cores Semânticas:** Success `#10b981`, Error `#ef4444`, Warning `#f59e0b` [9].
- **Regra de Contraste:** O contraste entre texto e fundo deve exceder a proporção 4.5:1 para legibilidade extrema em canteiros de obra [8].

## 3. Ergonomia e Zona do Polegar (Thumb Zone)
O usuário opera o app com uma mão e possivelmente de luvas [4, 10].
- **Alvos de Toque (Touch Targets):** O tamanho mínimo absoluto para qualquer botão primário ou CTA é de **56px** (`--spacing-touch-primary: 56px`) [4].
- **Navegação Secundária:** Mínimo de **48px** (`--spacing-touch-nav: 48px`) [4].
- **Espaçamento (Gap):** Mínimo de 12px entre botões para evitar cliques acidentais [4].
- **Posicionamento:** Ações primárias e CTAs devem ficar na parte inferior central da tela (Bottom Navigation) [11].

## 4. Estética de Autoridade (Sombras e Bordas)
Abandone sombras suaves difusas de softwares tradicionais. Use uma estética de "estamparia" mecânica (Stamped Shadows) [5].
- **Box Shadows:** Sombra curta + inset shadow no topo para simular botões usinados (ex: `BoxShadow(0, 1px, 2px, rgba(0,0,0,0.5)) + InsetShadow(0, 1px, 1px, rgba(255,255,255,0.1))`) [12].
- **Border Radius:** Use cantos com curvatura industrial (`radius-industrial: 6px`) para inputs/botões e (`radius-panel: 12px`) para containers/cards maiores. Nada de cantos extremamente arredondados para não parecer infantil [12, 13].

## 5. Tipografia
- Priorize fontes robustas e industriais com leitura perfeita para números de alta precisão técnica (como Barlow, Montserrat ou Inter) [14, 15].
- **Peso de Fontes (Weight):** Títulos em Bold (700), Valores Monetários e Dados em Medium (500). Evite fontes finas ou Light, pois desaparecem em telas expostas ao sol ou com sujeira [14, 15].

## 6. Responsividade: Padrão "Floating Mobile App" (Desktop)
- O aplicativo é Mobile-First, mas deve se expandir e aproveitar o espaço horizontal em telas grandes (Desktop/Tablet).
Remova as restrições de max-w-md dos containers principais. Utilize container mx-auto max-w-7xl px-4 para que o layout respire no desktop.
Em telas grandes, formulários (como o Novo Orçamento) devem se reorganizar usando CSS Grid (ex: dividir dados do cliente e itens em duas colunas) para otimizar o espaço.

-
