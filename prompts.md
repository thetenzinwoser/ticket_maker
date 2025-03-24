Prompt 1: Project Setup
text
Copy
# Prompt 1: Project Setup
You are to initialize a new project with the following structure:
- Create a Vite-based React project for the frontend.
- Integrate TailwindCSS for styling in the React project.
- Scaffold a FastAPI backend project with a basic application file (e.g., main.py).
- Configure initial test environments: use Jest/React Testing Library for the frontend and pytest for the backend.
Ensure both projects have version control (initial commits) and basic "hello world" tests that confirm the setup works correctly.
Prompt 2: Frontend Basic UI Layout
text
Copy
# Prompt 2: Frontend Basic UI Layout
Develop the basic UI layout for the ticket generation interface using React and TailwindCSS. The layout should have two panels:
- Left Panel: Contains a text input with the placeholder "Add in your Jira ticket description..." and a section for file uploads.
- Right Panel: A display area for streaming generated ticket content.
Implement the components as functional React components and add a simple test to verify that the layout renders correctly.
Prompt 3: Image Upload Component with Validation
text
Copy
# Prompt 3: Image Upload Component with Validation
Create an image upload component for the frontend that supports both drag-and-drop and file-picker methods. This component should:
- Accept up to 10 images in JPEG/PNG formats with a maximum file size of 5 MB each.
- Validate file type and size, and display a toast notification for invalid files.
- Display thumbnail previews for uploaded images with an "X" button to remove individual images.
Write unit tests to ensure that file uploads, validations, and removals work as expected.
Prompt 4: Backend Endpoint for Ticket Generation
text
Copy
# Prompt 4: Backend Endpoint for Ticket Generation
Develop a FastAPI endpoint at POST /generate-ticket that accepts a JSON payload containing:
- "description": a string with the ticket description.
- "images": an array of base64 encoded JPEG/PNG images.
For now, simulate a dummy streaming response that emits a sentence word-by-word (to mimic streaming behavior). Implement proper error handling and write tests to verify that the endpoint handles both valid and invalid inputs.
Prompt 5: Frontend Integration with Streaming Response


# Prompt 5: Frontend Integration with Streaming Response
Enhance the frontend to integrate with the FastAPI /generate-ticket endpoint. Implement the following:
- When the user submits the ticket description (and optional images), initiate a call to the backend.
- Process the streaming response by displaying generated text word-by-word in the right panel.
- Display a spinner and "Generating..." indicator during the generation process.
- Enable auto-scroll in the display area as new words are added.
Write tests to simulate the streaming response and verify that the UI updates correctly.


Prompt 6: Implement Stop Generation Functionality
text
Copy
# Prompt 6: Implement Stop Generation Functionality
Add a "Stop Generating" button to the frontend. Implement the functionality to cancel the ongoing streaming API call when the button is clicked. Ensure that:
- The generation stops immediately.
- The UI maintains the current generated text without abrupt changes.
Write tests to confirm that cancellation works and the UI updates appropriately.



-------------- ALL ABOVE IS DONE ------------------


Prompt 8: OpenAI GPT-4 Turbo API Integration
text
Copy
# Prompt 8: OpenAI GPT-4 Turbo API Integration
Update the FastAPI /generate-ticket endpoint to integrate with OpenAI's GPT-4 Turbo API. Modify the endpoint so that it:
- Constructs a prompt that instructs the AI to generate a detailed, structured Jira ticket containing the following sections: Summary, Description, Requirements, Acceptance Criteria, and Additional Notes.
- Streams the response from the GPT-4 Turbo API word-by-word to the client.
- Includes error handling for cases where the API call fails.
Write tests that mock the GPT-4 Turbo API responses to ensure that the endpoint streams the correct output.



# Prompt 9: Error Handling and Toast Notifications
Enhance both the frontend and backend with robust error handling:
- On the frontend, implement toast notifications that display friendly error messages for issues such as file upload errors, API call failures, or streaming interruptions. Notifications should auto-dismiss after 3 seconds but also allow for manual closure.
- On the backend, ensure that clear error messages are returned for invalid inputs or API failures.
Write tests to simulate error conditions and confirm that the toast notifications are displayed correctly.
Prompt 10: Final Integration and End-to-End Testing
text
Copy
# Prompt 10: Final Integration and End-to-End Testing
Wire all components together to complete the MVP:
- Ensure the frontend properly sends the ticket description and images to the backend.
- Confirm that the streaming response is correctly displayed in real-time, and that the "Stop Generating" and "Copy to Clipboard" functionalities work as intended.
- Perform comprehensive end-to-end tests to validate the complete user flow.
Additionally, provide deployment instructions or scripts for hosting the application on platforms such as Heroku, AWS, or Render.