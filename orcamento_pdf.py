import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from flask import render_template

# Função para gerar o PDF
def generate_pdf(nome, telefone, consumo, potencia, kit, tipo_telhado, preco_final, pix_desconto, preco_parcelado):
    # Caminho para salvar o PDF gerado
    pdf_filename = f"{nome.replace(' ', '_')}_orcamento.pdf"  # Adicionando _orcamento para diferenciar
    pdf_path = os.path.join('static', 'pdfs', pdf_filename)
    
    # Cria o diretório pdfs caso não exista
    if not os.path.exists('static/pdfs'):
        os.makedirs('static/pdfs')
    
    # Cria um objeto canvas para o PDF
    c = canvas.Canvas(pdf_path, pagesize=letter)

    # Definindo o título e conteúdo
    c.setFont("Helvetica", 12)
    
    c.drawString(100, 750, f"Orçamento Solar - {nome}")
    c.drawString(100, 730, f"Telefone: {telefone}")
    c.drawString(100, 710, f"Consumo: {consumo} kWh")
    c.drawString(100, 690, f"Potência: {potencia} kWp")
    c.drawString(100, 670, f"Kit Solar: {kit}")
    c.drawString(100, 650, f"Telhado: {tipo_telhado}")
    c.drawString(100, 630, f"Preço Final: R$ {preco_final:.2f}")
    c.drawString(100, 610, f"Desconto do PIX: R$ {pix_desconto:.2f}")
    c.drawString(100, 590, f"Preço Parcelado: R$ {preco_parcelado:.2f}")
    
    # Salvar o PDF
    c.save()

    # Retorna o caminho do arquivo gerado
    return pdf_path
