from flask import Flask, render_template, abort, request, jsonify
from flask_cors import CORS
import json
import math
import matplotlib
matplotlib.use('Agg')  # <- importante para rodar no Render
import matplotlib.pyplot as plt
import io
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
from reportlab.platypus import Image

app = Flask(__name__)
CORS(app)

def carregar_json(caminho):
    with open(caminho, encoding='utf-8') as arquivo:
        return json.load(arquivo)

def calcular_sistema(consumo_mensal, tarifa, hsp):
    perdas = 0.8
    potencia_kwp = consumo_mensal / (hsp * 30 * perdas)
    producao_anual = potencia_kwp * hsp * 365 * perdas
    potencia_modulo = 0.55
    num_modulos = math.ceil(potencia_kwp / potencia_modulo)
    potencia_ajustada = num_modulos * potencia_modulo
    area_necessaria = num_modulos * 2.1
    peso_estimado = num_modulos * 24
    return {
        "potencia_kwp": round(potencia_ajustada, 2),
        "num_modulos": num_modulos,
        "producao_anual_kwh": round(producao_anual, 0),
        "area_m2": round(area_necessaria, 2),
        "peso_kg": round(peso_estimado, 2)
    }

@app.route('/calcular', methods=['POST'])
def calcular():
    dados = request.get_json()
    estado_id = dados.get('estado_id')
    cidade_id = dados.get('cidade_id')
    distribuidora_id = dados.get('distribuidora_id')
    consumo = dados.get('consumo')
    tipo_tarifa = dados.get('tipo_tarifa')

    estados = carregar_json('static/json/estados.json')
    cidades = carregar_json('static/json/cidades.json')
    distribuidoras = carregar_json('static/json/distribuidoras.json')
    hsp_dados = carregar_json('static/json/hsp_estado.json')

    estado = next((e for e in estados if e['ID'] == str(estado_id)), None)
    cidade = next((c for c in cidades if c['ID'] == str(cidade_id)), None)
    distribuidora = next((d for d in distribuidoras if d['ID'] == distribuidora_id), None)
    hsp_info = next((h for h in hsp_dados if h['Estado'] == int(estado_id)), None)

    if not (estado and cidade and distribuidora and hsp_info):
        return jsonify({"erro": "Dados não encontrados."}), 404

    hsp = hsp_info['hsp_estado']
    tarifa = distribuidora[tipo_tarifa]

    resultado = calcular_sistema(consumo, tarifa, hsp)

    co2_reduzido = resultado['producao_anual_kwh'] * 0.001747
    arvores_equivalentes = resultado['producao_anual_kwh'] * 0.000012
    km_evitados = resultado['producao_anual_kwh'] * 0.1
    economia_mensal = consumo * tarifa
    economia_30_anos = economia_mensal * 12 * 30
    economia_acumulada = [round(economia_mensal * 12 * ano, 2) for ano in range(2, 32, 2)]

    return jsonify({
        "estado": estado['Nome'],
        "cidade": cidade['Nome'],
        "distribuidora": distribuidora['Nome'],
        "tarifa": tarifa,
        "consumo": consumo,
        "economia_mensal": round(economia_mensal, 2),
        "economia_30_anos": round(economia_30_anos, 2),
        "co2_reduzido": round(co2_reduzido, 2),
        "arvores_equivalentes": round(arvores_equivalentes, 2),
        "km_evitados": round(km_evitados, 2),
        "economia_acumulada": economia_acumulada,
        "dados_sistema": resultado
    })

# Função auxiliar, caso queira usar depois
def gerar_grafico(economia_acumulada):
    plt.figure(figsize=(6, 4))
    anos = list(range(2, 32, 2))
    plt.plot(anos, economia_acumulada, marker='o', color='#ffbb00')
    plt.fill_between(anos, economia_acumulada, color='#ffbb00', alpha=0.2)
    plt.title('Economia Acumulada (R$)')
    plt.xlabel('Anos')
    plt.ylabel('Valor (R$)')
    plt.grid(True)

    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close()
    buf.seek(0)
    return buf

@app.route('/')
def index():
    return render_template('UPXSolaris.html')

@app.route('/calculadora')
def calculadora():
    return render_template('CalculadoraSolar.html')

@app.route('/consultoria-personalizada')
def consultoria_personalizada():
    return render_template('ConsultoriaPersonalizada.html')

@app.route('/faq')
def faq():
    return render_template('FAQ.html')

@app.route('/sobre-nos')
def sobre_nos():
    return render_template('SobreNos.html')

if __name__ == '__main__':
    app.run(debug=True)


