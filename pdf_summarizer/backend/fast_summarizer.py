import io
import re
import numpy as np
import torch
import pdfplumber
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print("fast_summarizer: using device:", DEVICE)

EMBED_MODEL_NAME = "all-MiniLM-L6-v2"
embed_model = SentenceTransformer(EMBED_MODEL_NAME, device=DEVICE)

SUM_MODEL_NAME = "sshleifer/distilbart-cnn-12-6"
tokenizer = AutoTokenizer.from_pretrained(SUM_MODEL_NAME)
summ_model = AutoModelForSeq2SeqLM.from_pretrained(SUM_MODEL_NAME)
summ_model.to(DEVICE)
if DEVICE == "cuda":
    try:
        summ_model.half()
    except Exception:
        pass
def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """Extract raw text from PDF bytes using pdfplumber."""
    pdf_file = io.BytesIO(pdf_bytes)
    text_chunks = []
    with pdfplumber.open(pdf_file) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                text_chunks.append(t)
    return "\n".join(text_chunks)

_sentence_splitter_re = re.compile(r'(?<=[.!?])\s+')

def split_into_sentences(text: str):
    text = text.replace("\n", " ")
    
    sents = [s.strip() for s in _sentence_splitter_re.split(text) if len(s.strip()) > 20]
    return sents

def rank_sentences_by_centroid(sentences, top_k=40):
    """Return top_k sentences ranked by cosine similarity to document centroid (keeps original order)."""
    if not sentences:
        return []
    
    embeddings = embed_model.encode(sentences, convert_to_numpy=True, show_progress_bar=False)
    doc_emb = embeddings.mean(axis=0)
    
    norms = np.linalg.norm(embeddings, axis=1) * (np.linalg.norm(doc_emb) + 1e-12)
    sims = np.dot(embeddings, doc_emb) / (norms + 1e-12)
    
    k = min(top_k, len(sentences))
    top_idx = np.argsort(-sims)[:k]
    top_idx_sorted = sorted(top_idx.tolist())
    selected = [sentences[i] for i in top_idx_sorted]
    return selected

def generate_summary_text(text: str, max_length=220, min_length=80):
    """Abstractive summarization for one chunk using the seq2seq model."""
    
    inputs = tokenizer(text, truncation=True, max_length=1024, return_tensors="pt")
    inputs = {k: v.to(DEVICE) for k, v in inputs.items()}
    with torch.no_grad():
        summary_ids = summ_model.generate(
            inputs["input_ids"],
            attention_mask=inputs.get("attention_mask"),
            max_length=max_length,
            min_length=min_length,
            num_beams=4,
            length_penalty=2.0,
            early_stopping=True,
            no_repeat_ngram_size=3
        )
    return tokenizer.decode(summary_ids[0], skip_special_tokens=True)

def chunk_text_by_words(text: str, chunk_word_size=700):
    words = text.split()
    for i in range(0, len(words), chunk_word_size):
        yield " ".join(words[i:i + chunk_word_size])


def summarize_pdf(pdf_bytes: bytes, verbosity: str = "long") -> str:
    """
    Summarize PDF bytes and return a textual summary.
    verbosity: 'short' (fast, brief), 'medium', 'long' (more detail)
    """
    text = extract_text_from_pdf_bytes(pdf_bytes)
    if not text or not text.strip():
        return "No text could be extracted from the PDF."

    
    if verbosity == "short":
        top_k = 12
        max_len = 100
        min_len = 30
    elif verbosity == "medium":
        top_k = 35
        max_len = 220
        min_len = 80
    else:  
        top_k = 80
        max_len = 360
        min_len = 140

    
    sentences = split_into_sentences(text)
    selected = rank_sentences_by_centroid(sentences, top_k=top_k)
    if not selected:
        
        combined = text
    else:
        combined = " ".join(selected)

    
    chunks = list(chunk_text_by_words(combined, chunk_word_size=700))
    partial_summaries = []
    for c in chunks:
        partial = generate_summary_text(c, max_length=max_len, min_length=min_len)
        partial_summaries.append(partial)

    
    if len(partial_summaries) == 1:
        final_summary = partial_summaries[0]
    else:
        
        combined_partials = " ".join(partial_summaries)
        final_summary = generate_summary_text(combined_partials, max_length=max_len + 100, min_length=min_len)

    return final_summary
