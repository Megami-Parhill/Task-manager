# ♔ ChessTasks — Gerenciador de Tarefas com Tema de Xadrez

Um aplicativo web responsivo (estilo mobile) criado com **HTML**, **CSS** e **JavaScript puro**, com tema branco e dourado inspirado no tabuleiro de **xadrez**.  
Cada tipo de tarefa usa o ícone de uma peça diferente, refletindo sua prioridade no jogo (e na vida 😄).

## ♕ Demonstração

- Interface elegante e responsiva.
- Tema **branco e dourado** com padrão sutil de tabuleiro.
- Armazenamento **localStorage** — mantém suas tarefas mesmo após fechar o navegador.
- Exibe **gráficos de produtividade** (tarefas concluídas e pendentes).
- Telas:
  - Login  
  - Minhas Tarefas  
  - Criar / Editar  
  - Detalhes  
  - Produtividade

## ♗ Tecnologias Utilizadas

- HTML5  
- CSS3 (Flexbox e variáveis CSS)  
- JavaScript (ES6)  
- Canvas API (para os gráficos)  
- localStorage (persistência de dados)

## ♘ Ícones de Classes (peças)

| Classe       | Ícone | Peça de xadrez | Significado                |
|---------------|:------:|----------------|----------------------------|
| Priority      | ♔ | Rei     | Tarefa mais importante       |
| Secondary     | ♕ | Rainha  | Alta prioridade secundária   |
| Minor         | ♗ | Bispo   | Tarefa intermediária         |
| World         | ♘ | Cavalo  | Tarefa leve / global         |

---

## ⚙️ Como Usar

1. Baixe os três arquivos e coloque na mesma pasta:
   - `index.html`  
   - `style.css`  
   - `script.js`
2. Abra o arquivo `index.html` em um navegador (duplo clique).
3. Faça login com o usuário de teste:
user@exemplo
senha123
4. Adicione, edite e marque tarefas como concluídas.
5. Use a aba **Produtividade** para visualizar gráficos.

---

## 🧩 Estrutura do Projeto

chess_tasks/
│
├── index.html # Estrutura principal e telas do app
├── style.css # Tema branco e dourado + layout responsivo
├── script.js # Lógica, armazenamento e interações
└── README.md # Este arquivo

---

## 💾 Armazenamento

Todas as tarefas são salvas automaticamente no `localStorage` do navegador.  
Isso significa que:
- Elas permanecem mesmo após fechar o navegador.  
- São exclusivas para o navegador atual (não sincroniza entre dispositivos).

Para limpar tudo:
```js
localStorage.clear()
```
## 🎨 Tema Branco e Dourado

O tema utiliza tons clássicos de xadrez:
--gold: #b8860b;
--gold-2: #e0b14a;
--bg: #fbfaf8;
--card: #ffffff;
Com um leve padrão de tabuleiro criado via linear-gradient().
🏁 Licença

Este projeto é de uso livre para estudos, modificações e distribuição.
Créditos são bem-vindos se for reutilizado publicamente ♛

Desenvolvido com ♕ por [Nicole Marciano]
