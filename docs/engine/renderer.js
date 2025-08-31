/* ARQUIVO 5 de 8: engine/renderer.js (Versão 6.0 - Symbiont) */
/* O motor de renderização. Constrói a UI a partir de templates e dados, com cache. */
/* Este arquivo é exportado como um Módulo ES6. */

export class Renderer {
  constructor(templatePaths, templateCache) {
    this.templatePaths = templatePaths; // O objeto "templates" do manifest.json
    this.templateCache = templateCache; // O Map() de cache do motor principal
  }

  /**
   * Ponto de entrada principal para renderizar uma página inteira.
   * @param {HTMLElement} containerElement - O elemento <main> onde o conteúdo será inserido.
   * @param {object} pageContent - O objeto JSON com o conteúdo da página.
   */
  async renderPage(containerElement, pageContent) {
    containerElement.innerHTML = ''; // Limpa o conteúdo anterior
    const fragment = document.createDocumentFragment();

    for (const componentData of pageContent.components) {
      const componentNode = await this.renderComponent(componentData);
      if (componentNode) {
        fragment.appendChild(componentNode);
      }
    }
    
    containerElement.appendChild(fragment);
  }

  /**
   * Renderiza um único componente.
   * @param {object} data - O objeto de dados para o componente (ex: { type: 'Hero', ... }).
   * @returns {Node | null} - O nó do DOM renderizado ou nulo em caso de erro.
   */
  async renderComponent(data) {
    try {
      const templateFragment = await this.fetchTemplate(data.type);
      const clone = templateFragment.cloneNode(true);
      return this.bindData(clone, data);
    } catch (error) {
      console.warn(`Failed to render component of type "${data.type}":`, error);
      return null;
    }
  }

  /**
   * Busca um template da rede ou do cache.
   * @param {string} templateName - O nome do template (ex: "Card", "Hero").
   * @returns {DocumentFragment} - O conteúdo do template pronto para ser clonado.
   */
  async fetchTemplate(templateName) {
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName);
    }

    const path = this.templatePaths[templateName];
    if (!path) throw new Error(`Template path for "${templateName}" not found in manifest.`);
    
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for ${path}`);
    
    const htmlText = await response.text();
    const templateElement = document.createElement('template');
    templateElement.innerHTML = htmlText;
    
    this.templateCache.set(templateName, templateElement.content);
    return templateElement.content;
  }
  
  /**
   * Conecta os dados ao clone do template (data-binding).
   * @param {DocumentFragment} clone - O fragmento do DOM clonado do template.
   * @param {object} data - O objeto de dados do componente.
   * @returns {DocumentFragment} - O fragmento preenchido com os dados.
   */
  bindData(clone, data) {
    // Vincula dados a elementos com [data-bind]
    clone.querySelectorAll('[data-bind]').forEach(el => {
      const key = el.dataset.bind;
      
      if (Array.isArray(data[key])) { // Vinculação de listas (ex: CardGrid, Timeline)
        const subComponentType = data.type.replace('Grid', '');
        const subFragment = document.createDocumentFragment();
        data[key].forEach(subItemData => {
          // Renderiza sub-componentes de forma síncrona, pois os templates já foram buscados
          const subTemplate = this.templateCache.get(subComponentType);
          if (subTemplate) {
            const subClone = subTemplate.cloneNode(true);
            const boundSubClone = this.bindData(subClone, subItemData);
            subFragment.appendChild(boundSubClone);
          }
        });
        el.appendChild(subFragment);
      } else if (data[key] !== undefined) {
        el.textContent = data[key];
      } else if (el.hasAttribute('optional')) {
        el.remove();
      }
    });

    // Vinculações especiais de atributos e variantes
    this.handleSpecialBindings(clone, data);

    return clone;
  }
  
  /**
   * Lida com vinculações que não são de texto simples (atributos, classes, etc.).
   */
  handleSpecialBindings(clone, data) {
    switch(data.type) {
      case 'Card':
        if(data.link) clone.querySelector('a').href = data.link;
        break;
      case 'Callout':
        if(data.variant) clone.firstElementChild.dataset.variant = data.variant;
        break;
      case 'Diagram':
        if(data.diagramId) clone.firstElementChild.dataset.diagramId = data.diagramId;
        break;
      case 'TableBlock':
        const thead = clone.querySelector('thead');
        const tbody = clone.querySelector('tbody');
        if(thead && data.headers) {
          const headerRow = document.createElement('tr');
          data.headers.forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            headerRow.appendChild(th);
          });
          thead.appendChild(headerRow);
        }
        if(tbody && data.rows) {
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
        break;
    }
  }
}
