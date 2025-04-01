from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import base64
import re
import time
from models.ticket import TicketRequest
from pydantic import ValidationError
from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import asyncio
from sqlalchemy import create_engine
import openai

# Load environment variables
load_dotenv()

# Make database connection optional for local development
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    try:
        engine = create_engine(DATABASE_URL)
    except Exception as e:
        print(f"Warning: Could not connect to database: {e}")
        engine = None
else:
    print("Warning: No DATABASE_URL provided, running without database connection")
    engine = None

app = Flask(__name__)

# Configure CORS to be more permissive for troubleshooting
CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}}, allow_headers=["Content-Type", "Authorization"])

# Initialize OpenAI client - uncomment this for openai>=1.0.0
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# For openai==0.28.1, use this instead (comment out if using the above line):
# openai.api_key = os.getenv('OPENAI_API_KEY')

def validate_base64_image(img_str):
    """Validate that the string is a valid base64 encoded image."""
    if not img_str or not isinstance(img_str, str):
        return False
    
    if not img_str.startswith('data:image/'):
        return False
    
    try:
        # Check for valid mime type
        mime_type = img_str.split(',')[0].split(':')[1].split(';')[0]
        if mime_type not in ['image/jpeg', 'image/png']:
            return False
        
        # Check that the base64 part is valid
        base64_str = img_str.split(',')[1]
        # Check if the length is a multiple of 4
        if len(base64_str) % 4 != 0:
            return False
            
        return True
    except (IndexError, Exception):
        return False

def create_ticket_prompt(description: str, images: list = None):
    """Create a prompt for the GPT-4 model with enhanced Jira-compatible formatting."""
    base_prompt = f"""
Please format the response using markdown syntax:
- Use # for Title (h1)
- Use ## for section headers (h2)
- Use **bold** for emphasis
- Use - for bullet points
- Use 1. for numbered lists
- Use ---- for horizontal dividers

Generate a detailed ticket for the following description:
{description}

Structure the ticket with these sections:
# Title

## Description
[Detailed description]

## Requirements
[List of requirements]

## Acceptance Criteria
[List of acceptance criteria]

## Additional Notes
[Any additional information]

Remember to use proper markdown formatting throughout the response.
"""
    return base_prompt

def stream_gpt_response(description: str, images: list = None):
    """Stream the GPT-4 response word by word."""
    try:
        prompt = create_ticket_prompt(description, images)
        
        # Base messages without images
        messages = [
            {"role": "system", "content": "You are a experienced manager that has worked for many years at established tech companies. you are a master crafter of tickets and can translate even the most complex designs into readable and easy to action on engineering tickets."},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt}
                ]
            }
        ]

        # Add images to the content array if they exist
        if images and len(images) > 0:
            # Use GPT-4o for requests with images (vision-capable)
            model = "gpt-4o"
            for img in images:
                if img.startswith('data:image'):
                    messages[1]["content"].append({
                        "type": "image_url",
                        "image_url": {"url": img}
                    })
        else:
            # Use regular GPT-4 for text-only requests
            model = "gpt-4-0125-preview"

        response = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=4096,
            stream=True
        )

        for chunk in response:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
                
    except Exception as e:
        print(f"OpenAI API Error: {str(e)}")
        yield f"Error generating ticket: {str(e)}"

@app.post("/generate-ticket")
def generate_ticket():
    try:
        data = TicketRequest(**request.get_json())
        
        if not data.description:
            return jsonify({"detail": "Description cannot be empty"}), 400
            
        if data.images:
            for idx, img in enumerate(data.images):
                if not validate_base64_image(img):
                    return jsonify({
                        "detail": f"Invalid image format at position {idx}. Images must be base64 encoded JPEG or PNG"
                    }), 400
                
            if len(data.images) > 10:
                return jsonify({
                    "detail": "Too many images. Maximum 10 images allowed."
                }), 400
        
        return Response(
            stream_gpt_response(data.description, data.images),
            mimetype='text/plain'
        )
    except ValidationError as e:
        return jsonify({"detail": f"Validation error: {str(e)}"}), 422
    except Exception as e:
        error_message = str(e)
        print(f"Error: {error_message}")
        return jsonify({"detail": f"Server error: {error_message}"}), 500

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == '__main__':
    # Make sure to run on 0.0.0.0 to accept connections from all interfaces
    app.run(host='0.0.0.0', port=5001, debug=True)