import pytest
import httpx

@pytest.fixture(scope="session")
def backend_client():
    return httpx.Client(base_url="http://localhost:3000")
