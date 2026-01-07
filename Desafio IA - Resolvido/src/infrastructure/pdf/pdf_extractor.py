"""
Extrator de texto de PDFs
"""
from pypdf import PdfReader
from typing import Optional


class PDFExtractor:
    """Extrai texto de arquivos PDF"""

    def extract_text(self, pdf_path: str) -> Optional[str]:
        """
        Extrai todo o texto de um PDF

        Args:
            pdf_path: Caminho para o arquivo PDF

        Returns:
            Texto extraído ou None em caso de erro
        """
        try:
            reader = PdfReader(pdf_path)
            text_parts = []

            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)

            return "\n".join(text_parts) if text_parts else None

        except Exception as e:
            print(f"Erro ao extrair texto de {pdf_path}: {str(e)}")
            return None

    def extract_metadata(self, pdf_path: str) -> dict:
        """
        Extrai metadados do PDF

        Args:
            pdf_path: Caminho para o arquivo PDF

        Returns:
            Dicionário com metadados
        """
        try:
            reader = PdfReader(pdf_path)
            metadata = reader.metadata

            return {
                "title": metadata.get("/Title", ""),
                "author": metadata.get("/Author", ""),
                "pages": len(reader.pages),
                "creator": metadata.get("/Creator", "")
            }
        except Exception:
            return {}
