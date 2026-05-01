import pytest
import httpx

@pytest.fixture(scope="session")
def java_client():
    return httpx.Client(base_url="http://localhost:8080")
