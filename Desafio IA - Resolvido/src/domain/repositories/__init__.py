"""Repository Interfaces - Dependency Inversion Principle"""
from .document_repository import IDocumentRepository
from .vector_store_repository import IVectorStoreRepository
from .ai_repository import IAIRepository

__all__ = [
    'IDocumentRepository',
    'IVectorStoreRepository',
    'IAIRepository'
]
