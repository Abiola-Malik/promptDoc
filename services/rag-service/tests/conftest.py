import pytest
from unittest.mock import MagicMock, patch

# patch external API clients at session level so no real API calls
# are made during testing
@pytest.fixture(autouse=True, scope="session")
def mock_external_clients():
    with patch("app.clients.gemini._llm", MagicMock()), \
         patch("app.clients.pinecone._pc", MagicMock()), \
         patch("app.clients.pinecone._index", MagicMock()), \
         patch("app.clients.pinecone._voyage_client", MagicMock()):
        yield