"""
Use Case: Processar Documentos
"""
from typing import List
import os
from datetime import datetime

from src.domain.entities import Document, DocumentChunk
from src.domain.repositories import (
    IDocumentRepository,
    IVectorStoreRepository,
    IAIRepository
)
from src.application.dtos import (
    ProcessDocumentInputDTO,
    ProcessDocumentOutputDTO
)


class ProcessDocumentsUseCase:
    """
    Caso de uso: Processar documentos PDF

    Responsabilidades:
    - Extrair texto de PDFs
    - Dividir em chunks
    - Gerar embeddings
    - Armazenar em banco vetorial
    """

    def __init__(
        self,
        document_repository: IDocumentRepository,
        vector_store_repository: IVectorStoreRepository,
        ai_repository: IAIRepository
    ):
        self.document_repository = document_repository
        self.vector_store_repository = vector_store_repository
        self.ai_repository = ai_repository

    def execute(
        self,
        input_dto: ProcessDocumentInputDTO
    ) -> ProcessDocumentOutputDTO:
        """
        Executa o processamento do documento

        Args:
            input_dto: Dados de entrada

        Returns:
            Resultado do processamento
        """
        try:
            # Valida arquivo
            if not os.path.exists(input_dto.file_path):
                return ProcessDocumentOutputDTO(
                    document_id="",
                    filename="",
                    chunks_count=0,
                    success=False,
                    message=f"Arquivo não encontrado: {input_dto.file_path}"
                )

            filename = os.path.basename(input_dto.file_path)

            # Extrai texto (será implementado na camada Infrastructure)
            # Por enquanto, retorna estrutura esperada
            from src.infrastructure.pdf import PDFExtractor
            extractor = PDFExtractor()
            text = extractor.extract_text(input_dto.file_path)

            if not text:
                return ProcessDocumentOutputDTO(
                    document_id="",
                    filename=filename,
                    chunks_count=0,
                    success=False,
                    message="Não foi possível extrair texto do PDF"
                )

            # Divide em chunks
            from src.infrastructure.pdf import TextChunker
            chunker = TextChunker(
                chunk_size=input_dto.chunk_size,
                chunk_overlap=input_dto.chunk_overlap
            )
            chunk_texts = chunker.split_text(text)

            # Cria entidade Document
            document_id = filename  # Simplificado
            chunks = []

            for i, chunk_text in enumerate(chunk_texts):
                # Gera embeddings
                embedding = self.ai_repository.generate_embeddings(chunk_text)

                chunk = DocumentChunk(
                    id=f"{document_id}_{i}",
                    content=chunk_text,
                    chunk_index=i,
                    metadata={
                        "source": filename,
                        "embedding": embedding
                    }
                )
                chunks.append(chunk)

            document = Document(
                id=document_id,
                filename=filename,
                content=text,
                chunks=chunks,
                created_at=datetime.now()
            )

            # Salva no repositório
            self.document_repository.save(document)

            # Salva chunks no banco vetorial
            self.vector_store_repository.add_chunks(chunks)

            return ProcessDocumentOutputDTO(
                document_id=document.id,
                filename=document.filename,
                chunks_count=document.chunk_count,
                success=True,
                message=f"Documento processado com sucesso: {document.chunk_count} chunks"
            )

        except Exception as e:
            return ProcessDocumentOutputDTO(
                document_id="",
                filename=input_dto.file_path,
                chunks_count=0,
                success=False,
                message=f"Erro ao processar: {str(e)}"
            )
