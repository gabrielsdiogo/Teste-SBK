"""
Repositório de documentos em memória (simples)
"""
from typing import List, Optional, Dict

from src.domain.repositories import IDocumentRepository
from src.domain.entities import Document


class InMemoryDocumentRepository(IDocumentRepository):
    """Implementação em memória para testes"""

    def __init__(self):
        self._documents: Dict[str, Document] = {}

    def save(self, document: Document) -> None:
        """Salva documento"""
        self._documents[document.id] = document

    def find_by_id(self, document_id: str) -> Optional[Document]:
        """Busca por ID"""
        return self._documents.get(document_id)

    def find_by_filename(self, filename: str) -> Optional[Document]:
        """Busca por nome de arquivo"""
        for doc in self._documents.values():
            if doc.filename == filename:
                return doc
        return None

    def find_all(self) -> List[Document]:
        """Retorna todos"""
        return list(self._documents.values())

    def delete(self, document_id: str) -> bool:
        """Remove documento"""
        if document_id in self._documents:
            del self._documents[document_id]
            return True
        return False

    def count(self) -> int:
        """Conta documentos"""
        return len(self._documents)
