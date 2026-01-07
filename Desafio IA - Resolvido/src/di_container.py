"""
Dependency Injection Container - Clean Architecture

Este módulo centraliza a criação e injeção de dependências,
seguindo os princípios SOLID (especialmente D - Dependency Inversion)
"""
from dataclasses import dataclass

from src.infrastructure.config import Settings
from src.infrastructure.ai import GeminiAIRepository
from src.infrastructure.storage import (
    ChromaVectorStoreRepository,
    InMemoryDocumentRepository
)
from src.application.use_cases import (
    ProcessDocumentsUseCase,
    AskQuestionUseCase
)
from src.presentation.cli import MainCLI
from src.presentation.web import StreamlitApp


@dataclass
class DIContainer:
    """
    Container de Injeção de Dependências

    Centraliza a criação de todas as dependências da aplicação,
    garantindo que as camadas externas dependam das internas
    (Dependency Inversion Principle)
    """

    settings: Settings

    def __post_init__(self):
        """Inicializa repositórios após criação"""
        self._document_repository = None
        self._vector_store_repository = None
        self._ai_repository = None
        self._process_use_case = None
        self._ask_use_case = None

    # ==========================================
    # Camada Infrastructure (Adapters)
    # ==========================================

    @property
    def document_repository(self):
        """Repositório de documentos (singleton)"""
        if self._document_repository is None:
            self._document_repository = InMemoryDocumentRepository()
        return self._document_repository

    @property
    def vector_store_repository(self):
        """Repositório vetorial (singleton)"""
        if self._vector_store_repository is None:
            self._vector_store_repository = ChromaVectorStoreRepository(
                persist_directory=self.settings.chroma_db_path
            )
        return self._vector_store_repository

    @property
    def ai_repository(self):
        """Repositório de IA (singleton)"""
        if self._ai_repository is None:
            self._ai_repository = GeminiAIRepository(
                api_key=self.settings.google_api_key
            )
        return self._ai_repository

    # ==========================================
    # Camada Application (Use Cases)
    # ==========================================

    @property
    def process_documents_use_case(self):
        """Use case de processamento de documentos"""
        if self._process_use_case is None:
            self._process_use_case = ProcessDocumentsUseCase(
                document_repository=self.document_repository,
                vector_store_repository=self.vector_store_repository,
                ai_repository=self.ai_repository
            )
        return self._process_use_case

    @property
    def ask_question_use_case(self):
        """Use case de perguntas"""
        if self._ask_use_case is None:
            self._ask_use_case = AskQuestionUseCase(
                vector_store_repository=self.vector_store_repository,
                ai_repository=self.ai_repository
            )
        return self._ask_use_case

    # ==========================================
    # Camada Presentation (UI)
    # ==========================================

    def create_cli(self) -> MainCLI:
        """Cria interface CLI"""
        return MainCLI(
            process_use_case=self.process_documents_use_case,
            ask_use_case=self.ask_question_use_case,
            docs_folder=self.settings.docs_folder
        )

    def create_streamlit_app(self) -> StreamlitApp:
        """Cria interface Streamlit"""
        return StreamlitApp(
            process_use_case=self.process_documents_use_case,
            ask_use_case=self.ask_question_use_case,
            docs_folder=self.settings.docs_folder
        )

    # ==========================================
    # Factory Method
    # ==========================================

    @classmethod
    def from_env(cls) -> "DIContainer":
        """
        Cria container a partir de variáveis de ambiente

        Returns:
            Container configurado

        Raises:
            ValueError: Se configurações inválidas
        """
        settings = Settings.from_env()
        return cls(settings=settings)
