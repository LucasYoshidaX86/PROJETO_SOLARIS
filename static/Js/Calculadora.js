let respostasUsuario = {
    etapa1: {},
    etapa2: {},
    etapa3: {},
    etapa4: {},
    etapa5: {}
};

let estados = [];
let cidades = [];
let distribuidoras = [];

// ================= CARREGAR CSS =================
function carregarEstilo(cssFile) {
    const estiloAnterior = document.getElementById('estilo-etapa');
    if (estiloAnterior) estiloAnterior.remove();

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssFile;
    link.id = 'estilo-etapa';
    document.head.appendChild(link);
}

// ================= ETAPA 1 =================
function carregarEtapa1() {
    carregarEstilo('/static/Styles/StylesCalculadoraE01.css');
    fetch("/static/etapas/Etapa01.html")
        .then(res => res.text())
        .then(html => {
            document.getElementById("container-etapas").innerHTML = html;

            const estadoSelect = document.getElementById("estado");
            const cidadeSelect = document.getElementById("cidade");
            const btnAvancar = document.getElementById("btnAvancar");

            carregarDadosEstadosECidades().then(() => {
                popularEstados(estadoSelect);

                if (respostasUsuario.etapa1.estado) {
                    estadoSelect.value = respostasUsuario.etapa1.estado;
                    popularCidades(estadoSelect.value, cidadeSelect);
                    cidadeSelect.value = respostasUsuario.etapa1.cidade;
                    btnAvancar.disabled = !(estadoSelect.value && cidadeSelect.value);
                }
            });

            estadoSelect.addEventListener("change", () => {
                popularCidades(estadoSelect.value, cidadeSelect);
                cidadeSelect.value = "";
                btnAvancar.disabled = true;
            });

            cidadeSelect.addEventListener("change", () => {
                btnAvancar.disabled = !(estadoSelect.value && cidadeSelect.value);
            });

            btnAvancar.addEventListener("click", () => {
                const cidadeSelecionada = cidades.find(c => c.Nome === cidadeSelect.value && c.Estado === estadoSelect.value);
                respostasUsuario.etapa1 = {
                    estado: estadoSelect.value,
                    cidade: cidadeSelecionada.ID
                };
                carregarEtapa2();
            });
        });
}

function carregarDadosEstadosECidades() {
    return Promise.all([
        fetch('/static/Json/Estados.json').then(res => res.json()).then(data => estados = data),
        fetch('/static/Json/Cidades.json').then(res => res.json()).then(data => cidades = data)
    ]);
}

function popularEstados(select) {
    select.innerHTML = '<option value="">Selecione o estado</option>';
    estados.forEach(e => {
        const opt = document.createElement("option");
        opt.value = e.ID;
        opt.textContent = e.Nome;
        select.appendChild(opt);
    });
}

function popularCidades(idEstado, select) {
    select.innerHTML = '<option value="">Selecione a cidade</option>';
    const cidadesFiltradas = cidades.filter(c => c.Estado === idEstado);
    cidadesFiltradas.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.Nome;
        opt.textContent = c.Nome;
        select.appendChild(opt);
    });
}

// ================= ETAPA 2 =================
function carregarEtapa2() {
    carregarEstilo('/static/Styles/StylesCalculadoraE02.css');
    fetch("/static/etapas/Etapa02.html")
        .then(res => res.text())
        .then(html => {
            document.getElementById("container-etapas").innerHTML = html;

            const btnAvancar = document.getElementById("btnAvancar");
            const btnVoltar = document.getElementById("btnVoltar");
            const opcoes = document.querySelectorAll('.opcao');

            btnAvancar.disabled = true;

            if (respostasUsuario.etapa2.tipo) {
                opcoes.forEach(op => {
                    if (op.id === respostasUsuario.etapa2.tipo) {
                        op.classList.add('selecionado');
                        btnAvancar.disabled = false;
                    }
                });
            }

            opcoes.forEach(opcao => {
                opcao.addEventListener('click', () => {
                    opcoes.forEach(o => o.classList.remove('selecionado'));
                    opcao.classList.add('selecionado');
                    respostasUsuario.etapa2 = { tipo: opcao.id };
                    btnAvancar.disabled = false;
                });
            });

            btnAvancar.addEventListener('click', carregarEtapa3);
            btnVoltar.addEventListener('click', carregarEtapa1);
        });
}

