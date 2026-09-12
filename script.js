document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const links = navLinks.querySelectorAll('a');

    // Alterna a abertura e o fechamento do menu ao clicar no hambúrguer
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('open');
        navLinks.classList.toggle('show');
    });

    // Fecha o menu ao clicar em qualquer link da navegação
    links.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('open');
            navLinks.classList.remove('show');
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const slidesContainer = document.getElementById('slides');
    const slides = document.querySelectorAll('.slide');
    const btnAnterior = document.getElementById('btnAnterior');
    const btnProximo = document.getElementById('btnProximo');
    const dots = document.querySelectorAll('.dot');

    let indiceAtual = 0;
    const totalSlides = slides.length;

    // Atualiza a posição dos slides e os indicadores ativos
    function atualizarCarrossel() {
        slidesContainer.style.transform = `translateX(-${indiceAtual * 100}%)`;

        dots.forEach((dot, index) => {
            if (index === indiceAtual) {
                dot.classList.add('ativo');
            } else {
                dot.classList.remove('ativo');
            }
        });
    }

    // Função para ir para o próximo slide
    function proximoSlide() {
        indiceAtual = (indiceAtual + 1) % totalSlides;
        atualizarCarrossel();
    }

    // Função para voltar ao slide anterior
    function slideAnterior() {
        indiceAtual = (indiceAtual - 1 + totalSlides) % totalSlides;
        atualizarCarrossel();
    }

    // Eventos dos botões
    btnProximo.addEventListener('click', proximoSlide);
    btnAnterior.addEventListener('click', slideAnterior);

    // Evento de clique das bolinhas
    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            indiceAtual = parseInt(e.target.dataset.index);
            atualizarCarrossel();
        });
    });

    // Transição automática
    setInterval(proximoSlide, 6000);
});