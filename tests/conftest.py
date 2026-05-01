import pytest

@pytest.fixture(scope="session")
def base_url():
    """Base URL for backend API"""
    return "http://localhost:3000"

@pytest.fixture(scope="session")
def java_base_url():
    """Base URL for Java engine API"""
    return "http://localhost:8080"
