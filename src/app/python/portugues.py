from flask import Flask, request, jsonify
from flask_cors import CORS
import wn
import pyphen

app = Flask(__name__)
CORS(app)  # Permite CORS para todas as origens

dic = pyphen.Pyphen(lang='pt_BR')

# Tenta carregar o OpenWN-PT
try:
    pt_wn = wn.Wordnet("openwn-pt")
except Exception as e:
    print("Erro ao carregar OpenWN-PT:", e)
    pt_wn = None

# Carrega todas as palavras em português
all_words = set()
if pt_wn:
    for synset in pt_wn.synsets():
        lemmas = synset.lemmas(lang="por")
        for lemma in lemmas:
            all_words.add(lemma.name.replace("_", " ").lower())
else:
    try:
        with open("portuguese_words.txt", "r", encoding="utf-8") as f:
            for line in f:
                word = line.strip().lower()
                if word:
                    all_words.add(word)
    except FileNotFoundError:
        print("Nem OpenWN-PT nem o arquivo 'portuguese_words.txt' foram encontrados.")

def syllabify(word: str):
    return dic.inserted(word).split('-')

def count_syllables(word: str) -> int:
    return len(syllabify(word))

def rhymes(word1: str, word2: str, count: int = 1) -> bool:
    s1 = syllabify(word1.lower())
    s2 = syllabify(word2.lower())
    if len(s1) < count or len(s2) < count:
        return False
    return s1[-count:] == s2[-count:]

def has_concept(word: str, concept: str) -> bool:
    """
    Verifica se 'word' compartilha um synset com o conceito.
    """
    concept_synsets = wn.synsets(concept, lang="por")
    word_synsets = wn.synsets(word, lang="por")
    concept_ids = {s.id for s in concept_synsets}
    for s in word_synsets:
        if s.id in concept_ids:
            return True
    return False

@app.route('/rhymes', methods=['GET'])
def get_rhymes():
    query = request.args.get("query", "").strip().lower()
    concept = request.args.get("concept", "").strip().lower()
    count_for_rhyme = 1  # Compara a última sílaba por padrão
    results = {"1": [], "2": [], "3": [], "4": []}
    
    if not query:
        return jsonify(results)
    
    for word in all_words:
        if word == query:
            continue
        if rhymes(query, word, count=count_for_rhyme):
            if concept:
                if not has_concept(word, concept):
                    continue
            syllable_count = count_syllables(word)
            if syllable_count >= 4:
                results["4"].append(word)
            else:
                results[str(syllable_count)].append(word)
    
    return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True)
