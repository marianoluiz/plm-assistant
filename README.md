# PLM Assistant

A campus assistant chatbot powered by RAG, using the school handbook as its knowledge base, with a built-in interactive campus map and directions feature.

... updating readme


## Backend

### Creating venv & Installing Dependencies 
```
cd backend

Linux venv installation:
python3 -m venv .venv
source venv/bin/activate

Windows venv installation:
python -m venv venv
venv\Scripts\activate

> Minimal requirements (If leads to error try Full requirements):
pip install -r requirements.txt

> Full requirements:          
pip install -r requirements-full.txt

> Through Commands (if the requirements.txt files don't work)

pip install gunicorn
pip install Flask
pip install flask-cors
pip install python-dotenv
pip install langchain                       (core)
pip install langchain-google-genai          (embedding model & generation)
pip install langchain-openai                (embedding model & generation)
pip install langchain-community             (vector store)
pip install langchain-chroma                (vector store)
```

### Environment (.env file at backend)
```
LANGSMITH_TRACING=...       (optional)
LANGSMITH_API_KEY=...       (optional)
GOOGLE_API_KEY=...          (depreciated)
OPENAI_API_KEY=...
```

### Making Embeddings Vector Store (Chroma DB) 
```
(windows)
cd backend\admin
python rag_indexing.py

(linux)
python3 admin/rag_indexing.py
```

### Running the App (both frontend and backend) - LINUX ONLY:
>gunicorn is made for UNIX-Operating Systems, so not windows.
```
cd backend
gunicorn app:app
```

### Running for development (backend only)
```
cd backend
flask --app app run
flask --app app run --debug                 (hot reload)
```

### Other Commands
- Export pip to requirements.txt (top level dependencies): 
    - pip list --not-required
    - pip list --not-required --format=freeze > requirements.txt
- Remove tracked and staged files: git rm -r --cached backend/__pycache__