"""
Interface CLI - Clean Architecture
"""
import argparse
import os
import json
from typing import Optional

from src.application.use_cases import ProcessDocumentsUseCase, AskQuestionUseCase
from src.application.dtos import (
    ProcessDocumentInputDTO,
    AskQuestionInputDTO
)


class MainCLI:
    """Interface de linha de comando"""

    def __init__(
        self,
        process_use_case: ProcessDocumentsUseCase,
        ask_use_case: AskQuestionUseCase,
        docs_folder: str = "./dados"
    ):
        """
        Inicializa CLI

        Args:
            process_use_case: Caso de uso de processamento
            ask_use_case: Caso de uso de perguntas
            docs_folder: Pasta de documentos
        """
        self.process_use_case = process_use_case
        self.ask_use_case = ask_use_case
        self.docs_folder = docs_folder

    def run(self, args: Optional[list] = None):
        """Executa CLI"""
        parser = self._create_parser()
        parsed_args = parser.parse_args(args)

        if parsed_args.ask is not None:
            if parsed_args.ask:
                self._ask_question_command(parsed_args.ask)
            else:
                self._ask_question_command(None)

        elif parsed_args.interactive:
            self._interactive_mode()

        else:
            parser.print_help()
            self._print_examples()

    def _create_parser(self) -> argparse.ArgumentParser:
        """Cria parser de argumentos"""
        parser = argparse.ArgumentParser(
            description='Assistente de Documentos com Gemini 2.5 Flash'
        )

        parser.add_argument(
            '--ask',
            nargs='?',
            const='',
            help='Faz uma pergunta'
        )

        parser.add_argument(
            '--interactive',
            action='store_true',
            help='Modo interativo'
        )

        return parser

    def _process_documents_command(self):
        """Processa documentos"""
        print("=" * 60)
        print("PROCESSANDO DOCUMENTOS")
        print("=" * 60)

        if not os.path.exists(self.docs_folder):
            print(f"Erro: Pasta {self.docs_folder} não encontrada")
            return

        pdf_files = [
            f for f in os.listdir(self.docs_folder)
            if f.endswith('.pdf')
        ]

        if not pdf_files:
            print(f"Nenhum PDF encontrado em {self.docs_folder}")
            return

        print(f"\nEncontrados {len(pdf_files)} arquivo(s) PDF")

        for pdf_file in pdf_files:
            pdf_path = os.path.join(self.docs_folder, pdf_file)
            print(f"\nProcessando: {pdf_file}...")

            input_dto = ProcessDocumentInputDTO(file_path=pdf_path)
            output_dto = self.process_use_case.execute(input_dto)

            if output_dto.success:
                print(f"  [OK] {output_dto.chunks_count} chunks criados")
            else:
                print(f"  [ERRO] {output_dto.message}")

        print("\n[OK] Processamento concluido!")

    def _auto_process_if_needed(self):
        """Processa documentos automaticamente se necessário"""
        # Verifica se já existem documentos processados
        if not os.path.exists(self.docs_folder):
            print(f"[AVISO] Pasta {self.docs_folder} nao encontrada")
            return False

        pdf_files = [f for f in os.listdir(self.docs_folder) if f.endswith('.pdf')]

        if not pdf_files:
            print(f"[AVISO] Nenhum PDF encontrado em {self.docs_folder}")
            return False

        # Verifica se ChromaDB tem documentos
        try:
            from src.infrastructure.config import Settings
            settings = Settings.from_env()
            chroma_path = settings.chroma_db_path

            # Se ChromaDB existe e tem dados, não precisa processar
            if os.path.exists(chroma_path):
                # Verifica se tem arquivos dentro (não está vazio)
                chroma_files = os.listdir(chroma_path)
                if chroma_files and len(chroma_files) > 1:  # Mais que só pasta vazia
                    return True

        except:
            pass

        # Precisa processar
        print("\n" + "=" * 60)
        print("PROCESSANDO DOCUMENTOS AUTOMATICAMENTE")
        print("=" * 60)
        print(f"\nEncontrados {len(pdf_files)} arquivo(s) PDF")

        success_count = 0
        for pdf_file in pdf_files:
            pdf_path = os.path.join(self.docs_folder, pdf_file)
            print(f"\nProcessando: {pdf_file}...")

            input_dto = ProcessDocumentInputDTO(file_path=pdf_path)
            output_dto = self.process_use_case.execute(input_dto)

            if output_dto.success:
                print(f"  [OK] {output_dto.chunks_count} chunks criados")
                success_count += 1
            else:
                print(f"  [ERRO] {output_dto.message}")

        if success_count > 0:
            print(f"\n[OK] Processamento concluido! {success_count} documento(s) processado(s)\n")
            return True
        else:
            print("\n[ERRO] Nenhum documento foi processado com sucesso!")
            print("Verifique sua API key e quota do Gemini.\n")
            return False

    def _ask_question_command(self, question: Optional[str]):
        """Faz uma pergunta"""
        # Processa documentos automaticamente se necessário
        self._auto_process_if_needed()

        if not question:
            print("=" * 60)
            print("FAÇA SUA PERGUNTA")
            print("=" * 60)
            question = input("\nDigite sua pergunta: ").strip()

        if not question:
            print("Erro: Pergunta vazia")
            return

        print(f"\nPergunta: {question}")
        print("\nBuscando resposta...")

        input_dto = AskQuestionInputDTO(question_text=question)
        output_dto = self.ask_use_case.execute(input_dto)

        print("\n" + "=" * 60)
        print("RESPOSTA")
        print("=" * 60)
        print(json.dumps(output_dto.to_dict(), indent=2, ensure_ascii=False))

    def _interactive_mode(self):
        """Modo interativo"""
        # Processa documentos automaticamente se necessário
        self._auto_process_if_needed()

        print("=" * 60)
        print("MODO INTERATIVO")
        print("=" * 60)
        print("\nDigite 'sair' para encerrar\n")

        while True:
            question = input("\n> ").strip()

            if question.lower() in ['sair', 'exit', 'quit']:
                print("\nEncerrando...")
                break

            if not question:
                continue

            input_dto = AskQuestionInputDTO(question_text=question)
            output_dto = self.ask_use_case.execute(input_dto)

            print("\n" + "-" * 60)
            print(f"Resposta: {output_dto.answer}")
            print(f"Fonte: {output_dto.source}")
            print(f"Confiança: {output_dto.confidence}")
            print("-" * 60)

    def _print_examples(self):
        """Imprime exemplos de uso"""
        print("\nExemplos:")
        print("  python main.py --ask \"Qual e o codigo de etica?\"")
        print("  python main.py --interactive")
        print("\nNota: Os documentos sao processados automaticamente na primeira execucao")
