// Manipulador do formulário para calcular o orçamento
document.getElementById('input-container').addEventListener('submit', (event) => {
    event.preventDefault();

    // Coleta os dados do formulário
    const data = {
        nome: document.querySelector('input[name="nome"]').value,
        telefone: document.querySelector('input[name="telefone"]').value,
        consumo: document.querySelector('input[name="consumo"]').value,
        potencia: document.querySelector('input[name="potencia"]').value,
        kit: document.querySelector('select[name="kit"]').value,
        telhado: document.querySelector('select[name="telhado"]').value
    };

    // Carrega os dados de preços
    loadPriceData().then(priceData => {
        // Realiza o cálculo do orçamento
        const result = calculateBudget(data, priceData);

        // Preenche a seção de orçamento com os dados retornados
        document.getElementById('nome').textContent = result.nome;
        document.getElementById('telefone').textContent = result.telefone;
        document.getElementById('consumo').textContent = result.consumo;
        document.getElementById('potencia').textContent = result.potencia;
        document.getElementById('kit').textContent = result.kit;
        document.getElementById('tipoTelhado').textContent = result.telhado;
        document.getElementById('total').textContent = result.preco_final.toFixed(2);

        // Exibe a seção de orçamento
        document.getElementById('orcamento-section').style.display = 'block';

        // Oculta o formulário
        document.querySelector('.form-container').style.display = 'none';
    }).catch(error => {
        console.error('Erro ao carregar os dados de preços:', error);
        alert('Erro ao carregar os dados de preços.');
    });
});

// Função para carregar os dados de preços do arquivo JSON
async function loadPriceData() {
    try {
        const response = await fetch('/dados_preco.json');  // Ajuste o caminho se necessário
        if (!response.ok) throw new Error('Erro ao carregar os dados de preços');
        return await response.json();
    } catch (error) {
        console.error('Erro ao carregar os dados de preços:', error);
        throw new Error('Não foi possível carregar os dados de preços');
    }
}

// Função para calcular o orçamento com base nos dados fornecidos
function calculateBudget(data, priceData) {
    const consumo = parseFloat(data.consumo);
    const potencia = parseFloat(data.potencia);
    const kit = data.kit;
    const telhado = data.telhado;

    // Verifica se os valores de consumo, potência, etc., estão no arquivo de preços, senão usa 0
    const preco_consumo = priceData.preco_consumo[consumo] || 0;
    const preco_kwp = priceData.preco_kwp[potencia] || 0;
    const preco_kit = priceData.kits_solares[kit] || 0;
    const preco_telhado = priceData.telhados[telhado] || 0;

    // Calcula o preço total
    const preco_final = preco_consumo + preco_kwp + preco_kit + preco_telhado;
    const pix_desconto = preco_final * priceData.desconto_pix;  // Desconto para pagamento via PIX
    const preco_final_com_desconto = preco_final - pix_desconto;
    const preco_parcelado = preco_final_com_desconto / priceData.parcelamento_maximo;  // Parcelamento em 12x

    return {
        nome: data.nome,
        telefone: data.telefone,
        consumo: data.consumo,
        potencia: data.potencia,
        kit: data.kit,
        telhado: data.telhado,
        preco_final: preco_final_com_desconto,
        pix_desconto: pix_desconto,
        preco_parcelado: preco_parcelado,
        pdf_path: '/arquivo_gerado.pdf' 
    };
}

// Função para baixar o orçamento como PDF
function downloadPDF() {
    const element = document.getElementById('content');

    const options = {
        margin: 1,
        filename: 'orcamento_solar.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(options).from(element).save();
}

// Associar a função de download ao botão
document.querySelector('.download-button').addEventListener('click', downloadPDF);
