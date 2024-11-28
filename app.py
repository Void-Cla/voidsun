from flask import Flask, request, render_template, send_file, jsonify
import json
import os
from orcamento_pdf import generate_pdf

app = Flask(__name__)

# Função para carregar os preços do arquivo JSON
def load_prices():
    with open('dados_preco.json', 'r') as file:
        return json.load(file)

# Rota principal que exibe o formulário HTML
@app.route('/')
def index():
    return render_template('index.html')

# Rota para calcular o orçamento e gerar o PDF
@app.route('/calculate', methods=['POST'])
def calculate_budget():
    try:
        # Obtendo os dados do formulário
        nome = request.form['nome']
        telefone = request.form['telefone']
        consumo = float(request.form['consumo'])
        potencia = float(request.form['potencia'])
        kit = request.form['kit']
        tipo_telhado = request.form['telhado']

        # Carregando os preços do arquivo JSON
        with open('dados_preco.json', 'r') as f:
            prices = json.load(f)

        # Acessando os preços corretamente
        preco_consumo = prices['preco_consumo'].get(str(consumo), 0)
        preco_kwp = prices['preco_kwp'].get(str(potencia), 0)
        preco_kit = prices['kits_solares'].get(kit, 0)
        preco_telhado = prices['telhados'].get(tipo_telhado, 0)

        # Calculando o preço total
        preco_final = preco_consumo + preco_kwp + preco_kit + preco_telhado

        # Calculando o desconto do PIX
        pix_desconto = preco_final * prices['desconto_pix']
        preco_final_com_desconto = preco_final - pix_desconto

        # Calculando o parcelamento
        preco_parcelado = preco_final_com_desconto / prices['parcelamento_maximo']

        # Gerar o PDF
        pdf_path = generate_pdf(nome, telefone, consumo, potencia, kit, tipo_telhado, preco_final_com_desconto, pix_desconto, preco_parcelado)

        if pdf_path:
            filename = os.path.basename(pdf_path)  # Apenas o nome do arquivo para enviar ao cliente
            return render_template('orcamento.html', nome=nome, telefone=telefone, consumo=consumo, potencia=potencia,
                                   kit=kit, tipo_telhado=tipo_telhado, preco_final=preco_final_com_desconto,
                                   pix_desconto=pix_desconto, preco_parcelado=preco_parcelado, filename=filename)
        else:
            return "Erro ao gerar o PDF", 500
    except Exception as e:
        return str(e), 500

# Rota para baixar o PDF gerado
@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    file_path = os.path.join('static', 'pdfs', filename)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    return jsonify({'error': 'Arquivo não encontrado'}), 404

if __name__ == '__main__':
    app.run(debug=True)
