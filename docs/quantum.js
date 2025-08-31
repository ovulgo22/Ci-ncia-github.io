/* ARQUIVO 3 de 7: quantum.js (Versão 5.0 - Quantum) */
/* O motor principal da aplicação. Gerencia o estado, o roteamento e a renderização da UI. */

const QuantumEngine = (() => {
  'use strict';

  // O estado central da aplicação
  const state = {
    contentData: null,
    currentPage: null,
    dom: {
      root: document.getElementById('app-root'),
      contentData: document.getElementById('app-content-data'),
      templates: document.getElementById('app-templates'),
      shell: null, // Referência para o shell da UI principal
    }
  };

  /**
   * Ponto de entrada. Inicializa o motor.
   */
  const init = () => {
    console.log(`Quantum Engine v5.0 Initializing... | ${new Date().toLocaleTimeString()}`);
    if (!state.dom.root || !state.dom.contentData || !state.dom.templates) {
      console.error('Quantum Engine Failure: Core DOM elements not found.');
      return;
    }
    parseContentData();
    renderShell();
    setupRouter();
  };

  /**
   * Lê e parseia o conteúdo do "Data Island".
   */
  const parseContentData = () => {
    try {
      state.contentData = JSON.parse(state.dom.contentData.textContent);
    } catch (e) {
      console.error('Quantum Engine Failure: Could not parse content data.', e);
      state.dom.root.innerHTML = '<p>Error loading application content.</p>';
    }
  };

  /**
   * Configura o roteador para ouvir mudanças na URL (hash).
   */
  const setupRouter = () => {
    window.addEventListener('hashchange', () => renderPageByHash());
    // Trata o carregamento inicial da página
    renderPageByHash();
  };

  /**
   * Renderiza a "casca" principal da aplicação (header, nav, main, footer).
   */
  const renderShell = () => {
    const shellTemplate = state.dom.templates.querySelector('#template-shell');
    if (shellTemplate) {
      state.dom.shell = shellTemplate.content.cloneNode(true);
      state.dom.root.innerHTML = ''; // Limpa o loader
      state.dom.root.appendChild(state.dom.shell);
      // Aqui, futuramente, o header e a nav seriam populados.
    }
  };

  /**
   * Obtém o ID da página a partir do hash da URL e chama o renderizador.
   */
  const renderPageByHash = () => {
    const pageId = location.hash.slice(1) || 'home';
    if (pageId !== state.currentPage) {
      renderPage(pageId);
    }
  };

  /**
   * Orquestra a renderização de uma página completa.
   * @param {string} pageId - O ID da página a ser renderizada (ex: "home", "relativity").
   */
  const renderPage = (pageId) => {
    const pageData = state.contentData.pages[pageId];
    if (!pageData) {
      console.warn(`Page "${pageId}" not found. Redirecting to home.`);
      location.hash = '#home'; // Redireciona para home se a página não existir
      return;
    }

    state.currentPage = pageId;
    document.title = `${pageData.title} | Compêndio da Ciência`;
    
    const mainContent = state.dom.root.querySelector('.main-content');
    if (!mainContent) return;

    mainContent.innerHTML = ''; // Limpa o conteúdo anterior
    const fragment = document.createDocumentFragment();

    // Renderiza cada componente definido nos dados da página
    pageData.components.forEach(componentData => {
      const componentNode = renderComponent(componentData);
      if (componentNode) {
        fragment.appendChild(componentNode);
      }
    });

    mainContent.appendChild(fragment);
    window.scrollTo(0, 0); // Rola para o topo ao trocar de página
  };

  /**
   * Renderiza um único componente.
   * @param {object} data - O objeto de dados para o componente.
   * @returns {Node} - O nó do DOM renderizado.
   */
  const renderComponent = (data) => {
    const template = state.dom.templates.querySelector(`#template-${data.type}`);
    if (!template) {
      console.warn(`Template for component type "${data.type}" not found.`);
      return null;
    }
    const clone = template.content.cloneNode(true);
    return bindData(clone, data);
  };
  
  /**
   * Conecta os dados ao clone do template. Este é o coração do data-binding.
   * @param {DocumentFragment} clone - O clone do template.
   * @param {object} data - O objeto de dados.
   * @returns {DocumentFragment} - O clone com os dados injetados.
   */
  const bindData = (clone, data) => {
    clone.querySelectorAll('[data-bind]').forEach(el => {
      const key = el.dataset.bind;
      
      // Data-binding para listas de sub-componentes (ex: CardGrid)
      if (Array.isArray(data[key])) {
        const subFragment = document.createDocumentFragment();
        // O tipo do sub-componente é inferido a partir do tipo do pai.
        const subComponentType = data.type.replace('Grid', ''); 
        data[key].forEach(subItemData => {
          // Adiciona o tipo para que a recursão funcione
          subItemData.type = subComponentType;
          // Renderiza cada sub-componente
          const subNode = renderComponent(subItemData);
          if (subNode) subFragment.appendChild(subNode);
        });
        el.appendChild(subFragment);

      } else if (data[key] !== undefined) {
        // Data-binding para texto simples
        el.textContent = data[key];

      } else if (el.hasAttribute('optional')) {
        // Remove elementos opcionais se não houver dados para eles
        el.remove();
      }
    });

    // Data-binding para atributos (ex: link do Card)
    if (data.type === 'Card' && data.link) {
      clone.querySelector('a').href = data.link;
    }
    // Data-binding para variantes (ex: Callout)
    if (data.variant) {
      clone.firstElementChild.dataset.variant = data.variant;
    }
    // Data-binding para tabelas
    if (data.type === 'TableBlock') {
        const thead = clone.querySelector('thead');
        const tbody = clone.querySelector('tbody');
        const headerRow = document.createElement('tr');
        data.headers.forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        data.rows.forEach(r => {
            const row = document.createElement('tr');
            r.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
    }

    return clone;
  };


  // Expõe apenas o método de inicialização publicamente.
  return {
    init: init
  };

})();

// Inicia a aplicação.
QuantumEngine.init();
