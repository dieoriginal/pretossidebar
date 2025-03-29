import spacy
from mlconjug3 import Conjugator

# Load the spaCy model for Portuguese
nlp = spacy.load("pt_core_news_sm")

# Initialize the conjugator for Portuguese
conjugator = Conjugator(language='pt')

def normalize_word(word):
    """
    Normalize the given word by lemmatizing and handling verb conjugations.
    """
    doc = nlp(word)
    lemma = doc[0].lemma_
    # Check if the word is a verb
    if doc[0].pos_ == "VERB":
        try:
            # Attempt to retrieve the infinitive form of the verb
            infinitive = conjugator.conjugate(lemma).infinitive
            return infinitive
        except:
            # If conjugation fails, return the lemmatized form
            return lemma
    return lemma

# Read words from the vocabulary file
with open('vocabulary.txt', 'r', encoding='utf-8') as file:
    words = [line.strip() for line in file if line.strip()]

# Normalize each word
normalized_words = [normalize_word(word) for word in words]

# Save the normalized words to a new file
with open('normalized_vocabulary.txt', 'w', encoding='utf-8') as file:
    for word in normalized_words:
        file.write(f"{word}\n")
