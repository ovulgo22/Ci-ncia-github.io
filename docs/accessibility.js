/* ARQUIVO 6 de 7: accessibility.js (Versão 4.0 - Nébula) */
/* Aprimora a acessibilidade com uma trava de foco dinâmica e navegação por teclado avançada para componentes complexos. */

document.addEventListener('DOMContentLoaded', () => {

  'use strict';

  /**
   * Módulo: Aprimoramento do Link "Pular para o Conteúdo"
   * (Inalterado - a lógica permanece robusta e eficaz)
   */
  const initSkipLink = () => {
    const skipLink = document.querySelector('.skip-link');
    const mainContent = document.getElementById('main-content');
    if (!skipLink || !mainContent) return;

    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      mainContent.addEventListener('blur', () => mainContent.removeAttribute('tabindex'), { once: true });
    });
  };

  /**
   * Módulo: Trava de Foco (Focus Trap) Dinâmica para o Menu Móvel
   * NOVIDADE v4.0: Agora lida com elementos que mudam de visibilidade (menus <details>).
   */
  const initFocusTrap = () => {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const siteNav = document.getElementById('site-nav');
    if (!mobileNavToggle || !siteNav) return;

    let focusableElements = [];
    let firstFocusableElement;
    let lastFocusableElement;

    const setFocusableElements = () => {
      // Seleciona todos os elementos potencialmente focáveis
      const allPossibleElements = Array.from(siteNav.querySelectorAll(
        'a[href], button, summary, [tabindex]:not([tabindex="-1"])'
      ));
      
      // Filtra apenas pelos elementos que estão de fato visíveis
      focusableElements = allPossibleElements.filter(el => el.offsetParent !== null);
      
      if (focusableElements.length > 0) {
        firstFocusableElement = focusableElements[0];
        lastFocusableElement = focusableElements[focusableElements.length - 1];
      } else {
        firstFocusableElement = null;
        lastFocusableElement = null;
      }
    };

    // Recalcula os elementos focáveis sempre que um <details> é aberto/fechado
    siteNav.querySelectorAll('details').forEach(detail => {
      detail.addEventListener('toggle', setFocusableElements);
    });
    
    // Observa a abertura/fechamento do menu principal
    const observer = new MutationObserver(() => {
        if (siteNav.classList.contains('is-open')) {
            setFocusableElements();
        }
    });
    observer.observe(siteNav, { attributes: true, attributeFilter: ['class'] });

    document.addEventListener('keydown', (event) => {
      if (!siteNav.classList.contains('is-open')) return;

      if (event.key === 'Escape' || event.key === 'Esc') {
        siteNav.classList.remove('is-open');
        mobileNavToggle.setAttribute('aria-expanded', 'false');
        mobileNavToggle.focus();
      }

      if (event.key === 'Tab' && firstFocusableElement) {
        if (event.shiftKey) { // Shift + Tab (voltando)
          if (document.activeElement === firstFocusableElement) {
            event.preventDefault();
            lastFocusableElement.focus();
          }
        } else { // Tab (avançando)
          if (document.activeElement === lastFocusableElement) {
            event.preventDefault();
            firstFocusableElement.focus();
          }
        }
      }
    });

    mobileNavToggle.addEventListener('click', () => {
      if (!siteNav.classList.contains('is-open')) {
        setTimeout(() => mobileNavToggle.focus(), 0);
      }
    });
  };

  /**
   * NOVIDADE v4.0: Módulo de Navegação por Teclado para Menus <details>
   * Permite abrir/fechar submenus com as setas do teclado.
   */
  const initDetailsKeyNav = () => {
      const summaries = document.querySelectorAll('.site-nav summary');
      summaries.forEach(summary => {
          summary.addEventListener('keydown', event => {
              const details = summary.parentElement;
              if (!details) return;

              if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                  if (!details.open) {
                      event.preventDefault();
                      details.open = true;
                  }
              }
              if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                  if (details.open) {
                      event.preventDefault();
                      details.open = false;
                  }
              }
          });
      });
  };
  
  // --- PONTO DE ENTRADA v4.0 ---
  initSkipLink();
  initFocusTrap();
  initDetailsKeyNav();
});
