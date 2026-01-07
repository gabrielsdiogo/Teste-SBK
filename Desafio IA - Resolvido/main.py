#!/usr/bin/env python3
"""
Ponto de entrada principal - CLI
Clean Architecture
"""
import sys

from src.di_container import DIContainer


def main():
    """Função principal"""
    try:
        # Cria container de dependências
        container = DIContainer.from_env()

        # Cria e executa CLI
        cli = container.create_cli()
        cli.run()

        return 0

    except ValueError as e:
        print(f"\nErro de configuração: {str(e)}")
        print("Verifique o arquivo .env")
        return 1

    except Exception as e:
        print(f"\nErro: {str(e)}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
