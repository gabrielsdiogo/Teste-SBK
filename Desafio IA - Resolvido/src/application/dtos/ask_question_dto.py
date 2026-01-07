"""
DTOs para perguntas e respostas
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class AskQuestionInputDTO:
    """Input para fazer pergunta"""
    question_text: str
    top_k: int = 5
    user_id: Optional[str] = None


@dataclass
class AskQuestionOutputDTO:
    """Output da resposta"""
    answer: str
    source: str
    confidence: str
    reasoning: str
    citation: Optional[str]
    success: bool

    def to_dict(self) -> dict:
        """Converte para dicionário"""
        return {
            "resposta": self.answer,
            "fonte": self.source,
            "confianca": self.confidence,
            "raciocinio": self.reasoning,
            "citacao": self.citation or "N/A"
        }
