"""
Interface do repositório de IA
"""
from abc import ABC, abstractmethod
from typing import List, Dict
from src.domain.entities import Answer, Question


class IAIRepository(ABC):
    """Interface para serviço de IA (Gemini, GPT, etc)"""

    @abstractmethod
    def generate_answer(
        self,
        question: Question,
        context_chunks: List[Dict]
    ) -> Answer:
        """
        Gera resposta baseada na pergunta e contexto

        Args:
            question: Pergunta do usuário
            context_chunks: Chunks relevantes do contexto

        Returns:
            Resposta estruturada
        """
        pass

    @abstractmethod
    def generate_embeddings(self, text: str) -> List[float]:
        """
        Gera embeddings de um texto

        Args:
            text: Texto para gerar embeddings

        Returns:
            Lista de floats representando o vetor
        """
        pass
