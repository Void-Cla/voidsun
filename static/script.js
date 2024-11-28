document.getElementById('budgetForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const data = {
        nome: document.getElementById('nome').value,
        telefone: document.getElementById('telefone').value,
        consumo: document.getElementById('consumo').value,
        potencia: document.getElementById('potencia').value,
        kit: document.getElementById('kit').value,
        tipoTelhado: document.getElementById('tipoTelhado').value,
        modeloModulo: document.getElementById('modeloModulo').value,
        inversor: document.getElementById('inversor').value
    };

    const response = await fetch('/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
        document.getElementById('message').textContent = result.message;
        document.getElementById('total').textContent = `Preço total: R$ ${result.total}`;
        document.getElementById('pdfLink').href = result.pdf_url;
        document.getElementById('pdfLink').textContent = 'Baixar PDF';
    } else {
        document.getElementById('message').textContent = 'Erro ao calcular orçamento';
    }
});
