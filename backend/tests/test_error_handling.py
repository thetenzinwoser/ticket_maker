import json
from unittest.mock import patch

def test_empty_description(client):
    """Test that an empty description returns an error."""
    payload = {
        "description": "",
        "images": []
    }
    response = client.post("/generate-ticket", json=payload)
    
    assert response.status_code == 400
    assert "Description cannot be empty" in response.get_json()["detail"]

def test_invalid_image_format(client):
    """Test that an invalid image format returns an error."""
    payload = {
        "description": "Test description",
        "images": ["not-a-base64-image"]
    }
    response = client.post("/generate-ticket", json=payload)
    
    assert response.status_code == 400
    assert "Invalid image format" in response.get_json()["detail"]

def test_too_many_images(client):
    """Test that too many images returns an error."""
    valid_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
    payload = {
        "description": "Test description",
        "images": [valid_image] * 11  # 11 images
    }
    response = client.post("/generate-ticket", json=payload)
    
    assert response.status_code == 400
    assert "Too many images" in response.get_json()["detail"]

@patch('main.stream_gpt_response')
def test_openai_error_handling(mock_stream, client):
    """Test that OpenAI API errors are handled properly."""
    mock_stream.side_effect = Exception("OpenAI API Error")
    
    payload = {
        "description": "Test description",
        "images": []
    }
    response = client.post("/generate-ticket", json=payload)
    
    assert response.status_code == 500
    assert "Server error" in response.get_json()["detail"] 