"""
Entidade Document - Representa um documento no domínio
"""
from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime


@dataclass
class DocumentChunk:
    """Representa um pedaço de documento"""
    id: str
    content: str
    chunk_index: int
    metadata: dict

    def __post_init__(self):
        if not self.content.strip():
            raise ValueError("Conteúdo do chunk não pode ser vazio")


@dataclass
class Document:
    """Entidade principal - Documento"""
    id: str
    filename: str
    content: str
    chunks: List[DocumentChunk]
    created_at: datetime
    metadata: Optional[dict] = None

    def __post_init__(self):
        if not self.filename:
            raise ValueError("Filename não pode ser vazio")

        if not self.content.strip():
            raise ValueError("Conteúdo do documento não pode ser vazio")

    @property
    def chunk_count(self) -> int:
        """Retorna quantidade de chunks"""
        return len(self.chunks)

    @property
    def is_valid(self) -> bool:
        """Verifica se o documento é válido"""
        return (
            bool(self.filename) and
            bool(self.content) and
            self.chunk_count > 0
        )

    def get_chunk_by_index(self, index: int) -> Optional[DocumentChunk]:
        """Retorna chunk por índice"""
        if 0 <= index < len(self.chunks):
            return self.chunks[index]
        return None
