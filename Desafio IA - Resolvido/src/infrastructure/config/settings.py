"""
Configurações da aplicação
"""
import os
from dataclasses import dataclass
from dotenv import load_dotenv


@dataclass
class Settings:
    """Configurações centralizadas"""

    # API Keys
    google_api_key: str

    # Paths
    docs_folder: str = "./dados"
    chroma_db_path: str = "./chroma_db"

    # Processing
    chunk_size: int = 1000
    chunk_overlap: int = 200
    top_k_results: int = 5

    # AI Model
    model_name: str = "gemini-2.0-flash-exp"
    embedding_model: str = "models/embedding-001"

    @classmethod
    def from_env(cls) -> "Settings":
        """Carrega configurações do arquivo .env"""
        load_dotenv()

        google_api_key = os.getenv('GOOGLE_API_KEY')
        if not google_api_key:
            raise ValueError(
                "GOOGLE_API_KEY não encontrada. "
                "Crie um arquivo .env baseado no .env.example"
            )

        return cls(
            google_api_key=google_api_key,
            docs_folder=os.getenv('DOCS_FOLDER', './dados'),
            chroma_db_path=os.getenv('CHROMA_DB_PATH', './chroma_db'),
            chunk_size=int(os.getenv('CHUNK_SIZE', 1000)),
            chunk_overlap=int(os.getenv('CHUNK_OVERLAP', 200)),
            top_k_results=int(os.getenv('TOP_K_RESULTS', 5))
        )
