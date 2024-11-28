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

    // Carrega os dados de preços e calcula o orçamento
    loadPriceData().then(priceData => {
        const result = calculateBudget(data, priceData);
        updateUI(result);
    }).catch(error => {
        console.error('Erro ao carregar os dados de preços:', error);
        alert('Erro ao carregar os dados de preços.');
    });
});

// Função para carregar os dados de preços do arquivo JSON
async function loadPriceData() {
    try {
        const response = await fetch('https://void-cla.github.io/voidsun/dados_preco.json');
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

    // Verifica os preços com base nos dados do formulário
    const preco_consumo = priceData.preco_consumo[consumo] || 0;
    const preco_kwp = priceData.preco_kwp[potencia] || 0;
    const preco_kit = priceData.kits_solares[kit] || 0;
    const preco_telhado = priceData.telhados[telhado] || 0;

    // Calcula o preço total, com desconto se aplicável
    const preco_final = preco_consumo + preco_kwp + preco_kit + preco_telhado;
    const pix_desconto = preco_final * priceData.desconto_pix;
    const preco_final_com_desconto = preco_final - pix_desconto;
    const preco_parcelado = preco_final_com_desconto / priceData.parcelamento_maximo;

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
    };
}

// Função para atualizar a interface com os resultados do orçamento
function updateUI(result) {
    document.getElementById('nome').textContent = result.nome;
    document.getElementById('telefone').textContent = result.telefone;
    document.getElementById('consumo').textContent = result.consumo;
    document.getElementById('potencia').textContent = result.potencia;
    document.getElementById('kit').textContent = result.kit;
    document.getElementById('tipoTelhado').textContent = result.telhado;
    document.getElementById('total').textContent = result.preco_final.toFixed(2);

    // Exibe a seção de orçamento e oculta o formulário
    document.getElementById('orcamento-section').style.display = 'block';
    document.querySelector('.form-container').style.display = 'none';
}

// Função para baixar o orçamento como PDF
function downloadPDF() {
    const element = document.getElementById('content');
    const downloadButton = document.querySelector('.download-button');

    // Coleta o nome do cliente para nome do arquivo
    const nomeCliente = document.querySelector('input[name="nome"]').value;

    // Oculta o botão para que ele não apareça no PDF
    downloadButton.style.display = 'none';

    // Cria um novo elemento temporário com o conteúdo do HTML e o estilo
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = document.body.innerHTML;
    tempDiv.style.padding = '20px';
    tempDiv.style.backgroundColor = document.body.style.backgroundColor;
    tempDiv.style.fontFamily = document.body.style.fontFamily;

    // Configura as opções do HTML2PDF
    const options = {
        margin: 10,
        filename: `${nomeCliente}_orcamento_solar.pdf`, 
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2, 
            useCORS: true, 
            logging: false, 
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' 
        }
    };

    // Gera o PDF a partir do conteúdo
    html2pdf().set(options).from(tempDiv).save().then(() => {
        // Exibe o botão novamente após o download
        downloadButton.style.display = 'block';
    });
}

// Adiciona o evento de clique para o botão de download de PDF
document.querySelector('.download-button').addEventListener('click', downloadPDF);
