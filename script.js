// ==========================================================
// CONEXÃO BR - script.js (único arquivo para todas as páginas)
//
// Cada módulo verifica se os elementos dele existem na página
// atual. Se não existirem, o módulo simplesmente não roda e
// não quebra o restante do script.
// ==========================================================

document.addEventListener("DOMContentLoaded", function () {
    iniciarMenu();       // index, sobre, inscrever
    iniciarCarrossel();  // index
    iniciarDoacao();     // doacao
});


// ==========================================================
// MENU HAMBÚRGUER
// ==========================================================

function iniciarMenu() {
    const botao = document.getElementById("menuToggle");
    const links = document.getElementById("navLinks");

    if (!botao || !links) return; // página sem esse menu

    function definirMenu(aberto) {
        links.classList.toggle("show", aberto);
        botao.classList.toggle("open", aberto);
        botao.setAttribute("aria-expanded", String(aberto));
        botao.setAttribute(
            "aria-label",
            aberto ? "Fechar menu de navegação" : "Abrir menu de navegação"
        );
    }

    botao.addEventListener("click", function () {
        definirMenu(!links.classList.contains("show"));
    });

    // Fecha ao clicar em um link
    links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
            definirMenu(false);
        });
    });

    // Fecha com ESC
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") definirMenu(false);
    });

    // Fecha ao voltar para tela grande
    window.addEventListener("resize", function () {
        if (window.innerWidth > 768) definirMenu(false);
    });
}


// ==========================================================
// CARROSSEL
// ==========================================================

function iniciarCarrossel() {
    const trilho = document.getElementById("slides");
    if (!trilho) return; // página sem carrossel

    const slides = trilho.querySelectorAll(".slide");
    const pontos = document.querySelectorAll("#indicadores .ponto");
    const btnAnterior = document.getElementById("btnAnterior");
    const btnProximo = document.getElementById("btnProximo");
    const area = trilho.closest(".carrossel") || trilho;

    if (slides.length === 0) return;

    const INTERVALO = 5000; // 5 segundos
    let atual = 0;
    let timer = null;

    function irPara(indice) {
        atual = (indice + slides.length) % slides.length;

        trilho.style.transform = "translateX(-" + atual * 100 + "%)";

        slides.forEach(function (slide, i) {
            slide.classList.toggle("ativo", i === atual);
        });

        pontos.forEach(function (ponto, i) {
            ponto.classList.toggle("ativo", i === atual);
            ponto.setAttribute("aria-selected", String(i === atual));
        });
    }

    function iniciarAuto() {
        pararAuto();
        timer = setInterval(function () {
            irPara(atual + 1);
        }, INTERVALO);
    }

    function pararAuto() {
        if (timer) clearInterval(timer);
        timer = null;
    }

    if (btnAnterior) {
        btnAnterior.addEventListener("click", function () {
            irPara(atual - 1);
            iniciarAuto();
        });
    }

    if (btnProximo) {
        btnProximo.addEventListener("click", function () {
            irPara(atual + 1);
            iniciarAuto();
        });
    }

    pontos.forEach(function (ponto) {
        ponto.addEventListener("click", function () {
            irPara(Number(ponto.dataset.index));
            iniciarAuto();
        });
    });

    // Pausa quando o mouse ou o foco está no carrossel
    area.addEventListener("mouseenter", pararAuto);
    area.addEventListener("mouseleave", iniciarAuto);
    area.addEventListener("focusin", pararAuto);
    area.addEventListener("focusout", iniciarAuto);

    irPara(0);
    iniciarAuto();
}


// ==========================================================
// DOAÇÃO (só roda em doacao.html)
// ==========================================================

