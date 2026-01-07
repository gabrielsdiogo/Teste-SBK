"""
Divisor de texto em chunks
"""
from typing import List
from langchain_text_splitters import RecursiveCharacterTextSplitter


class TextChunker:
    """Divide texto em chunks com overlap"""

    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        """
        Inicializa o chunker

        Args:
            chunk_size: Tamanho de cada chunk
            chunk_overlap: Sobreposição entre chunks
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

    def split_text(self, text: str) -> List[str]:
        """
        Divide texto em chunks

        Args:
            text: Texto a ser dividido

        Returns:
            Lista de chunks de texto
        """
        if not text:
            return []

        return self.splitter.split_text(text)

    def split_documents(self, texts: List[str]) -> List[str]:
        """
        Divide múltiplos textos em chunks

        Args:
            texts: Lista de textos

        Returns:
            Lista de todos os chunks
        """
        all_chunks = []
        for text in texts:
            chunks = self.split_text(text)
            all_chunks.extend(chunks)

        return all_chunks
