"""
Interface do repositório vetorial
"""
from abc import ABC, abstractmethod
from typing import List, Dict
from src.domain.entities import DocumentChunk


class IVectorStoreRepository(ABC):
    """Interface para repositório vetorial (ChromaDB, FAISS, etc)"""

    @abstractmethod
    def add_chunks(self, chunks: List[DocumentChunk]) -> None:
        """Adiciona chunks ao banco vetorial"""
        pass

    @abstractmethod
    def search_similar(
        self,
        query: str,
        top_k: int = 5
    ) -> List[Dict]:
        """
        Busca chunks similares à query

        Args:
            query: Texto de busca
            top_k: Número de resultados

        Returns:
            Lista de dicionários com {text, source, distance}
        """
        pass

    @abstractmethod
    def delete_by_source(self, source: str) -> bool:
        """Remove chunks de uma fonte específica"""
        pass

    @abstractmethod
    def count_chunks(self) -> int:
        """Conta total de chunks armazenados"""
        pass

    @abstractmethod
    def clear(self) -> None:
        """Limpa todo o banco vetorial"""
        pass
