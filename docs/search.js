/* ARQUIVO 5 de 7: search.js (Versão 4.0 - Nébula) */
/* Implementa uma busca por relevância com reordenamento de resultados, indexação ponderada e feedback acessível. */

document.addEventListener('DOMContentLoaded', () => {

  'use strict';

  const searchForm = document.querySelector('.search-bar');
  const searchInput = searchForm?.querySelector('input[type="search"]');
  const articleContent = document.querySelector('.main-content article');
  const allSections = Array.from(articleContent?.querySelectorAll('section[id]') || []);
  const resultsMessage = document.getElementById('search-no-results');

  if (!searchInput || !articleContent || allSections.length === 0 || !resultsMessage) {
    return;
  }

  // 1. INDEXAÇÃO PONDERADA
  // O índice agora contém "pesos" para diferentes tipos de conteúdo.
  const searchIndex = allSections.map((section, index) => {
    const titleElement = section.querySelector('h2');
    const title = titleElement ? titleElement.textContent.trim() : '';
    // Concatena o texto de elementos relevantes para uma busca mais limpa.
    const content = Array.from(section.querySelectorAll('p, li, td, th, h4'))
                         .map(el => el.textContent.trim())
                         .join(' ');
    
    return {
      id: section.id,
      title: title,
      content: content,
      element: section,
      originalHTML: section.innerHTML,
      originalOrder: index + 1 // Salva a ordem original do DOM
    };
  });

  // 2. LÓGICA DE BUSCA E RANKING
  const performSearch = () => {
    const query = searchInput.value.trim().toLowerCase();

    unhighlightAll();

    if (query === '') {
      resetOrderAndVisibility();
      resultsMessage.hidden = true;
      return;
    }
    
    // Calcula a pontuação para cada seção
    const scoredResults = searchIndex.map(item => {
      let score = 0;
      const titleMatches = (item.title.toLowerCase().match(new RegExp(query, 'g')) || []).length;
      const contentMatches = (item.content.toLowerCase().match(new RegExp(query, 'g')) || []).length;

      // Atribui pesos diferentes: um match no título vale mais.
      score += titleMatches * 10;
      score += contentMatches * 1;

      return { id: item.id, score: score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score); // Ordena do maior para o menor score

    updateDOM(scoredResults, query);
  };

  // 3. ATUALIZAÇÃO DO DOM (REORDENAMENTO E DESTAQUE)
  const updateDOM = (results, query) => {
    const matchedIds = new Set(results.map(item => item.id));

    allSections.forEach((section, index) => {
      if (matchedIds.has(section.id)) {
        section.classList.remove('section-hidden');
        // A ordem visual é baseada na posição no array de resultados ordenado
        const resultIndex = results.findIndex(res => res.id === section.id);
        section.style.order = resultIndex + 1;
        highlightTerm(section, query);
      } else {
        section.classList.add('section-hidden');
        section.style.order = allSections.length + 1; // Joga os não encontrados para o final
      }
    });

    // Atualiza a mensagem de resultados com feedback acessível
    if (results.length > 0) {
      resultsMessage.textContent = `${results.length} resultado(s) encontrado(s).`;
      resultsMessage.hidden = false;
    } else {
      resultsMessage.textContent = `Nenhum resultado encontrado para "${searchInput.value}".`;
      resultsMessage.hidden = false;
    }
  };
  
  const resetOrderAndVisibility = () => {
     searchIndex.forEach(item => {
        item.element.classList.remove('section-hidden');
        item.element.style.order = item.originalOrder;
     });
  };

  // 4. FUNÇÕES DE DESTAQUE (HIGHLIGHT)
  // Refinadas para serem robustas com o novo conteúdo
  const highlightTerm = (section, term) => {
    // A lógica de restauração do HTML original já previne múltiplos highlights.
    // A função de substituição é mais simples e eficaz.
    const regex = new RegExp(term, 'gi');
    const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) {
        // Ignora scripts, styles e o próprio termo de busca dentro da tag <mark>
        if (walker.currentNode.parentElement.tagName.toLowerCase() !== 'script' &&
            walker.currentNode.parentElement.tagName.toLowerCase() !== 'style' &&
            walker.currentNode.parentElement.tagName.toLowerCase() !== 'mark') {
            textNodes.push(walker.currentNode);
        }
    }
    
    textNodes.forEach(node => {
        const text = node.textContent;
        const newHTML = text.replace(regex, match => `<mark>${match}</mark>`);
        if (text !== newHTML) {
            const span = document.createElement('span'); // Cria um nó temporário
            span.innerHTML = newHTML;
            node.parentNode.replaceChild(span, node);
            span.replaceWith(...span.childNodes); // Substitui o span por seu conteúdo
        }
    });
  };

  const unhighlightAll = () => {
    searchIndex.forEach(item => {
      item.element.innerHTML = item.originalHTML;
    });
  };

  // 5. EVENT LISTENERS
  searchInput.addEventListener('input', performSearch);
  searchForm.addEventListener('submit', (e) => e.preventDefault()); // Previne envio do form
});