// ================= ETAPA 3 =================
function carregarEtapa3() {
    carregarEstilo('/static/Styles/StylesCalculadoraE03.css');
    fetch("/static/etapas/Etapa03.html")
        .then(res => res.text())
        .then(html => {
            document.getElementById("container-etapas").innerHTML = html;

            const distribuidoraSelect = document.getElementById("distribuidora");
            const tarifaInput = document.getElementById("tarifa");
            const btnAvancar = document.getElementById("btnAvancar");
            const btnVoltar = document.getElementById("btnVoltar");

            btnAvancar.disabled = true;

            carregarDistribuidoras().then(() => {
                popularDistribuidoras(distribuidoraSelect);

                if (respostasUsuario.etapa3.distribuidora) {
                    distribuidoraSelect.value = respostasUsuario.etapa3.distribuidora;
                    const tarifa = respostasUsuario.etapa3.tarifa;
                    tarifaInput.value = `R$ ${tarifa.toFixed(2).replace('.', ',')}`;
                    btnAvancar.disabled = false;
                }
            });

            distribuidoraSelect.addEventListener('change', () => {
                const dist = distribuidoras.find(d => d.ID == distribuidoraSelect.value);
                if (dist) {
                    const tipo = respostasUsuario.etapa2.tipo;
                    const tarifa = parseFloat(dist[tipo]);
                    tarifaInput.value = `R$ ${tarifa.toFixed(2).replace('.', ',')}`;
                    respostasUsuario.etapa3 = { distribuidora: dist.ID, tarifa: tarifa };
                    btnAvancar.disabled = false;
                } else {
                    tarifaInput.value = '';
                    btnAvancar.disabled = true;
                }
            });

            tarifaInput.addEventListener('input', () => {
                const valor = tarifaInput.value.replace("R$", "").trim().replace(",", ".");
                const numero = parseFloat(valor);

                if (!isNaN(numero) && numero > 0) {
                    respostasUsuario.etapa3.tarifa = numero;
                    btnAvancar.disabled = false;
                } else {
                    respostasUsuario.etapa3.tarifa = null;
                    btnAvancar.disabled = true;
                }
            });

            tarifaInput.addEventListener('blur', () => {
                const numero = respostasUsuario.etapa3.tarifa;
                if (numero) {
                    tarifaInput.value = `R$ ${numero.toFixed(2).replace('.', ',')}`;
                }
            });

            tarifaInput.addEventListener('focus', () => {
                tarifaInput.value = tarifaInput.value.replace("R$", "").trim().replace(",", ".");
            });

            btnAvancar.addEventListener('click', carregarEtapa4);
            btnVoltar.addEventListener('click', carregarEtapa2);
        });
}

function carregarDistribuidoras() {
    return fetch('/static/Json/distribuidoras.json')
        .then(res => res.json())
        .then(data => distribuidoras = data.filter(d => d.Estado == respostasUsuario.etapa1.estado));
}

function popularDistribuidoras(select) {
    select.innerHTML = '<option value="">Selecione uma companhia</option>';
    distribuidoras.forEach(d => {
        const opt = document.createElement("option");
        opt.value = d.ID;
        opt.textContent = d.Nome;
        select.appendChild(opt);
    });
}

