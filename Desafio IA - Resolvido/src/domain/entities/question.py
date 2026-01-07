"""
Entidade Question - Representa uma pergunta do usuário
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Question:
    """Entidade - Pergunta do usuário"""
    text: str
    created_at: datetime
    user_id: Optional[str] = None

    def __post_init__(self):
        if not self.text or not self.text.strip():
            raise ValueError("Pergunta não pode ser vazia")

        # Remove espaços extras
        self.text = self.text.strip()

    @property
    def is_valid(self) -> bool:
        """Verifica se a pergunta é válida"""
        return len(self.text) >= 3  # Mínimo 3 caracteres

    @property
    def word_count(self) -> int:
        """Conta palavras na pergunta"""
        return len(self.text.split())
