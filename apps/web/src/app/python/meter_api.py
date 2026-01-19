# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import re
import pyphen
from string import punctuation
import socket
import subprocess
import os
import json
import time

# #region agent log
def debug_log(location, message, data=None, hypothesis_id=None):
    try:
        log_entry = {
            "timestamp": int(time.time() * 1000),
            "location": location,
            "message": message,
            "data": data or {},
            "sessionId": "debug-session",
            "runId": "run1",
            "hypothesisId": hypothesis_id
        }
        with open("/Users/pretosmediagroupllc/Documents/GitHub/pretossidebar/.cursor/debug.log", "a") as f:
            f.write(json.dumps(log_entry) + "\n")
    except:
        pass
# #endregion

app = Flask(__name__)
# Allow Next.js dev servers on 3000 and 3001
CORS(app, resources={r"/analyze": {"origins": ["http://localhost:3000", "http://localhost:3001"]}})

# Use port 5001 to avoid conflict with AirPlay Receiver on macOS (which uses port 5000)
FLASK_PORT = 5001

# #region agent log
debug_log("meter_api.py:20", "Script iniciado", {"FLASK_PORT": FLASK_PORT}, "C")
# #endregion

# Create a Pyphen dictionary for Portuguese.
# Use 'pt_PT' for European Portuguese or 'pt_BR' for Brazilian Portuguese.
dic = pyphen.Pyphen(lang='pt_PT')

def get_word_syllables(word):
    # Remove punctuation and lowercase the word
    w = word.lower().strip(".,;:!?()[]{}\"'")
    # Use pyphen to insert hyphens for syllable breaks, then split.
    syllables = dic.inserted(w).split('-')
    return syllables

def get_portuguese_scansion(word):
    syllables = get_word_syllables(word)
    if not syllables:
        return ""
    # Look for an accented syllable.
    stressed_index = -1
    accent_chars = "áàâãéêíóôõú"
    for i, syll in enumerate(syllables):
        if any(ch in syll for ch in accent_chars):
            stressed_index = i
            break
    # If no accented syllable is found, apply a default rule:
    # If word ends in a vowel, 'n' or 's', stress penultimate syllable; otherwise stress last syllable.
    if stressed_index == -1:
        w = word.lower().strip(".,;:!?()[]{}\"'")
        if w and w[-1] in "aeiouns":
            stressed_index = len(syllables) - 2 if len(syllables) > 1 else 0
        else:
            stressed_index = len(syllables) - 1
    # Build a scansion string: "1" for the stressed syllable, "0" for unstressed syllables.
    scansion = "".join("1" if i == stressed_index else "0" for i in range(len(syllables)))
    return scansion

def get_word_scansion(word):
    # Use the Portuguese-specific scansion function.
    return get_portuguese_scansion(word)

def get_line_scansion(line):
    # Concatenate each word's scansion.
    return "".join([get_word_scansion(word) for word in line.split(" ")])

def get_syllables_per_line_combined(combined_lines, n_syllables_per_line):
    return [sum([n_syllables_per_line[i] for i in tpl]) for tpl in combined_lines]

def combine_line_scansions(scansion_list):
    n_syllables_per_line = [len(x) for x in scansion_list]
    combined_lines = [tuple([x]) for x in range(len(n_syllables_per_line)) if n_syllables_per_line[x] > 0]
    n_syllables_per_line_combined = get_syllables_per_line_combined(combined_lines, n_syllables_per_line)
    unique_line_lengths = sorted(np.unique(np.array(n_syllables_per_line_combined)), key=lambda item: -item)
    target_line_lengths = unique_line_lengths[: np.min([len(unique_line_lengths), 2])]

    improvement_found = True
    while improvement_found:
        n_syllables_per_line_combined = get_syllables_per_line_combined(combined_lines, n_syllables_per_line)
        for target_length in target_line_lengths:
            for n_lines_to_combine in [2, 3, 4]:
                idx_start = []
                if n_lines_to_combine < len(n_syllables_per_line_combined):
                    combined_line_lengths = np.convolve(
                        n_syllables_per_line_combined,
                        np.ones(n_lines_to_combine, dtype=int),
                        "valid",
                    )
                    idx_start = np.where(combined_line_lengths == target_length)[0]
                    if len(idx_start) > 0:
                        break
            if len(idx_start) > 0:
                break
        if len(idx_start) > 0:
            idx_lines_to_combine = list(range(idx_start[0], (idx_start[0] + n_lines_to_combine)))
            new_tpl = tuple([x for i in idx_lines_to_combine for x in combined_lines[i]])
            combined_lines[idx_start[0]] = new_tpl
            del combined_lines[(idx_start[0] + 1) : (idx_start[0] + n_lines_to_combine)]
        else:
            improvement_found = False
    return combined_lines

def merge_lines(lines, tuple_list, sep=""):
    return [sep.join([lines[a] for a in tpl]) for tpl in tuple_list]

