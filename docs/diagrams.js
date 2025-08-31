/* ARQUIVO 7 de 7: diagrams.js (Versão 4.0 - Nébula) */
/* Gera e anima uma visualização da curvatura do espaço-tempo, conceito central da Relatividade Geral. */

document.addEventListener('DOMContentLoaded', () => {

  'use strict';

  const svgContainer = document.querySelector('.scientific-diagram');
  if (!svgContainer) return;

  const svgNS = 'http://www.w3.org/2000/svg';
  const size = 400; // O tamanho do nosso viewBox
  const gridSize = 20; // Quantas linhas na grade
  const center = size / 2;
  const massRadius = 30;
  const warpFactor = 80; // Quão "profunda" é a curvatura

  /**
   * Gera o diagrama SVG da Relatividade Geral.
   */
  const createRelativityDiagram = () => {
    svgContainer.innerHTML = ''; // Limpa o placeholder

    // 1. Cria a grade do espaço-tempo (inicialmente plana)
    const gridGroup = document.createElementNS(svgNS, 'g');
    for (let i = 0; i <= gridSize; i++) {
      const pos = (size / gridSize) * i;
      // Linhas verticais e horizontais como <path> para poderem ser deformadas
      const hPath = document.createElementNS(svgNS, 'path');
      hPath.setAttribute('d', `M 0 ${pos} L ${size} ${pos}`);
      hPath.classList.add('spacetime-grid-line', 'grid-h');

      const vPath = document.createElementNS(svgNS, 'path');
      vPath.setAttribute('d', `M ${pos} 0 L ${pos} ${size}`);
      vPath.classList.add('spacetime-grid-line', 'grid-v');
      
      gridGroup.appendChild(hPath);
      gridGroup.appendChild(vPath);
    }
    svgContainer.appendChild(gridGroup);
    
    // 2. Cria os corpos celestes
    const centralMass = document.createElementNS(svgNS, 'circle');
    centralMass.classList.add('central-mass');
    centralMass.setAttribute('cx', center);
    centralMass.setAttribute('cy', center);
    centralMass.setAttribute('r', massRadius);

    const orbitalPath = document.createElementNS(svgNS, 'path');
    orbitalPath.id = 'satellite-orbit';
    orbitalPath.classList.add('orbital-path');
    orbitalPath.setAttribute('d', `M ${center - 150}, ${center} A 150 80 0 1 0 ${center + 150} ${center} A 150 80 0 1 0 ${center - 150} ${center}`);

    const orbitingBody = document.createElementNS(svgNS, 'circle');
    orbitingBody.classList.add('orbiting-body');
    orbitingBody.setAttribute('r', 8);

    // 3. Cria a animação de órbita
    const orbitAnimation = document.createElementNS(svgNS, 'animateMotion');
    orbitAnimation.setAttribute('dur', '10s');
    orbitAnimation.setAttribute('repeatCount', 'indefinite');
    const mpath = document.createElementNS(svgNS, 'mpath');
    mpath.setAttribute('href', '#satellite-orbit');
    orbitAnimation.appendChild(mpath);
    orbitingBody.appendChild(orbitAnimation);

    svgContainer.appendChild(orbitalPath);
    svgContainer.appendChild(centralMass);
    svgContainer.appendChild(orbitingBody);
  };

  /**
   * Anima a deformação da grade do espaço-tempo.
   */
  const animateWarp = () => {
    const lines = svgContainer.querySelectorAll('.spacetime-grid-line');
    lines.forEach(line => {
      const x1 = line.classList.contains('grid-h') ? 0 : parseFloat(line.getAttribute('d').split(' ')[1]);
      const y1 = line.classList.contains('grid-h') ? parseFloat(line.getAttribute('d').split(' ')[2]) : 0;
      
      // Matemática para calcular a curvatura (simulação)
      const distFromCenter = Math.sqrt(Math.pow(x1 - center, 2) + Math.pow(y1 - center, 2));
      const pull = warpFactor * (1 - distFromCenter / (size * 0.7));

      const cx = line.classList.contains('grid-h') ? center : x1 + pull;
      const cy = line.classList.contains('grid-h') ? y1 + pull : center;

      // Altera o 'd' do <path> de uma linha reta para uma curva de Bézier
      const newD = `M ${line.getAttribute('d').split(' ')[1]} ${line.getAttribute('d').split(' ')[2]} Q ${cx} ${cy} ${line.getAttribute('d').split(' ')[4]} ${line.getAttribute('d').split(' ')[5]}`;
      
      // O CSS com `transition: d ...` cuidará da animação suave
      setTimeout(() => line.setAttribute('d', newD), 200);
    });
  };

  /**
   * Dispara a sequência de animações.
   */
  const startAnimationSequence = () => {
    svgContainer.classList.add('diagram-animated');
    animateWarp();
  };

  /**
   * Observa a visibilidade do diagrama para iniciar a animação.
   */
  const initAnimationTrigger = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startAnimationSequence();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    observer.observe(svgContainer);
  };

  // --- PONTO DE ENTRADA v4.0 ---
  createDiagram();
  initAnimationTrigger();
});
