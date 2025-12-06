# MediScan AI 💊

**MediScan AI** is an intelligent medical assistant application powered by **Google Gemini 2.5**. It allows users to identify medications from images, manage a digital medicine cabinet, check for dangerous drug interactions, and consult with a general health AI assistant.

![App Screenshot](https://via.placeholder.com/800x400?text=MediScan+AI+Preview)

<img width="1916" height="1030" alt="image" src="https://github.com/user-attachments/assets/044dc5d4-8d74-4139-8ef5-984031be6776" />

https://mediscan-ai-692884914635.us-west1.run.app/

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
    *   Create a `.env` file in the root directory.
    *   Add: `API_KEY=your_google_gemini_api_key`
4.  Run the development server:
    ```bash
    npm run dev
    ```

## ⚠️ Disclaimer

**MediScan AI is an artificial intelligence tool for informational purposes only.** It is not a substitute for professional medical advice, diagnosis, or treatment. Always check the physical label on your medication and consult with a qualified healthcare provider for any medical concerns.

## 📄 License

This project is licensed under the MIT License.
