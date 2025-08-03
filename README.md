
🧠 Feedback Tracker + LLM Q&A App

A full-stack web application that allows users to submit feedback and ask questions to an AI powered by Groq’s llama3-8b-8192 model.

🚀 Features
- 📋 Submit, view, and delete feedback entries
- 🤖 Ask questions to a large language model (LLM)
- 🔒 Backend with Express.js and SQLite
- 🌐 Frontend with React
- 🔌 Integrated with Groq’s public API for real-time LLM responses

🛠️ Tech Stack
| Layer       | Technology               |
|-------------|--------------------------|
| Frontend    | React, Axios, Tailwind (optional) |
| Backend     | Node.js, Express         |
| Database    | SQLite                   |
| AI API      | Groq LLM API (llama3-8b-8192) |
| Hosting     | Local / Render / Vercel  |


📦 Setup Instructions

1. Clone the Repo
git clone https://github.com/your-username/llmq-feedback.git
cd llmq-feedback

2. Install Backend
cd backend
npm install

3. Install Frontend
cd ../frontend
npm install

4. Set Up Environment
In `backend/`, create a `.env` file:
GROQ_API_KEY=your_groq_api_key
> Get your API key from https://console.groq.com

5. Run the App
Start Backend
cd backend
node server.js

Start Frontend
cd ../frontend
npm start

App will run at: http://localhost:3000

🧠 Ask AI Feature
Uses Groq’s ultra-fast LLM inference (https://console.groq.com/docs) with:
- Model: `llama3-8b-8192`
- Response streaming (if frontend supports it)
- Simple integration with `fetch` or `axios`

🗃️ SQLite Database
- Automatically creates `feedback.db` file in backend
- `feedback` table includes: id, title, content, author, timestamp

✨ Future Improvements
Add authentication for submitting feedback
Use MongoDB or PostgreSQL for persistent cloud storage
Deploy backend and frontend to Render/Vercel
Improve UI with animations, modals, loaders
Add markdown rendering for AI responses

🤝 Contributing
Pull requests are welcome!
Open issues for suggestions, bugs, or enhancements.
