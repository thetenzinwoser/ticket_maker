import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
import base64
import pytest
from unittest.mock import patch, MagicMock

# Create Flask test client
@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

# Helper function to create a base64 encoded image string
def create_dummy_base64_image(format="jpeg"):
    return f"data:image/{format};base64," + base64.b64encode(b"dummy image data").decode()

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.get_json() == {"status": "healthy"}

def test_generate_ticket_valid_request(client):
    payload = {
        "description": "Test ticket description",
        "images": [create_dummy_base64_image()]
    }
    response = client.post("/generate-ticket", json=payload)
    assert response.status_code == 200
    assert b"Processing ticket" in response.data

def test_generate_ticket_empty_description(client):
    payload = {
        "description": "",
        "images": []
    }
    response = client.post("/generate-ticket", json=payload)
    assert response.status_code == 400
    assert "Description cannot be empty" in response.get_json()["detail"]

def test_generate_ticket_invalid_image(client):
    payload = {
        "description": "Test description",
        "images": ["invalid base64 string"]
    }
    response = client.post("/generate-ticket", json=payload)
    assert response.status_code == 400
    assert "Invalid image format" in response.get_json()["detail"]

def test_generate_ticket_no_images(client):
    payload = {
        "description": "Test description",
        "images": []
    }
    response = client.post("/generate-ticket", json=payload)
    assert response.status_code == 200
    assert b"Processing ticket" in response.data

def test_generate_ticket_with_pydantic_validation(client):
    payload = {
        "description": "x" * 1001,  # Exceeds max length
        "images": []
    }
    response = client.post("/generate-ticket", json=payload)
    assert response.status_code == 422
    assert "validation error" in response.get_json()["detail"].lower()

def test_generate_ticket_streaming_response(client):
    payload = {
        "description": "Test description",
        "images": []
    }
    response = client.post("/generate-ticket", json=payload)
    assert response.status_code == 200
    
    # Test streaming response format
    content = b"".join(response.response)
    assert b"Processing ticket" in content
    assert b"Test description" in content

@patch('main.client.chat.completions.create')
def test_generate_ticket_with_gpt(mock_openai, client):
    # Mock OpenAI response
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].delta.content = "Generated ticket content"
    mock_openai.return_value = [mock_response]

    payload = {
        "description": "Test description",
        "images": []
    }
    response = client.post("/generate-ticket", json=payload)
    
    assert response.status_code == 200
    assert b"Generated ticket content" in response.data
    mock_openai.assert_called_once()

@patch('main.client.chat.completions.create')
def test_generate_ticket_gpt_error(mock_openai, client):
    # Mock OpenAI error
    mock_openai.side_effect = Exception("API Error")

    payload = {
        "description": "Test description",
        "images": []
    }
    response = client.post("/generate-ticket", json=payload)
    
    assert response.status_code == 500
    assert "Internal server error" in response.get_json()["detail"]