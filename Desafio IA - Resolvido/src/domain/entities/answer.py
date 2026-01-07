"""
Entidade Answer - Representa a resposta gerada pela IA
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from enum import Enum


class ConfidenceLevel(Enum):
    """Nível de confiança da resposta"""
    BAIXA = "baixa"
    MEDIA = "media"
    ALTA = "alta"


@dataclass
class Answer:
    """Entidade - Resposta da IA"""
    text: str
    source: str
    confidence: ConfidenceLevel
    reasoning: str
    citation: Optional[str]
    created_at: datetime

    def __post_init__(self):
        if not self.text:
            raise ValueError("Resposta não pode ser vazia")

        if not self.source:
            raise ValueError("Fonte não pode ser vazia")

        if not self.reasoning:
            raise ValueError("Raciocínio não pode ser vazio")

    @property
    def is_high_confidence(self) -> bool:
        """Verifica se tem alta confiança"""
        return self.confidence == ConfidenceLevel.ALTA

    @property
    def has_citation(self) -> bool:
        """Verifica se tem citação"""
        return bool(self.citation and self.citation != "N/A")

    def to_dict(self) -> dict:
        """Converte para dicionário"""
        return {
            "resposta": self.text,
            "fonte": self.source,
            "confianca": self.confidence.value,
            "raciocinio": self.reasoning,
            "citacao": self.citation or "N/A"
        }