function iniciarDoacao() {
    const form = document.getElementById("formularioDoacao");
    if (!form) return; // página sem formulário de doação

    // ---------- Elementos ----------

    const codigoInput = document.getElementById("codigo");
    const valorInput = document.getElementById("valor");
    const resumoValor = document.getElementById("resumoValor");
    const resumoPagamento = document.getElementById("resumoPagamento");
    const mensagem = document.getElementById("mensagem");

    const dadosIdentificacao = document.getElementById("dadosIdentificacao");
    const formPessoaFisica = document.getElementById("formPessoaFisica");
    const formEmpresa = document.getElementById("formEmpresa");
    const mensagemIdentificacao = document.getElementById("mensagemIdentificacao");
    const botaoContinuar = document.getElementById("continuarDoacao");

    const radiosDeclarar = document.querySelectorAll('input[name="declarar"]');
    const radiosTipoDoador = document.querySelectorAll('input[name="tipoDoador"]');
    const pagamentos = document.querySelectorAll('input[name="pagamento"]');

    // Estado da etapa de identificação
    let identificacaoConcluida = false;
    let dadosDoador = null; // null = doação anônima


    // ---------- Funções auxiliares ----------

    function valorSelecionado(nome) {
        const marcado = document.querySelector('input[name="' + nome + '"]:checked');
        return marcado ? marcado.value : null;
    }

    function somenteDigitos(texto) {
        return texto.replace(/\D/g, "");
    }

    function campo(id) {
        return document.getElementById(id).value.trim();
    }

    function mostrarErroIdentificacao(texto) {
        mensagemIdentificacao.textContent = texto;
        mensagemIdentificacao.style.color = "red";
    }

    function limparMensagemIdentificacao() {
        mensagemIdentificacao.textContent = "";
        mensagemIdentificacao.style.color = "";
    }

    function irParaDoacao() {
        document.getElementById("doacao").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function mostrarMensagem(texto, cor) {
        mensagem.textContent = texto;
        mensagem.style.color = cor || "";
    }


    // ---------- Máscaras ----------

    function mascaraCPF(valor) {
        return somenteDigitos(valor)
            .substring(0, 11)
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }

    function mascaraCNPJ(valor) {
        return somenteDigitos(valor)
            .substring(0, 14)
            .replace(/^(\d{2})(\d)/, "$1.$2")
            .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/\.(\d{3})(\d)/, ".$1/$2")
            .replace(/(\d{4})(\d)/, "$1-$2");
    }

    function mascaraTelefone(valor) {
        const digitos = somenteDigitos(valor).substring(0, 11);

        if (digitos.length <= 2) {
            return digitos.length ? "(" + digitos : "";
        }
        if (digitos.length <= 6) {
            return digitos.replace(/(\d{2})(\d+)/, "($1) $2");
        }
        if (digitos.length <= 10) {
            return digitos.replace(/(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
        }
        return digitos.replace(/(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
    }

    function aplicarMascara(idCampo, funcaoMascara) {
        const input = document.getElementById(idCampo);
        if (!input) return;

        input.addEventListener("input", function () {
            this.value = funcaoMascara(this.value);
        });
    }

    aplicarMascara("cpfPessoa", mascaraCPF);
    aplicarMascara("cpfRepresentante", mascaraCPF);
    aplicarMascara("cnpjEmpresa", mascaraCNPJ);
    aplicarMascara("numeroPessoa", mascaraTelefone);
    aplicarMascara("numeroEmpresa", mascaraTelefone);


    // ---------- Validações ----------

    function validarCPF(cpf) {
        cpf = somenteDigitos(cpf);

        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
            return false;
        }

        for (let t = 9; t < 11; t++) {
            let soma = 0;

            for (let i = 0; i < t; i++) {
                soma += Number(cpf[i]) * (t + 1 - i);
            }

            const digito = ((soma * 10) % 11) % 10;

            if (digito !== Number(cpf[t])) {
                return false;
            }
        }

        return true;
    }

    function validarCNPJ(cnpj) {
        cnpj = somenteDigitos(cnpj);

        if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
            return false;
        }

        const calcularDigito = function (base) {
            let peso = base.length - 7;
            let soma = 0;

            for (let i = 0; i < base.length; i++) {
                soma += Number(base[i]) * peso--;

                if (peso < 2) {
                    peso = 9;
                }
            }

            const resto = soma % 11;
            return resto < 2 ? 0 : 11 - resto;
        };

        const digito1 = calcularDigito(cnpj.substring(0, 12));
        const digito2 = calcularDigito(cnpj.substring(0, 12) + digito1);

        return cnpj.endsWith(String(digito1) + String(digito2));
    }

    function validarTelefone(telefone) {
        const digitos = somenteDigitos(telefone);
        return digitos.length === 10 || digitos.length === 11;
    }


    // ---------- Identificação: "deseja se declarar?" ----------

    radiosDeclarar.forEach(function (radio) {
        radio.addEventListener("change", function () {
            identificacaoConcluida = false;
            dadosDoador = null;
            limparMensagemIdentificacao();

            if (this.value === "sim") {
                dadosIdentificacao.classList.remove("oculto");
            } else {
                // Anônimo: esconde e limpa tudo
                dadosIdentificacao.classList.add("oculto");
                formPessoaFisica.classList.add("oculto");
                formEmpresa.classList.add("oculto");

                radiosTipoDoador.forEach(function (r) {
                    r.checked = false;
                });

                dadosIdentificacao
                    .querySelectorAll("input[type='text'], input[type='tel']")
                    .forEach(function (input) {
                        input.value = "";
                    });
            }
        });
    });


    // ---------- Identificação: pessoa física ou empresa ----------

    radiosTipoDoador.forEach(function (radio) {
        radio.addEventListener("change", function () {
            identificacaoConcluida = false;
            dadosDoador = null;
            limparMensagemIdentificacao();

            if (this.value === "fisica") {
                formPessoaFisica.classList.remove("oculto");
                formEmpresa.classList.add("oculto");
            } else {
                formEmpresa.classList.remove("oculto");
                formPessoaFisica.classList.add("oculto");
            }
        });
    });


    // ---------- Identificação: coleta e validação ----------

    function coletarPessoaFisica() {
        const nome = campo("nomePessoa");
        const telefone = campo("numeroPessoa");
        const cpf = campo("cpfPessoa");

        if (nome.length < 3) {
            mostrarErroIdentificacao("Informe o nome completo.");
            return null;
        }
        if (!validarTelefone(telefone)) {
            mostrarErroIdentificacao("Informe um número de contato válido, com DDD.");
            return null;
        }
        if (!validarCPF(cpf)) {
            mostrarErroIdentificacao("Informe um CPF válido.");
            return null;
        }

        return {
            tipo: "fisica",
            nome: nome,
            telefone: somenteDigitos(telefone),
            cpf: somenteDigitos(cpf)
        };
    }

    function coletarEmpresa() {
        const nomeEmpresa = campo("nomeEmpresa");
        const cnpj = campo("cnpjEmpresa");
        const telefone = campo("numeroEmpresa");
        const representante = campo("representanteEmpresa");
        const cargo = campo("cargoRepresentante");
        const cpfRepresentante = campo("cpfRepresentante");

        if (nomeEmpresa.length < 2) {
            mostrarErroIdentificacao("Informe o nome da empresa.");
            return null;
        }
        if (!validarCNPJ(cnpj)) {
            mostrarErroIdentificacao("Informe um CNPJ válido.");
            return null;
        }
        if (!validarTelefone(telefone)) {
            mostrarErroIdentificacao("Informe um número de contato válido, com DDD.");
            return null;
        }
        if (representante.length < 3) {
            mostrarErroIdentificacao("Informe o nome do representante da doação.");
            return null;
        }
        if (cargo.length < 2) {
            mostrarErroIdentificacao("Informe o cargo do representante.");
            return null;
        }
        if (!validarCPF(cpfRepresentante)) {
            mostrarErroIdentificacao("Informe um CPF válido para o representante.");
            return null;
        }

        return {
            tipo: "empresa",
            nomeEmpresa: nomeEmpresa,
            cnpj: somenteDigitos(cnpj),
            telefone: somenteDigitos(telefone),
            representante: {
                nome: representante,
                cargo: cargo,
                cpf: somenteDigitos(cpfRepresentante)
            }
        };
    }


    // ---------- Identificação: botão "Continuar" ----------

    botaoContinuar.addEventListener("click", function () {
        limparMensagemIdentificacao();

        const declarar = valorSelecionado("declarar");

        if (!declarar) {
            mostrarErroIdentificacao("Escolha se deseja se declarar ou continuar anônimo.");
            return;
        }

        // Anônimo: pula direto para a área de doação
        if (declarar === "nao") {
            dadosDoador = null;
            identificacaoConcluida = true;
            irParaDoacao();
            return;
        }

        // Identificado: precisa escolher o tipo e preencher
        const tipo = valorSelecionado("tipoDoador");

        if (!tipo) {
            mostrarErroIdentificacao("Escolha se você doará como pessoa física ou empresa.");
            return;
        }

        const dados = tipo === "fisica" ? coletarPessoaFisica() : coletarEmpresa();

        if (!dados) {
            return; // a mensagem de erro já foi exibida
        }

        dadosDoador = dados;
        identificacaoConcluida = true;

        mensagemIdentificacao.textContent = "Dados confirmados!";
        mensagemIdentificacao.style.color = "#3f9a72";

        irParaDoacao();
    });


    // ---------- Código: somente números ----------

    codigoInput.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "").substring(0, 6);
    });


    // ---------- Valor: conversão e formatação ----------

    function converterValor(valor) {
        const numero = valor
            .replace(/\./g, "")
            .replace(",", ".");

        return parseFloat(numero);
    }

    function formatarMoeda(valor) {
        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    valorInput.addEventListener("input", function () {
        const valor = converterValor(this.value);

        if (isNaN(valor)) {
            resumoValor.textContent = "R$ 0,00";
            return;
        }

        resumoValor.textContent = formatarMoeda(valor);
    });


    // ---------- Resumo: forma de pagamento ----------

    const nomesPagamento = {
        "0": "PIX",
        "1": "Débito",
        "2": "Crédito"
    };

    pagamentos.forEach(function (pagamento) {
        pagamento.addEventListener("change", function () {
            resumoPagamento.textContent = nomesPagamento[this.value];
        });
    });


    // ---------- Envio ----------

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        mostrarMensagem("");

        // Etapa de identificação
        if (!identificacaoConcluida) {
            mostrarMensagem("Antes de doar, conclua a etapa de identificação.", "red");

            document.getElementById("identificacao").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
            return;
        }

        // Código
        const codigo = codigoInput.value;

        if (!/^\d{6}$/.test(codigo)) {
            mostrarMensagem("O código deve possuir exatamente 6 números.", "red");
            return;
        }

        // Valor
        const valorReais = converterValor(valorInput.value);

        if (isNaN(valorReais)) {
            mostrarMensagem("Digite um valor válido.", "red");
            return;
        }

        if (valorReais < 10) {
            mostrarMensagem("O valor mínimo da doação é R$ 10,00.", "red");
            return;
        }

        // Pagamento
        const pagamentoSelecionado = document.querySelector(
            'input[name="pagamento"]:checked'
        );

        if (!pagamentoSelecionado) {
            mostrarMensagem("Selecione um meio de pagamento.", "red");
            return;
        }

        // Dados enviados ao back-end (valor em centavos)
        const dados = {
            codigo: codigo,
            valor: Math.round(valorReais * 100),
            pagamento: Number(pagamentoSelecionado.value),
            doador: dadosDoador // null quando a doação é anônima
        };

        console.log("Dados enviados:", dados);

        try {
            const resposta = await fetch("/doacao", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(resultado.mensagem || "Erro ao processar a doação.");
            }

            mostrarMensagem("Doação registrada com sucesso!", "#3f9a72");

            form.reset();
            resumoValor.textContent = "R$ 0,00";
            resumoPagamento.textContent = "-";

        } catch (erro) {
            console.error(erro);
            mostrarMensagem("Não foi possível registrar a doação.", "red");
        }
    });
}
document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       MENU MOBILE
       (o CSS usa .show no menu e .open no botão)
       ========================= */
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    function alternarMenu(abrir) {
        navLinks.classList.toggle("show", abrir);
        menuToggle.classList.toggle("open", abrir);
        menuToggle.setAttribute("aria-expanded", String(abrir));
        menuToggle.setAttribute("aria-label", abrir ? "Fechar menu de navegação" : "Abrir menu de navegação");
    }

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", function () {
            alternarMenu(!navLinks.classList.contains("show"));
        });
        navLinks.addEventListener("click", function (e) {
            if (e.target.closest("a")) alternarMenu(false);
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") alternarMenu(false);
        });
        window.addEventListener("resize", function () {
            if (window.innerWidth > 768) alternarMenu(false);
        });
    }

    /* Se não estiver na página de inscrição, para aqui */
    const formulario = document.getElementById("formularioInscricao");
    if (!formulario) return;

    /* =========================
       ELEMENTOS
       ========================= */
    const botoesTipo = document.querySelectorAll(".tipo-card");
    const tipoInscricao = document.getElementById("tipoInscricao");
    const estado = document.getElementById("inscricaoEstado");
    const resultado = document.getElementById("resultadoLocalizacao");
    const mensagem = document.getElementById("mensagemInscricao");
    const telefone = document.getElementById("inscricaoTelefone");
    const nascimento = document.getElementById("inscricaoNascimento");
    const confirmacao = document.getElementById("confirmacao");
    const novaInscricao = document.getElementById("novaInscricao");
    const cartoesUnidade = document.querySelectorAll(".sede-inscricao[data-uf]");

    /* Unidades: lidas do próprio HTML (data-uf, data-nome, data-endereco),
       então para adicionar uma sede basta editar a seção "Nossas unidades". */
    const unidades = {};
    cartoesUnidade.forEach(function (el) {
        unidades[el.dataset.uf] = { nome: el.dataset.nome, endereco: el.dataset.endereco };
    });

    /* Cada tipo: texto do formulário, bloco exibido e campos obrigatórios */
    const tipos = {
        voluntario: {
            titulo: "Seus dados de voluntário",
            subtitulo: "Conte quem você é e como pode contribuir.",
            bloco: document.getElementById("camposVoluntario"),
            obrigatorios: ["areaVoluntario", "disponibilidadeVoluntario"]
        },
        ajuda: {
            titulo: "Seus dados",
            subtitulo: "Preencha os dados abaixo para que possamos entrar em contato.",
            bloco: document.getElementById("camposAjuda"),
            obrigatorios: ["necessidadeAjuda"]
        }
    };

    /* Ninguém nasce no futuro */
    nascimento.max = new Date().toISOString().split("T")[0];

    /* =========================
       ESCOLHER TIPO
       ========================= */
    function escolherTipo(tipo) {
        tipoInscricao.value = tipo;
        mensagem.textContent = "";
        mensagem.className = "mensagem-inscricao";
        confirmacao.classList.add("oculto");

        botoesTipo.forEach(function (b) {
            const ativo = b.dataset.tipoInscricao === tipo;
            b.classList.toggle("ativo", ativo);
            b.setAttribute("aria-pressed", String(ativo));
        });

        Object.keys(tipos).forEach(function (chave) {
            const t = tipos[chave];
            const ativo = chave === tipo;
            t.bloco.classList.toggle("oculto", !ativo);
            /* Só o tipo escolhido tem campos obrigatórios */
            t.obrigatorios.forEach(function (id) {
                document.getElementById(id).required = ativo;
            });
        });

        document.getElementById("tituloFormulario").textContent = tipos[tipo].titulo;
        document.getElementById("subtituloFormulario").textContent = tipos[tipo].subtitulo;

        formulario.classList.remove("oculto");
        formulario.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    botoesTipo.forEach(function (botao) {
        botao.addEventListener("click", function () {
            escolherTipo(botao.dataset.tipoInscricao);
        });
    });

    /* =========================
       MÁSCARA DO TELEFONE
       ========================= */
    telefone.addEventListener("input", function () {
        const n = telefone.value.replace(/\D/g, "").slice(0, 11);
        let v = n;
        if (n.length > 10) v = n.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
        else if (n.length > 6) v = n.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
        else if (n.length > 2) v = n.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
        else if (n.length > 0) v = "(" + n;
        telefone.value = v;
    });

    /* =========================
       UNIDADE MAIS PRÓXIMA
       ========================= */
    function verificarLocalizacao() {
        cartoesUnidade.forEach(function (el) {
            el.classList.toggle("destaque", el.dataset.uf === estado.value);
        });

        if (!estado.value) {
            resultado.classList.add("oculto");
            return;
        }

        const unidade = unidades[estado.value];
        resultado.classList.remove("oculto");

        if (unidade) {
            resultado.className = "resultado-localizacao sucesso";
            resultado.innerHTML =
                "<strong>Há uma unidade da Conexão BR no seu estado.</strong>" +
                "<p>Unidade: <strong>" + unidade.nome + "</strong></p>" +
                "<p>Endereço: " + unidade.endereco + "</p>";
        } else {
            resultado.className = "resultado-localizacao alerta";
            resultado.innerHTML =
                "<strong>Ainda não temos unidade neste estado.</strong>" +
                "<p>Você pode enviar a inscrição mesmo assim: guardaremos seus dados e avisaremos quando chegarmos à sua região.</p>";
        }
    }
    estado.addEventListener("change", verificarLocalizacao);

    /* =========================
       ENVIO
       ========================= */
    function mostrarMensagem(texto, tipo) {
        mensagem.className = "mensagem-inscricao " + tipo;
        mensagem.textContent = texto;
    }

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();
        mostrarMensagem("", "");

        if (!tipoInscricao.value) {
            mostrarMensagem("Escolha uma das opções acima.", "erro");
            return;
        }

        /* O navegador valida os campos obrigatórios e mostra o aviso no campo certo */
        if (!formulario.checkValidity()) {
            formulario.reportValidity();
            return;
        }

        /* Dados prontos para enviar ao servidor (só os do tipo escolhido) */
        const dados = Object.fromEntries(new FormData(formulario));
        const outro = tipoInscricao.value === "voluntario" ? "ajuda" : "voluntario";
        tipos[outro].bloco.querySelectorAll("[name]").forEach(function (c) { delete dados[c.name]; });
        delete dados.undefined;

        /* TODO: enviar `dados` para o seu back-end ou serviço de formulários, ex.:
           fetch("/api/inscricao", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(dados) }) */

        formulario.reset();
        tipoInscricao.value = "";
        formulario.classList.add("oculto");
        resultado.classList.add("oculto");
        cartoesUnidade.forEach(function (el) { el.classList.remove("destaque"); });
        botoesTipo.forEach(function (b) {
            b.classList.remove("ativo");
            b.setAttribute("aria-pressed", "false");
        });

        confirmacao.classList.remove("oculto");
        confirmacao.focus();
    });

    novaInscricao.addEventListener("click", function () {
        confirmacao.classList.add("oculto");
        document.querySelector(".tipo-inscricao").scrollIntoView({ behavior: "smooth", block: "center" });
    });
});
