#!/usr/bin/env python3
"""
Ponto de entrada principal - Streamlit Web UI
Clean Architecture
"""
from src.di_container import DIContainer


def main():
    """Função principal"""
    try:
        # Cria container de dependências
        container = DIContainer.from_env()

        # Cria e executa app Streamlit
        app = container.create_streamlit_app()
        app.run()

    except ValueError as e:
        import streamlit as st
        st.error(f"⚠️ Erro de configuração: {str(e)}")
        st.info("Verifique o arquivo .env")

    except Exception as e:
        import streamlit as st
        st.error(f"⚠️ Erro: {str(e)}")


if __name__ == "__main__":
    main()
