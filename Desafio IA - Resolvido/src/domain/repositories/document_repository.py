"""
Interface do repositório de documentos
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from src.domain.entities import Document


class IDocumentRepository(ABC):
    """Interface para repositório de documentos"""

    @abstractmethod
    def save(self, document: Document) -> None:
        """Salva um documento"""
        pass

    @abstractmethod
    def find_by_id(self, document_id: str) -> Optional[Document]:
        """Busca documento por ID"""
        pass

    @abstractmethod
    def find_by_filename(self, filename: str) -> Optional[Document]:
        """Busca documento por nome de arquivo"""
        pass

    @abstractmethod
    def find_all(self) -> List[Document]:
        """Retorna todos os documentos"""
        pass

    @abstractmethod
    def delete(self, document_id: str) -> bool:
        """Remove um documento"""
        pass

    @abstractmethod
    def count(self) -> int:
        """Conta documentos"""
        pass
