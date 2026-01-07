# Assistente de Documentos com Gemini 2.5 Flash

## Destaques

**Clean Architecture** - Arquitetura limpa com separação de responsabilidades
**Gemini 2.5 Flash** - IA de última geração do Google
**Chain of Thought** - Raciocínio transparente e explicável
**RAG** - Retrieval-Augmented Generation para respostas precisas
**ChromaDB** - Busca vetorial local e eficiente
**Dual Interface** - CLI e Web (Streamlit)

## Arquitetura

Este projeto implementa a **Clean Architecture** 

## Instalação Rápida

### 1. Instalar Dependências
```bash
pip install -r requirements.txt
```

### 2. Configurar API Key
```bash
cp .env.example .env
# Edite .env e adicione sua GOOGLE_API_KEY
```

### 3. Adicionar Documentos
Coloque seus arquivos PDF na pasta `dados/`

### 4. Fazer Perguntas
```bash
python main.py --ask "Qual é o código de ética da empresa?"
```

**Os documentos são processados automaticamente na primeira execução!**

## 📖 Como Usar

### Interface CLI

#### Fazer uma Pergunta
```bash
python main.py --ask "Sua pergunta aqui"
```

**Processamento Automático:**
Na primeira execução, o sistema automaticamente:
- Lê PDFs da pasta `dados/`
- Extrai e divide texto em chunks
- Gera embeddings com Gemini
- Armazena no ChromaDB

Nas próximas execuções, reutiliza os dados processados (mais rápido)!

Resposta JSON estruturada:
```json
{
  "resposta": "O código de ética estabelece...",
  "fonte": "codigo_etica_sbk_2025.pdf",
  "confianca": "alta",
  "raciocinio": "Analisei o documento...",
  "citacao": "Trecho específico..."
}
```

#### Modo Interativo
```bash
python main.py --interactive
```

### Interface Web (Streamlit)

```bash
streamlit run app.py
```

Acesse: `http://localhost:8501`

**Features:**
- Processamento automático de documentos
- Chat interativo
- Visualização do raciocínio
- Citações dos documentos
- Interface moderna

### Estrutura Do Projeto

**Domain** → Regras de negócio puras
- Sem dependências externas
- Entidades: `Document`, `Question`, `Answer`
- Interfaces de repositórios

**Application** → Casos de uso
- Orquestra regras de negócio
- Use cases: `ProcessDocuments`, `AskQuestion`
- DTOs para entrada/saída

**Infrastructure** → Detalhes técnicos
- Implementações concretas
- Gemini, ChromaDB, PyPDF
- Facilmente substituível

**Presentation** → UI
- CLI e Streamlit
- Não conhece detalhes internos

### RAG (Retrieval-Augmented Generation)

1. **Retrieval** → Busca vetorial encontra chunks relevantes
2. **Augmentation** → Chunks adicionados ao prompt
3. **Generation** → Gemini gera resposta baseada em dados reais

### Chain of Thought

Prompt instrui o modelo a:
1. Analisar documentos
2. Explicar raciocínio passo a passo
3. Identificar fonte
4. Avaliar confiança

## Formato de Resposta

Todas as respostas seguem formato JSON padronizado:

```json
{
  "raciocinio": "Processo de pensamento...",
  "resposta": "Resposta direta",
  "fonte": "arquivo.pdf",
  "confianca": "alta|media|baixa",
  "citacao": "Trecho do documento"
}
```

## Tecnologias

### Core
- **Python 3.8+** - Linguagem
- **Google Generative AI** - Gemini 2.5 Flash
- **ChromaDB** - Banco vetorial
- **LangChain** - Framework para LLMs

### Processamento
- **PyPDF** - Extração de PDFs
- **RecursiveCharacterTextSplitter** - Chunking inteligente

### Interface
- **Streamlit** - Web UI
- **argparse** - CLI
- **python-dotenv** - Configuração

## Segurança

- API Key em `.env`
- Processamento local
- ChromaDB local (sem cloud)