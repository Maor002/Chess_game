import pytest

@pytest.fixture(scope="session")
def frontend_url():
    return "http://localhost:5500"
