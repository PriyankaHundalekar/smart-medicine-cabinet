# MediScan AI 💊

**MediScan AI** is an intelligent medical assistant application powered by **Google Gemini 2.5**. It allows users to identify medications from images, manage a digital medicine cabinet, check for dangerous drug interactions, and consult with a general health AI assistant.

![App Screenshot](https://via.placeholder.com/800x400?text=MediScan+AI+Preview)

## ✨ Features

*   **📷 Instant AI Scanning**: Upload or take a photo of any pill, bottle, or blister pack. The AI extracts the name, dosage, expiry date, uses, and side effects.
*   **🛡️ Interaction Checker**: Automatically checks newly scanned medicines against your existing cabinet for potential drug interactions.
*   **💬 Pharmacist Chat**: Ask specific questions about a scanned medicine (e.g., "Can I take this with milk?").
*   **🩺 Health Assistant**: A general purpose AI chat for symptom checking and health queries.
*   **🎨 Glassmorphism UI**: A modern, responsive interface featuring dynamic backgrounds and blurred glass effects.
*   **📱 PWA Ready**: Designed to work seamlessly on mobile and desktop.

## 🛠️ Tech Stack

*   **Frontend**: React, TypeScript, Tailwind CSS
*   **AI Model**: Google Gemini 2.5 Flash (`@google/genai`)
*   **Icons**: Lucide React
*   **Build Tool**: Vite (Recommended)

## 🚀 Getting Started

### Prerequisites

*   Node.js installed
*   A Google Gemini API Key

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/mediscan-ai.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up your API Key:
    *   Create a file named `.env` in the root directory.
    *   Paste your key inside: `API_KEY=your_actual_api_key_here`
    *   **Note:** This file is ignored by Git and will not be uploaded.
4.  Run the development server:
    ```bash
    npm run dev
    ```

## 🔒 Security Note

This repository uses `process.env.API_KEY` to access Google Gemini. 
*   **Source Code**: The source code pushed to GitHub does **not** contain your API key.
*   **Local Development**: Your key is stored in `.env`, which is listed in `.gitignore` to prevent accidental uploads.
*   **Deployment**: When deploying to Vercel, Netlify, or other cloud providers, you must add `API_KEY` in the project's "Environment Variables" settings.

## ⚠️ Disclaimer

**MediScan AI is an artificial intelligence tool for informational purposes only.** It is not a substitute for professional medical advice, diagnosis, or treatment. Always check the physical label on your medication and consult with a qualified healthcare provider for any medical concerns.

## 📄 License

This project is licensed under the MIT License.