// ================= ETAPA 4 =================
function carregarEtapa4() {
    carregarEstilo('/static/Styles/StylesCalculadoraE04.css');
    fetch("/static/etapas/Etapa04.html")
        .then(res => res.text())
        .then(html => {
            document.getElementById("container-etapas").innerHTML = html;

            const gastoInput = document.getElementById("gastoMensal");
            const btnAvancar = document.getElementById("btnAvancar");
            const btnVoltar = document.getElementById("btnVoltar");

            if (respostasUsuario.etapa4.gasto) {
                gastoInput.value = `R$ ${respostasUsuario.etapa4.gasto.toFixed(2).replace('.', ',')}`;
                btnAvancar.disabled = false;
            } else {
                btnAvancar.disabled = true;
            }

            gastoInput.addEventListener('input', () => {
                const valor = parseFloat(gastoInput.value.replace("R$", "").replace(",", "."));
                if (!isNaN(valor) && valor > 0) {
                    respostasUsuario.etapa4 = { gasto: valor };
                    btnAvancar.disabled = false;
                } else {
                    btnAvancar.disabled = true;
                }
            });

            gastoInput.addEventListener('blur', () => {
                const numero = respostasUsuario.etapa4.gasto;
                if (numero) {
                    gastoInput.value = `R$ ${numero.toFixed(2).replace('.', ',')}`;
                }
            });

            gastoInput.addEventListener('focus', () => {
                gastoInput.value = gastoInput.value.replace("R$", "").trim().replace(",", ".");
            });

            btnAvancar.addEventListener('click', carregarEtapa5);
            btnVoltar.addEventListener('click', carregarEtapa3);
        });
}

// ================= ETAPA 5 =================
function carregarEtapa5() {
    carregarEstilo('/static/Styles/StylesCalculadoraE05.css');
    fetch("/static/etapas/Etapa05.html")
        .then(res => res.text())
        .then(html => {
            document.getElementById("container-etapas").innerHTML = html;

            const btnVoltar = document.getElementById("btnVoltar");
            const btnGrafico = document.getElementById("btnVerGrafico");

            fetch(`/calcular`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    estado_id: respostasUsuario.etapa1.estado,
                    cidade_id: respostasUsuario.etapa1.cidade,
                    distribuidora_id: respostasUsuario.etapa3.distribuidora,
                    consumo: respostasUsuario.etapa4.gasto,
                    tipo_tarifa: respostasUsuario.etapa2.tipo
                })
            })
            .then(res => res.json())
            .then(dados => {
                preencherCards(dados);
                inicializarGrafico();
                atualizarGrafico(dados.economia_acumulada_anos);


                // Evento gráfico
                btnGrafico.addEventListener('click', () => {
                    document.getElementById('grafico').scrollIntoView({ behavior: 'smooth' });
                });
            })
            .catch(erro => {
                console.error('Erro na requisição:', erro);
            });

            btnVoltar.addEventListener('click', carregarEtapa4);
        });
}


function preencherCards(dados) {
    document.getElementById("investimento").innerHTML = `
        <p>Potência Sugerida: <span>${dados.potencia_sugerida_kwp} kWp</span></p>
        <p>Número de Módulos: <span>${dados.numero_de_modulos}</span></p>
        <p>Produção Anual: <span>${dados.producao_anual_kwh} kWh</span></p>
        <p>Área Necessária: <span>${dados.area_necessaria_m2} m²</span></p>
        <p>Peso Estimado: <span>${dados.peso_estimado_kg} kg</span></p>
        <p><strong>Investimento Estimado:</strong> <span>R$ ${dados.investimento_total_reais.toLocaleString('pt-BR')}</span></p>
    `;

    document.getElementById("economia").innerHTML = `
        <p><strong>Estado:</strong> <span>${dados.estado}</span></p>
        <p><strong>Cidade:</strong> <span>${dados.cidade}</span></p>
        <p><strong>Distribuidora:</strong> <span>${dados.distribuidora}</span></p>
        <p><strong>Tarifa utilizada:</strong> <span>R$ ${dados.tarifa_utilizada.toFixed(2)} /kWh</span></p>
        <p><strong>Consumo Mensal Informado:</strong> <span>${dados.consumo_mensal_kwh} kWh</span></p>
        <hr>
        <p>Economia Mensal: <span>R$ ${dados.economia_mensal_reais.toLocaleString('pt-BR')}</span></p>
        <p>Economia em 30 Anos: <span>R$ ${dados.economia_30_anos_reais.toLocaleString('pt-BR')}</span></p>
    `;

    document.getElementById("ambiental").innerHTML = `
        <p>Redução de CO₂: <span>${dados.co2_reduzido_kg} kg/ano</span></p>
        <p>Árvores Plantadas Equivalentes: <span>${dados.arvores_equivalentes}</span></p>
        <p>Cobertura Média Residencial: <span>${dados.cobertura_percentual}%</span></p>
        <p>Km Evitados: <span>${dados.km_evitados} km/ano</span></p>
    `;
}
