"""
Use Case: Fazer Pergunta
"""
from datetime import datetime

from src.domain.entities import Question
from src.domain.repositories import (
    IVectorStoreRepository,
    IAIRepository
)
from src.application.dtos import (
    AskQuestionInputDTO,
    AskQuestionOutputDTO
)


class AskQuestionUseCase:
    """
    Caso de uso: Fazer pergunta sobre documentos

    Responsabilidades:
    - Validar pergunta
    - Buscar chunks relevantes
    - Gerar resposta com IA
    - Retornar resposta estruturada
    """

    def __init__(
        self,
        vector_store_repository: IVectorStoreRepository,
        ai_repository: IAIRepository
    ):
        self.vector_store_repository = vector_store_repository
        self.ai_repository = ai_repository

    def execute(
        self,
        input_dto: AskQuestionInputDTO
    ) -> AskQuestionOutputDTO:
        """
        Executa a pergunta

        Args:
            input_dto: Dados da pergunta

        Returns:
            Resposta estruturada
        """
        try:
            # Cria entidade Question
            question = Question(
                text=input_dto.question_text,
                created_at=datetime.now(),
                user_id=input_dto.user_id
            )

            # Valida pergunta
            if not question.is_valid:
                return AskQuestionOutputDTO(
                    answer="Pergunta muito curta ou inválida",
                    source="N/A",
                    confidence="baixa",
                    reasoning="Pergunta não atende critérios mínimos",
                    citation=None,
                    success=False
                )

            # Gera embedding da pergunta
            query_embedding = self.ai_repository.generate_embeddings(question.text)

            # Busca chunks relevantes usando o embedding
            context_chunks = self.vector_store_repository.search_similar(
                query=question.text,
                top_k=input_dto.top_k,
                query_embedding=query_embedding
            )

            if not context_chunks:
                return AskQuestionOutputDTO(
                    answer="Nenhum documento encontrado. Execute o processamento primeiro.",
                    source="N/A",
                    confidence="baixa",
                    reasoning="Base de dados vazia",
                    citation=None,
                    success=False
                )

            # Gera resposta com IA
            answer = self.ai_repository.generate_answer(
                question=question,
                context_chunks=context_chunks
            )

            return AskQuestionOutputDTO(
                answer=answer.text,
                source=answer.source,
                confidence=answer.confidence.value,
                reasoning=answer.reasoning,
                citation=answer.citation,
                success=True
            )

        except Exception as e:
            return AskQuestionOutputDTO(
                answer=f"Erro ao processar pergunta: {str(e)}",
                source="N/A",
                confidence="baixa",
                reasoning="Erro no processamento",
                citation=None,
                success=False
            )
