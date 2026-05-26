## ADDED Requirements

### Requirement: CV file upload
The system SHALL allow the user to upload their CV as a PDF, .doc, or .docx file from the CV Analysis page. The server SHALL extract the text content from the uploaded file and store both the original file (as base64) and the extracted text in the `profiles` table.

#### Scenario: Successful PDF upload
- **WHEN** the user selects and uploads a valid PDF file
- **THEN** the server extracts the text, stores the file and text in the database, and the CV Analysis page confirms the upload with the file name displayed

#### Scenario: Successful .docx upload
- **WHEN** the user selects and uploads a valid .docx file
- **THEN** the server extracts the text, stores the file and text in the database, and the CV Analysis page confirms the upload with the file name displayed

#### Scenario: File too large
- **WHEN** the user attempts to upload a file larger than 5MB
- **THEN** the upload is rejected client-side before any API call, with an inline error: "File must be under 5MB"

#### Scenario: Unsupported file type
- **WHEN** the user attempts to upload a file that is not PDF, .doc, or .docx
- **THEN** the upload is rejected with an inline error: "Please upload a PDF or Word document"

#### Scenario: Scanned or image-only PDF
- **WHEN** the uploaded PDF yields fewer than 100 characters of extracted text
- **THEN** the system stores what was extracted, displays a warning: "We couldn't extract much text from this PDF — it may be scanned. Your analysis may be limited.", and allows the user to proceed

### Requirement: CV file retrieval
The system SHALL retain the uploaded CV file so the user can see which file they last uploaded (file name and upload date displayed on the CV Analysis page).

#### Scenario: Returning user sees last uploaded CV
- **WHEN** the user navigates to the CV Analysis page and has a previously uploaded CV
- **THEN** the page displays the stored file name and the date it was uploaded
