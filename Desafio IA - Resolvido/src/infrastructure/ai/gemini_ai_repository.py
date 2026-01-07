"""
Implementação do repositório de IA com Gemini 2.5 Flash
"""
import json
from typing import List, Dict
import google.generativeai as genai
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from src.domain.repositories import IAIRepository
from src.domain.entities import Answer, Question, ConfidenceLevel
from datetime import datetime


class GeminiAIRepository(IAIRepository):
    """Implementação concreta usando Gemini 2.5 Flash"""

    def __init__(self, api_key: str):
        """
        Inicializa Gemini

        Args:
            api_key: Chave da API do Google
        """
        self.api_key = api_key
        genai.configure(api_key=api_key)

        # Modelo para geração de texto
        # Usando gemini-2.5-flash (mais recente, pode ter quota separada)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

        # Modelo para embeddings
        # Usando text-embedding-004 que pode ter quota separada
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=api_key
        )

    def generate_answer(
        self,
        question: Question,
        context_chunks: List[Dict]
    ) -> Answer:
        """Gera resposta usando Gemini"""
        try:
            # Cria prompt com Chain of Thought
            prompt = self._create_chain_of_thought_prompt(
                question.text,
                context_chunks
            )

            # Chama Gemini
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()

            # Remove marcadores de código markdown se presentes
            if response_text.startswith('```'):
                lines = response_text.split('\n')
                response_text = '\n'.join(lines[1:-1])
                if response_text.startswith('json'):
                    response_text = '\n'.join(response_text.split('\n')[1:])

            # Parse JSON
            result = json.loads(response_text)

            # Converte para entidade Answer
            confidence_map = {
                "baixa": ConfidenceLevel.BAIXA,
                "media": ConfidenceLevel.MEDIA,
                "alta": ConfidenceLevel.ALTA
            }

            return Answer(
                text=result.get("resposta", ""),
                source=result.get("fonte", "N/A"),
                confidence=confidence_map.get(
                    result.get("confianca", "baixa").lower(),
                    ConfidenceLevel.BAIXA
                ),
                reasoning=result.get("raciocinio", ""),
                citation=result.get("citacao"),
                created_at=datetime.now()
            )

        except json.JSONDecodeError as e:
            # Fallback em caso de erro no JSON
            return Answer(
                text=f"Erro ao processar resposta: {str(e)}",
                source="N/A",
                confidence=ConfidenceLevel.BAIXA,
                reasoning="Erro no parse do JSON",
                citation=None,
                created_at=datetime.now()
            )
        except Exception as e:
            return Answer(
                text=f"Erro ao gerar resposta: {str(e)}",
                source="N/A",
                confidence=ConfidenceLevel.BAIXA,
                reasoning="Erro na comunicação com IA",
                citation=None,
                created_at=datetime.now()
            )

    def generate_embeddings(self, text: str) -> List[float]:
        """Gera embeddings usando Gemini"""
        try:
            embedding = self.embeddings.embed_query(text)
            return embedding
        except Exception as e:
            print(f"Erro ao gerar embeddings: {str(e)}")
            # Re-lança a exceção para que o processamento falhe adequadamente
            # em vez de criar embeddings inválidos
            raise Exception(f"Falha ao gerar embeddings: {str(e)}")

    def _create_chain_of_thought_prompt(
        self,
        question: str,
        context_chunks: List[Dict]
    ) -> str:
        """Cria prompt com Chain of Thought"""

        # Formata contexto
        context_text = "\n\n".join([
            f"[Documento: {chunk['source']}]\n{chunk['text']}"
            for chunk in context_chunks
        ])

        prompt = f"""Você é um assistente especializado em responder perguntas com base em documentos fornecidos.

IMPORTANTE: Você deve responder APENAS com base nos documentos fornecidos abaixo. Não use conhecimento externo.

DOCUMENTOS DISPONÍVEIS:
{context_text}

PERGUNTA DO USUÁRIO:
{question}

INSTRUÇÕES:
1. Analise cuidadosamente os documentos fornecidos
2. Use o método "Chain of Thought" - explique seu raciocínio passo a passo
3. Identifique qual documento contém a informação relevante
4. Responda de forma clara e objetiva
5. Se a resposta não estiver nos documentos, diga claramente que não tem essa informação

Responda APENAS no seguinte formato JSON (sem markdown, apenas JSON puro):
{{
    "raciocinio": "Explique aqui seu processo de raciocínio passo a passo para chegar à resposta",
    "resposta": "A resposta direta e objetiva à pergunta",
    "fonte": "Nome do arquivo PDF de onde a informação foi extraída",
    "confianca": "alta, media ou baixa - baseado em quão clara é a informação no documento",
    "citacao": "Trecho específico do documento que suporta sua resposta (se aplicável)"
}}

Se a informação não estiver disponível nos documentos, retorne:
{{
    "raciocinio": "Explique que informações você buscou e por que não encontrou",
    "resposta": "Não foi possível encontrar essa informação nos documentos fornecidos.",
    "fonte": "N/A",
    "confianca": "baixa",
    "citacao": "N/A"
}}
"""
        return prompt