def scansion_match_score(found_meter, known_meter):
    eps = 0.00001
    matching_0 = sum((found_meter[i] == "0") and (known_meter[i] == "0") for i in range(len(found_meter)))
    matching_1 = sum((found_meter[i] == "1") and (known_meter[i] == "1") for i in range(len(found_meter)))
    matching_1_frac = matching_1 / sum((x == "1" for x in known_meter)) - eps
    return matching_0 + matching_1_frac

def get_known_meter(scansion_list, known_meters_inv):
    scansion_list = [x for x in scansion_list if "?" not in x]
    meter_list = []
    for scansion in scansion_list:
        l = [(scansion_match_score(scansion, k), v) for k, v in known_meters_inv.items() if len(k) == len(scansion)]
        if l:
            maxValue = max(l, key=lambda x: x[0])[0]
            maxValueList = [x[1] for x in l if x[0] == maxValue]
            meter_list.append([len(scansion), maxValueList])
    if meter_list:
        (values, counts) = np.unique([x[0] for x in meter_list], return_counts=True)
        values = values[counts > 1]
        counts = counts[counts > 1]
        values = values[(-counts).argsort()][: np.min([len(values), 2])]
        meters_list = [[y[1] for y in meter_list if y[0] == val] for val in values]
        result = list()
        for meters_per_line_length in meters_list:
            flat_list = [item for sublist in meters_per_line_length for item in sublist]
            (values, counts) = np.unique(flat_list, return_counts=True)
            ind = np.where(counts == np.max(counts))
            if len(ind[0]) > 1:
                result.append(np.random.choice(values[ind]))
            else:
                result.append(values[ind][0])
        result.sort()
    else:
        result = "unknown"
    return result

# A simple known meters dictionary – adjust or expand as needed.
known_meters_inv = {
    '1010': 'trochaic bimeter',
    '0101': 'iambic bimeter',
}

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    lines = data.get("lines", [])
    scansion_list = [get_line_scansion(line) for line in lines]
    
    # For detailed output, generate word details with syllable breakdowns.
    word_details = []
    for line in lines:
        words = line.split(" ")
        details = []
        for word in words:
            syllables = get_word_syllables(word)
            breakdown = "-".join(syllables)
            scansion = get_word_scansion(word)
            details.append({
                "word": word,
                "syllable_breakdown": breakdown,
                "scansion": scansion,
                "syllable_count": len(syllables)
            })
        total_syllables = sum(d["syllable_count"] for d in details)
        word_details.append({
            "details": details,
            "total_syllables": total_syllables
        })
        
    combined_tpl = combine_line_scansions(scansion_list)
    merged_lines = merge_lines(lines, combined_tpl)
    meter = get_known_meter(scansion_list, known_meters_inv)
    
    return jsonify({
        "original_lines": lines,
        "scansion": scansion_list,
        "word_details": word_details,  # Contains per-word breakdown and total syllable count per line.
        "combined_lines": merged_lines,
        "meter": meter,
    })

def is_port_in_use(port):
    """Verifica se uma porta está em uso"""
    # #region agent log
    debug_log("meter_api.py:is_port_in_use", "Verificando se porta está em uso", {"port": port}, "C")
    # #endregion
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        result = s.connect_ex(('127.0.0.1', port))
        in_use = result == 0
        # #region agent log
        debug_log("meter_api.py:is_port_in_use", "Resultado verificação porta", {"port": port, "in_use": in_use, "result_code": result}, "A")
        # #endregion
        return in_use

