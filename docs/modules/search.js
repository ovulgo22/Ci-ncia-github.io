/* ARQUIVO 7 de 8: modules/search.js (Versão 6.0 - Symbiont) */
/* Módulo de busca sensível ao contexto. Indexa o conteúdo da página atual e reordena os resultados por relevância. */

const SearchModule = {
  isInitialized: false,
  engine: null,
  dom: {},
  searchIndex: [],

  /**
   * Ponto de entrada público, chamado pelo Symbiont Engine.
   * @param {SymbiontEngine} engine - A instância do motor principal.
   */
  init(engine) {
    if (this.isInitialized) return;

    this.engine = engine;
    const root = this.engine.getDOM().root;
    this.dom = {
      input: root.querySelector('#search-input'),
      main: root.querySelector('.main-content'),
    };

    if (!this.dom.input || !this.dom.main) {
      console.warn('SearchModule: Core elements (#search-input, .main-content) not found.');
      return;
    }

    this.dom.input.addEventListener('input', () => this.performSearch());
    window.addEventListener('symbiont:page-rendered', () => this.buildPageIndex());

    this.isInitialized = true;
    console.log('SearchModule Initialized.');
  },

  /**
   * Constrói o índice de busca para a página atualmente visível.
   */
  buildPageIndex() {
    this.resetView(); // Garante que a vista seja limpa antes de re-indexar
    const sections = this.dom.main.querySelectorAll('section, header.page-header');
    
    this.searchIndex = Array.from(sections).map((section, index) => {
      const title = (section.querySelector('h1, h2') || {}).textContent || '';
      const content = section.textContent || '';
      return {
        element: section,
        title: title.trim(),
        content: content.trim(),
        originalOrder: index + 1,
        originalHTML: section.innerHTML,
      };
    });
  },

  /**
   * Executa a busca no índice da página atual e atualiza a UI.
   */
  performSearch() {
    const query = this.dom.input.value.trim().toLowerCase();

    this.unhighlightAll();

    if (query === '') {
      this.resetView();
      return;
    }

    const scoredResults = this.searchIndex.map(item => {
      const titleMatches = (item.title.toLowerCase().match(new RegExp(query, 'g')) || []).length;
      const contentMatches = (item.content.toLowerCase().match(new RegExp(query, 'g')) || []).length;
      const score = (titleMatches * 10) + (contentMatches * 1);
      return { ...item, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

    this.updateView(scoredResults, query);
  },
  
  /**
   * Atualiza a UI para mostrar, ordenar e destacar os resultados.
   * @param {Array} results - Os resultados da busca, ordenados por score.
   * @param {string} query - O termo da busca.
   */
  updateView(results, query) {
    this.updateResultMessage(results.length, query);
    const matchedElements = new Set(results.map(item => item.element));
    
    this.searchIndex.forEach(item => {
      if (matchedElements.has(item.element)) {
        item.element.classList.remove('section-hidden');
        const resultIndex = results.findIndex(res => res.element === item.element);
        item.element.style.order = resultIndex + 1;
        this.highlightTerm(item.element, query);
      } else {
        item.element.classList.add('section-hidden');
      }
    });
  },
  
  /**
   * Restaura a visualização padrão, mostrando todas as seções.
   */
  resetView() {
    this.searchIndex.forEach(item => {
      item.element.classList.remove('section-hidden');
      item.element.style.order = item.originalOrder;
    });
    this.removeResultMessage();
  },

  /**
   * Gerencia a mensagem de status da busca (ex: "5 resultados encontrados").
   */
  updateResultMessage(count, query) {
    this.removeResultMessage();
    if (!query) return;

    const message = document.createElement('div');
    message.id = 'search-results-message';
    message.className = 'search-results-message';
    message.setAttribute('role', 'status');
    message.setAttribute('aria-live', 'polite');
    message.textContent = `${count} resultado(s) encontrado(s) para "${query}"`;
    
    // Insere a mensagem antes do primeiro elemento de conteúdo
    this.dom.main.prepend(message);
  },
  
  removeResultMessage() {
    const existingMsg = this.dom.main.querySelector('#search-results-message');
    if (existingMsg) existingMsg.remove();
  },
  
  /**
   * Destaca o termo da busca nos elementos de resultado.
   */
  highlightTerm(section, term) {
    const regex = new RegExp(term, 'gi');
    const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) {
      if (walker.currentNode.parentElement.tagName.toLowerCase() !== 'mark') {
        textNodes.push(walker.currentNode);
      }
    }
    
    textNodes.forEach(node => {
      const text = node.textContent;
      if (regex.test(text)) {
        const newHTML = text.replace(regex, match => `<mark>${match}</mark>`);
        const span = document.createElement('span');
        span.innerHTML = newHTML;
        node.parentNode.replaceChild(span, node);
        span.replaceWith(...span.childNodes);
      }
    });
  },

  unhighlightAll() {
    this.searchIndex.forEach(item => {
      if (item.element.innerHTML !== item.originalHTML) {
        item.element.innerHTML = item.originalHTML;
      }
    });
  }
};

export default SearchModule;
