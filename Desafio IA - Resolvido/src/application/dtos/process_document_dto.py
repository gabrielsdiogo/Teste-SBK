"""
DTOs para processamento de documentos
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class ProcessDocumentInputDTO:
    """Input para processar documento"""
    file_path: str
    chunk_size: int = 1000
    chunk_overlap: int = 200


@dataclass
class ProcessDocumentOutputDTO:
    """Output do processamento"""
    document_id: str
    filename: str
    chunks_count: int
    success: bool
    message: Optional[str] = None
