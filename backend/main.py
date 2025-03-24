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

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://ticket_maker_postgre_user:wW7JAGtpvUkWLicVJdP0iU9p6gue7vyu@dpg-cvgbd4popnds73bh0i1g-a.ohio-postgres.render.com/ticket_maker_postgre")

# Update your database connection to use the URL
engine = create_engine(DATABASE_URL)

app = Flask(__name__)

# Update the CORS configuration to include your frontend URL
CORS(app, origins=[
    "http://localhost:5173",  # Local development
    "https://ticket-maker.onrender.com"  # Your production frontend URL
])

# Initialize OpenAI client - modify this if using openai==0.28.1
# client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# For openai==0.28.1, use this instead:
openai.api_key = os.getenv('OPENAI_API_KEY')

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
    base_prompt = f"""Generate a detailed Jira ticket based on EXACTLY what the user has described below. 
    
    Tickets should be concise, clear, and structured to allow engineers to quickly understand and act on tasks. The structure is as follows:

    h1. Summary
    A brief, descriptive summary reflecting the user's request.

    h2. Description
    A clear explanation directly based on the user's input.

    h2. Requirements
    # Technical requirements derived from the user's description
    # Additional requirements needed to complete the task

    h2. Acceptance Criteria
    # Criteria point 1
    # Criteria point 2
    # Additional criteria as needed

    h2. Additional Notes
    Any important considerations or links.

    ============= USER'S DESCRIPTION (MOST IMPORTANT) =============
    {description}
    ============================================================
    """
    
    if images and len(images) > 0:
        base_prompt += """
        
        Important: The attached images provide additional context. Please:
        1. Include specific color codes or styling changes
        2. Reference the exact location of changes in the UI
        3. Maintain high attention to detail in the analysis
        4. CRITICAL: The user's written description is the primary input - the images are supplementary"""
    
    return base_prompt

def stream_gpt_response(description: str, images: list = None):
    """Stream the GPT-4 response word by word."""
    try:
        prompt = create_ticket_prompt(description, images)
        
        # Base messages without images
        messages = [
            {"role": "system", "content": "You are a precise UI/UX ticket writer. Your primary task is to write tickets based on what the user has written in their description. If images are provided, they supplement the text but do not override it."},
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