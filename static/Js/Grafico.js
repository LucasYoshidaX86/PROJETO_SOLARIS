let grafico;

function inicializarGrafico() {
    const ctx = document.getElementById('graficoCanvas').getContext('2d');

    if (grafico) {
        grafico.destroy();
    }

    grafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: gerarLabelsAnos(),
            datasets: [{
                label: 'Economia acumulada (R$)',
                data: [],
                borderColor: '#ffbb00',
                backgroundColor: 'rgba(255, 187, 0, 0.2)',
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#ffbb00'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'top' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'R$ ' + context.parsed.y.toLocaleString('pt-BR');
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
}

function atualizarGrafico(novosDados) {
    if (grafico) {
        grafico.data.datasets[0].data = novosDados;
        grafico.update();
    }
}

function gerarLabelsAnos() {
    const labels = [];
    for (let ano = 2; ano <= 30; ano += 2) {
        labels.push(`${ano} anos`);
    }
    return labels;
}

