/* ARQUIVO 4 de 7: theme.js (Versão 4.0 - Nébula) */
/* Gerencia a troca de tema, persistência e, agora, a atualização da UI do navegador (theme-color). */

document.addEventListener('DOMContentLoaded', () => {

  'use strict';
  
  const themeToggle = document.getElementById('theme-toggle');
  const docElement = document.documentElement;
  // NOVIDADE v4.0: Seletor para a meta tag de cor do tema
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  if (!themeToggle) return;

  /**
   * NOVIDADE v4.0: Atualiza a meta tag 'theme-color' dinamicamente.
   * Lê a cor de fundo atual diretamente das variáveis CSS para uma sincronia perfeita.
   */
  const updateThemeColor = () => {
    if (!themeColorMeta) return;
    
    // getComputedStyle lê o valor final da variável CSS aplicada ao elemento.
    const newColor = getComputedStyle(docElement).getPropertyValue('--color-background').trim();
    themeColorMeta.setAttribute('content', newColor);
  };
  
  /**
   * Aplica o tema visual, salva a preferência e atualiza a UI do navegador.
   * @param {string} theme - O tema a ser aplicado ('light' ou 'dark').
   */
  const applyTheme = (theme) => {
    // Define a classe no <html> para que o CSS aplique as variáveis de cor corretas.
    docElement.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
    
    // Salva a preferência do usuário no localStorage para persistência.
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('LocalStorage não está disponível.');
    }

    // Atualiza o aria-label do botão para acessibilidade, informando a próxima ação.
    const newLabel = theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro';
    themeToggle.setAttribute('aria-label', newLabel);
    
    // Chama a nova função para atualizar a cor da UI do navegador.
    updateThemeColor();
  };

  /**
   * Obtém o tema atual com base na classe do <html>.
   * @returns {string} - 'light' ou 'dark'.
   */
  const getCurrentTheme = () => {
    return docElement.classList.contains('theme-light') ? 'light' : 'dark';
  };

  // --- PONTO DE ENTRADA ---

  // 1. Adiciona o listener de clique para permitir a troca de tema pelo usuário.
  themeToggle.addEventListener('click', () => {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  });
  
  // 2. Garante que o estado inicial do botão (aria-label) e a cor do tema (meta tag)
  //    estejam corretos assim que o DOM for carregado. O tema visual em si já foi
  //    definido pelo script anti-flicker no <head>.
  const initialTheme = getCurrentTheme();
  const initialLabel = initialTheme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro';
  themeToggle.setAttribute('aria-label', initialLabel);
  updateThemeColor();

});
