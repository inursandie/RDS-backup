import os
import pytest
import requests


def pytest_configure(config):
    base_url = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

    if not base_url:
        pytest.exit(
            "REACT_APP_BACKEND_URL is not set — set it to the backend server URL before running tests.",
            returncode=1,
        )

    try:
        response = requests.post(
            f"{base_url}/api/auth/login",
            json={"email": "preflight@check.invalid", "password": "preflight"},
            timeout=5,
        )
        reachable = response.status_code not in (404, 502, 503, 504)
    except requests.exceptions.RequestException:
        reachable = False

    if not reachable:
        pytest.exit(
            f"Backend at {base_url} is not reachable — start the server first.",
            returncode=1,
        )
