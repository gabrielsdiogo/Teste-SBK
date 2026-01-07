"""
Implementação do repositório vetorial com ChromaDB
"""
from typing import List, Dict
import chromadb
from chromadb.config import Settings

from src.domain.repositories import IVectorStoreRepository
from src.domain.entities import DocumentChunk


class ChromaVectorStoreRepository(IVectorStoreRepository):
    """Implementação concreta usando ChromaDB"""

    def __init__(self, persist_directory: str = "./chroma_db"):
        """
        Inicializa ChromaDB

        Args:
            persist_directory: Diretório para persistência
        """
        self.client = chromadb.PersistentClient(path=persist_directory)
        self.collection_name = "documentos"
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"description": "Documentos processados"}
        )

    def add_chunks(self, chunks: List[DocumentChunk]) -> None:
        """Adiciona chunks ao banco vetorial"""
        if not chunks:
            return

        documents = []
        metadatas = []
        ids = []
        embeddings = []

        for chunk in chunks:
            documents.append(chunk.content)
            metadatas.append({
                "source": chunk.metadata.get("source", "unknown"),
                "chunk_id": chunk.chunk_index
            })
            ids.append(chunk.id)

            # Pega embedding do metadata
            embedding = chunk.metadata.get("embedding")
            if embedding:
                embeddings.append(embedding)

        # Adiciona ao ChromaDB
        if embeddings:
            self.collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids,
                embeddings=embeddings
            )

    def search_similar(self, query: str, top_k: int = 5, query_embedding: List[float] = None) -> List[Dict]:
        """Busca chunks similares"""
        # Se temos embedding da query, usamos ele diretamente
        # Senão, ChromaDB vai gerar automaticamente (pode dar incompatibilidade)

        if query_embedding:
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k
            )
        else:
            results = self.collection.query(
                query_texts=[query],
                n_results=top_k
            )

        formatted_results = []
        if results['documents'] and len(results['documents']) > 0:
            for i in range(len(results['documents'][0])):
                formatted_results.append({
                    'text': results['documents'][0][i],
                    'source': results['metadatas'][0][i].get('source', 'unknown'),
                    'distance': results['distances'][0][i] if 'distances' in results else None
                })

        return formatted_results

    def delete_by_source(self, source: str) -> bool:
        """Remove chunks de uma fonte"""
        try:
            # ChromaDB permite delete por metadata
            self.collection.delete(
                where={"source": source}
            )
            return True
        except Exception:
            return False

    def count_chunks(self) -> int:
        """Conta total de chunks"""
        return self.collection.count()

    def clear(self) -> None:
        """Limpa todo o banco"""
        self.client.delete_collection(self.collection_name)
        self.collection = self.client.create_collection(
            name=self.collection_name
        )
