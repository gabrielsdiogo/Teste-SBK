"""
Interface Web com Streamlit - Clean Architecture
"""
import streamlit as st
from typing import Optional

from src.application.use_cases import ProcessDocumentsUseCase, AskQuestionUseCase
from src.application.dtos import (
    ProcessDocumentInputDTO,
    AskQuestionInputDTO
)


class StreamlitApp:
    """Aplicação Streamlit"""

    def __init__(
        self,
        process_use_case: ProcessDocumentsUseCase,
        ask_use_case: AskQuestionUseCase,
        docs_folder: str = "./dados"
    ):
        """
        Inicializa app Streamlit

        Args:
            process_use_case: Caso de uso de processamento
            ask_use_case: Caso de uso de perguntas
            docs_folder: Pasta de documentos
        """
        self.process_use_case = process_use_case
        self.ask_use_case = ask_use_case
        self.docs_folder = docs_folder

    def run(self):
        """Executa a aplicação"""
        self._setup_page()
        self._init_session_state()
        self._render_sidebar()
        self._render_main_area()
        self._render_footer()

    def _setup_page(self):
        """Configura página"""
        st.set_page_config(
            page_title="Assistente de Documentos - Gemini",
            page_icon="📚",
            layout="wide"
        )

    def _init_session_state(self):
        """Inicializa estado da sessão"""
        if 'messages' not in st.session_state:
            st.session_state.messages = []
        if 'documents_loaded' not in st.session_state:
            st.session_state.documents_loaded = False

    def _check_and_process_documents(self):
        """Verifica e processa documentos automaticamente se necessário"""
        import os

        # Verifica se ChromaDB já existe
        try:
            from src.infrastructure.config import Settings
            settings = Settings.from_env()
            chroma_path = settings.chroma_db_path

            if os.path.exists(chroma_path):
                # Verifica se tem arquivos dentro (não está vazio)
                chroma_files = os.listdir(chroma_path)
                if chroma_files and len(chroma_files) > 1:  # Mais que só pasta vazia
                    st.session_state.documents_loaded = True
                    return
        except:
            pass

        # Verifica se há PDFs para processar
        if os.path.exists(self.docs_folder):
            pdf_files = [f for f in os.listdir(self.docs_folder) if f.endswith('.pdf')]

            if pdf_files and not st.session_state.documents_loaded:
                with st.spinner("Processando documentos automaticamente..."):
                    self._process_documents()

    def _render_sidebar(self):
        """Renderiza sidebar"""
        with st.sidebar:
            st.header("⚙️ Configurações")
            st.markdown("---")

            st.subheader("📊 Status")

            if st.session_state.documents_loaded:
                st.success("✅ Documentos carregados")
            else:
                st.info("ℹ️ Documentos serão processados automaticamente")

            st.markdown("---")

            st.subheader("ℹ️ Sobre")
            st.markdown("""
            Este assistente usa:
            - **Gemini 2.5 Flash**
            - **ChromaDB**
            - **Chain of Thought**
            - **Clean Architecture**

            Os documentos são processados automaticamente quando você faz a primeira pergunta.
            """)

            st.markdown("---")

            if st.button("🗑️ Limpar Histórico", use_container_width=True):
                st.session_state.messages = []
                st.rerun()

    def _render_main_area(self):
        """Renderiza área principal"""
        st.title("📚 Assistente de Documentos")
        st.markdown("---")

        # Verifica e processa documentos se necessário
        self._check_and_process_documents()

        # Exibe histórico
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                if message["role"] == "user":
                    st.markdown(message["content"])
                else:
                    self._display_answer(message["content"])

        # Input do usuário
        if prompt := st.chat_input("Faça sua pergunta sobre os documentos..."):
            self._handle_user_input(prompt)

    def _render_footer(self):
        """Renderiza rodapé"""
        st.markdown("---")

    def _process_documents(self):
        """Processa documentos"""
        import os

        with st.spinner("Processando documentos..."):
            if not os.path.exists(self.docs_folder):
                st.error(f"Pasta {self.docs_folder} não encontrada")
                return

            pdf_files = [
                f for f in os.listdir(self.docs_folder)
                if f.endswith('.pdf')
            ]

            if not pdf_files:
                st.error("Nenhum PDF encontrado")
                return

            success_count = 0
            for pdf_file in pdf_files:
                pdf_path = os.path.join(self.docs_folder, pdf_file)
                input_dto = ProcessDocumentInputDTO(file_path=pdf_path)
                output_dto = self.process_use_case.execute(input_dto)

                if output_dto.success:
                    success_count += 1

            if success_count > 0:
                st.session_state.documents_loaded = True
                st.success(f"✅ {success_count} documento(s) processado(s) com sucesso!")
            else:
                st.error("❌ Erro ao processar documentos. Verifique sua API key e quota do Gemini.")
                st.session_state.documents_loaded = False

    def _handle_user_input(self, prompt: str):
        """Processa input do usuário"""
        # Verifica e processa se necessário
        if not st.session_state.documents_loaded:
            self._check_and_process_documents()

        # Adiciona mensagem do usuário
        st.session_state.messages.append({"role": "user", "content": prompt})

        with st.chat_message("user"):
            st.markdown(prompt)

        # Gera resposta
        with st.chat_message("assistant"):
            with st.spinner("Pensando..."):
                input_dto = AskQuestionInputDTO(question_text=prompt)
                output_dto = self.ask_use_case.execute(input_dto)

                self._display_answer(output_dto.to_dict())

                st.session_state.messages.append({
                    "role": "assistant",
                    "content": output_dto.to_dict()
                })

    def _display_answer(self, result: dict):
        """Exibe resposta formatada"""
        st.markdown(f"**💡 Resposta:** {result['resposta']}")

        col1, col2 = st.columns(2)

        with col1:
            confidence_icons = {'alta': '🟢', 'media': '🟡', 'baixa': '🔴'}
            icon = confidence_icons.get(result['confianca'], '⚪')
            st.markdown(f"**{icon} Confiança:** {result['confianca'].title()}")

        with col2:
            st.markdown(f"**📄 Fonte:** {result['fonte']}")

        if result.get('citacao') and result['citacao'] != 'N/A':
            with st.expander("📝 Ver citação"):
                st.info(result['citacao'])

        if result.get('raciocinio'):
            with st.expander("🧠 Ver raciocínio"):
                st.markdown(result['raciocinio'])

        with st.expander("🔍 Ver JSON completo"):
            st.json(result)