def get_process_using_port(port):
    """Obtém informações sobre o processo que está usando a porta"""
    # #region agent log
    debug_log("meter_api.py:get_process_using_port", "Buscando processo na porta", {"port": port}, "A")
    # #endregion
    try:
        # macOS/Linux: usar lsof
        result = subprocess.run(
            ['lsof', '-ti', f':{port}'],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0 and result.stdout.strip():
            pid = result.stdout.strip()
            # #region agent log
            debug_log("meter_api.py:get_process_using_port", "PID encontrado", {"port": port, "pid": pid}, "A")
            # #endregion
            
            # Obter mais informações sobre o processo
            ps_result = subprocess.run(
                ['ps', '-p', pid, '-o', 'pid,comm,args'],
                capture_output=True,
                text=True,
                timeout=5
            )
            process_info = ps_result.stdout.strip() if ps_result.returncode == 0 else "N/A"
            # #region agent log
            debug_log("meter_api.py:get_process_using_port", "Informações do processo", {"port": port, "pid": pid, "process_info": process_info}, "A")
            # #endregion
            return pid, process_info
        else:
            # #region agent log
            debug_log("meter_api.py:get_process_using_port", "Nenhum processo encontrado", {"port": port}, "B")
            # #endregion
            return None, None
    except subprocess.TimeoutExpired:
        # #region agent log
        debug_log("meter_api.py:get_process_using_port", "Timeout ao buscar processo", {"port": port}, "A")
        # #endregion
        return None, None
    except Exception as e:
        # #region agent log
        debug_log("meter_api.py:get_process_using_port", "Erro ao buscar processo", {"port": port, "error": str(e)}, "A")
        # #endregion
        return None, None

def kill_process_if_flask(pid, process_info):
    """Mata o processo se for um processo Flask/Python relacionado"""
    # #region agent log
    debug_log("meter_api.py:kill_process_if_flask", "Verificando se deve matar processo", {"pid": pid, "process_info": process_info}, "A")
    # #endregion
    if not pid:
        return False
    
    try:
        # Verificar se é um processo Python/Flask
        is_python = 'python' in process_info.lower() or 'python3' in process_info.lower()
        is_flask = 'flask' in process_info.lower() or 'meter_api' in process_info.lower()
        
        # #region agent log
        debug_log("meter_api.py:kill_process_if_flask", "Análise do processo", {"pid": pid, "is_python": is_python, "is_flask": is_flask}, "A")
        # #endregion
        
        if is_python or is_flask:
            # #region agent log
            debug_log("meter_api.py:kill_process_if_flask", "Tentando matar processo Flask/Python", {"pid": pid}, "A")
            # #endregion
            subprocess.run(['kill', '-9', pid], timeout=5)
            time.sleep(0.5)  # Aguardar processo terminar
            # #region agent log
            debug_log("meter_api.py:kill_process_if_flask", "Processo morto", {"pid": pid}, "A")
            # #endregion
            return True
        else:
            # #region agent log
            debug_log("meter_api.py:kill_process_if_flask", "Processo não é Flask/Python, não matando", {"pid": pid}, "B")
            # #endregion
            return False
    except Exception as e:
        # #region agent log
        debug_log("meter_api.py:kill_process_if_flask", "Erro ao matar processo", {"pid": pid, "error": str(e)}, "A")
        # #endregion
        return False

def find_available_port(start_port, max_attempts=10):
    """Encontra uma porta disponível começando de start_port"""
    # #region agent log
    debug_log("meter_api.py:find_available_port", "Buscando porta disponível", {"start_port": start_port, "max_attempts": max_attempts}, "E")
    # #endregion
    for port in range(start_port, start_port + max_attempts):
        if not is_port_in_use(port):
            # #region agent log
            debug_log("meter_api.py:find_available_port", "Porta disponível encontrada", {"port": port}, "E")
            # #endregion
            return port
    # #region agent log
    debug_log("meter_api.py:find_available_port", "Nenhuma porta disponível encontrada", {"start_port": start_port, "max_attempts": max_attempts}, "E")
    # #endregion
    return None

if __name__ == '__main__':
    # #region agent log
    debug_log("meter_api.py:__main__", "Iniciando servidor Flask", {"FLASK_PORT": FLASK_PORT}, "C")
    # #endregion
    
    # Verificar se a porta está em uso
    port_in_use = is_port_in_use(FLASK_PORT)
    # #region agent log
    debug_log("meter_api.py:__main__", "Status inicial da porta", {"FLASK_PORT": FLASK_PORT, "port_in_use": port_in_use}, "A")
    # #endregion
    
    if port_in_use:
        # #region agent log
        debug_log("meter_api.py:__main__", "Porta em uso, investigando", {"FLASK_PORT": FLASK_PORT}, "A")
        # #endregion
        
        pid, process_info = get_process_using_port(FLASK_PORT)
        # #region agent log
        debug_log("meter_api.py:__main__", "Processo usando porta", {"FLASK_PORT": FLASK_PORT, "pid": pid, "process_info": process_info}, "A")
        # #endregion
        
        if pid:
            killed = kill_process_if_flask(pid, process_info)
            # #region agent log
            debug_log("meter_api.py:__main__", "Resultado da tentativa de matar processo", {"FLASK_PORT": FLASK_PORT, "pid": pid, "killed": killed}, "A")
            # #endregion
            
            if killed:
                # Aguardar um pouco e verificar novamente
                time.sleep(1)
                port_in_use = is_port_in_use(FLASK_PORT)
                # #region agent log
                debug_log("meter_api.py:__main__", "Verificação pós-kill", {"FLASK_PORT": FLASK_PORT, "port_in_use": port_in_use}, "A")
                # #endregion
        
        # Se ainda estiver em uso, tentar porta alternativa
        if port_in_use:
            # #region agent log
            debug_log("meter_api.py:__main__", "Porta ainda em uso, buscando alternativa", {"FLASK_PORT": FLASK_PORT}, "E")
            # #endregion
            alt_port = find_available_port(FLASK_PORT + 1, 10)
            if alt_port:
                # #region agent log
                debug_log("meter_api.py:__main__", "Usando porta alternativa", {"original_port": FLASK_PORT, "alt_port": alt_port}, "E")
                # #endregion
                FLASK_PORT = alt_port
            else:
                # #region agent log
                debug_log("meter_api.py:__main__", "Nenhuma porta alternativa encontrada, abortando", {"FLASK_PORT": FLASK_PORT}, "E")
                # #endregion
                print(f"ERRO: Porta {FLASK_PORT} está em uso e nenhuma porta alternativa foi encontrada.")
                print(f"Processo usando a porta: {process_info}")
                exit(1)
    
    # #region agent log
    debug_log("meter_api.py:__main__", "Iniciando servidor Flask", {"FLASK_PORT": FLASK_PORT, "host": "127.0.0.1"}, "C")
    # #endregion
    app.run(host="127.0.0.1", port=FLASK_PORT, debug=True)
