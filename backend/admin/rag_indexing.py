""" 
This file is for Vectore Store Indexing Only
"""
import os
from dotenv import load_dotenv
load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))   # the folder containing rag_indexing.py (backend/admin).
DATA_DIR = os.path.join(BASE_DIR, "data")               # backend/admin/data (joins BASE_DIR with "data").
PERSIST_DIR = os.path.join(DATA_DIR, "chroma_plm_db")   # backend/admin/data/chroma_plm_db (joins DATA_DIR with the Chroma folder).

# Components
from langchain.chat_models import init_chat_model
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma

llm = init_chat_model("gemini-2.5-flash", model_provider="google_genai")
embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")

vector_store = Chroma(
    collection_name = "plm_assistant_db",
    embedding_function = embeddings,
    persist_directory = PERSIST_DIR,
)

vector_store.reset_collection()  # optional reset before adding again

# Load data
from langchain_community.document_loaders import DirectoryLoader, TextLoader

loader = DirectoryLoader(
    path = DATA_DIR,
    glob = "[0-9]*.txt",
    loader_cls = TextLoader,
    loader_kwargs = {"encoding": "utf-8", "autodetect_encoding": True}
)

docs = loader.load()

print(f"Successfully Loaded {len(docs)} document(s)")
print(f"Total characters of 1st doc: {len(docs[0].page_content)}")

# Split data
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
all_splits = text_splitter.split_documents(docs)

print(f"Splitted documents into {len(all_splits)} sub-documents.")

# Categorize Document

for doc in all_splits:
    source = doc.metadata['source']

    if ('1_General_University_Information_and_History' in source):
        doc.metadata['section'] = 'general_university_information'
    elif ('2_Students\'_Rights_and_Responsibilities' in source):
        doc.metadata['section'] = 'student_rights_and_responsibility'
    elif ('3_Academic_Policies' in source):
        doc.metadata['section'] = 'academic_policies'
    elif ('4_Student_Affairs_and_Services' in source):
        doc.metadata['section'] = 'student_affairs_and_services'
    elif ('5_Student_Councils,_Organizations,_and_Activities_Policies' in source):
        doc.metadata['section'] = 'student_councils_organizations_and_activities_policies'
    elif ('6_Campus_Publication' in source):
        doc.metadata['section'] = 'campus_publication'
    elif ('7_Disciplinary_Policies' in source):
        doc.metadata['section'] = 'disciplinary_policies'
    elif ('8_General_Provisions,_Glossary,_and_Appendices' in source):
        doc.metadata['section'] = 'general_provisions_glossary_and_appendices'

# Store data
document_ids = vector_store.add_documents(documents=all_splits)
print('Stored vectors: ', document_ids[:10], ' ...')

print('Metadata Sample: ', all_splits[75].metadata)