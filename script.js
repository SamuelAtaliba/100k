let chartInstance = null;
let valoresAnuais = [];

document.getElementById('selic').addEventListener('input', function() {
    const selicAnual = parseFloat(this.value);
    if (!isNaN(selicAnual)) {
        const selicMensal = ((1 + selicAnual / 100) ** (1 / 12) - 1) * 100;
        document.getElementById('selicMensal').textContent = `Taxa Selic Mensal: ${selicMensal.toFixed(4)}%`;
    }
});

document.getElementById('calcularBtn').addEventListener('click', function() {
    const aporteMensal = parseFloat(document.getElementById('aporte').value);
    const anos = parseInt(document.getElementById('anos').value);
    const selicAnual = parseFloat(document.getElementById('selic').value);
    const selicMensal = ((1 + selicAnual / 100) ** (1 / 12)) - 1;

    if (isNaN(aporteMensal) || isNaN(anos) || isNaN(selicAnual)) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    if (chartInstance) {
        chartInstance.destroy();
    }

    valoresAnuais = [];
    let valorAcumulado = 0;
    let dadosAporte = [];
    let dadosRendimento = [];

    for (let i = 1; i <= anos; i++) {
        let acumuladoAno = 0;
        for (let j = 0; j < 12; j++) {
            valorAcumulado += aporteMensal;
            let rendimento = valorAcumulado * selicMensal;
            valorAcumulado += rendimento;
            acumuladoAno += rendimento;
        }
        dadosAporte.push(aporteMensal * 12);
        dadosRendimento.push(acumuladoAno.toFixed(2));
        valoresAnuais.push({
            ano: i,
            valorAportado: (aporteMensal * 12).toFixed(2),
            diferenca: acumuladoAno.toFixed(2),
            valorAcumulado: valorAcumulado.toFixed(2)
        });
    }

    chartInstance = gerarGrafico(valoresAnuais, dadosAporte, dadosRendimento);
});

function gerarGrafico(dados, dadosAporte, dadosRendimento) {
    const ctx = document.getElementById('investmentChart').getContext('2d');
    const anos = dados.map(item => `Ano ${item.ano}`);

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: anos,
            datasets: [{
                label: 'Valor Acumulado (R$)',
                data: dados.map(item => item.valorAcumulado),
                backgroundColor: '#00b4d8'
            }, {
                label: 'Aportes (R$)',
                data: dadosAporte,
                backgroundColor: '#90e0ef'
            }, {
                label: 'Rendimentos (R$)',
                data: dadosRendimento,
                backgroundColor: '#0077b6'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function exportarDadosCSV(dados) {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Ano,Valor Aportado,Rendimento,Valor Acumulado\n";
    dados.forEach(function(item) {
        csvContent += `${item.ano},${item.valorAportado},${item.diferenca},${item.valorAcumulado}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "dados_investimento.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
