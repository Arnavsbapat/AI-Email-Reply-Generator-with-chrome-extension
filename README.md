# ✉️ AI Email Reply Generator

> Paste an email, pick a tone, get a ready-to-send reply. Use it from a **React web app** or straight inside **Gmail** with a Chrome extension. Powered by **Spring Boot** and the **Google Gemini API**.

![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.1-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)
![Material UI](https://img.shields.io/badge/UI-Material%20UI-007FFF?logo=mui&logoColor=white)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension%20MV3-4285F4?logo=googlechrome&logoColor=white)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-8E75B2?logo=googlegemini&logoColor=white)

---

## ✨ What it does

- 🤖 **Generates professional email replies** with Google Gemini
- 🎭 **Three tones** in the web app: Professional, Friendly and Casual
- 🌐 **Web app** built with React and Material UI, with loading states, error messages and a one-click **Copy Reply** button
- 📬 **Gmail integration**: a **✨ AI Reply** button appears next to *Send* in the compose window, reads the open email thread and drops the reply into your draft
- 🛡️ **Safe by design**: the extension never overwrites your existing draft text

---

## 🧩 How it works

```
┌───────────────────┐      ┌───────────────────┐
│   React Web App   │      │ Chrome Extension  │
│ (email-writer-    │      │ (Email Writer Ext)│
│  react)           │      │  Gmail button     │
└─────────┬─────────┘      └─────────┬─────────┘
          │  POST /api/email/generate │
          └─────────────┬─────────────┘
                        ▼
             ┌─────────────────────┐
             │   Spring Boot API   │
             │    (emailwriter)    │
             └──────────┬──────────┘
                        ▼
             ┌─────────────────────┐
             │  Google Gemini API  │
             └─────────────────────┘
```

Both front ends send the original email and the chosen tone to the same backend endpoint. The backend builds a prompt, calls Gemini, and returns the reply as plain text.

---

## 📁 Repository structure

| Folder | What's inside |
|---|---|
| [`emailwriter/`](emailwriter) | Spring Boot backend: REST API and Gemini integration |
| [`email-writer-react/`](email-writer-react) | React (Vite) web app with a Material UI interface |
| [`Email Writer Ext/`](Email%20Writer%20Ext) | Chrome extension (Manifest V3) for Gmail |

---

## 🛠️ Tech stack

| Part | Technologies |
|---|---|
| **Backend** | Java 21, Spring Boot 4.1.1, Spring WebFlux `WebClient`, Lombok, Maven |
| **Web app** | React, Vite, Material UI (MUI) |
| **Extension** | JavaScript, Chrome Extension Manifest V3, content scripts |
| **AI** | Google Gemini API |

---

## 🔌 API

### `POST /api/email/generate`

**Request body**

```json
{
  "emailContent": "Hi, can we move tomorrow's meeting to 4 PM?",
  "tone": "friendly"
}
```

| Field | Type | Description |
|---|---|---|
| `emailContent` | string | The original email you want to reply to |
| `tone` | string | Optional. For example `professional`, `friendly` or `casual` |

**Response**: the generated reply as **plain text** (no subject line).

**Quick test with curl**

```bash
curl -X POST http://localhost:8080/api/email/generate \
  -H "Content-Type: application/json" \
  -d '{"emailContent":"Hi, can we move tomorrow'\''s meeting to 4 PM?","tone":"friendly"}'
```

---

## 🚀 Getting started

### Prerequisites

- JDK 21+
- Node.js 18+ and npm
- Google Chrome
- A free **Gemini API key** from [Google AI Studio](https://aistudio.google.com/)

### 1️⃣ Run the backend

```bash
cd emailwriter
```

Copy the config template and add your own values:

```bash
cp src/main/resources/application-example.properties src/main/resources/application.properties
```

Edit `src/main/resources/application.properties`:

```properties
spring.application.name=emailwriter
gemini.api.url=<Gemini API endpoint URL, ending in ?key=>
gemini.api.key=<your-gemini-api-key>
```

> 💡 The backend builds the request URL as `gemini.api.url` + `gemini.api.key`, so the URL must end with `?key=`.
>
> 🔒 `application.properties` is listed in `.gitignore`, so your API key is never committed.

Start the server:

```bash
./mvnw spring-boot:run
```

On Windows:

```powershell
mvnw.cmd spring-boot:run
```

The API now runs on **http://localhost:8080**.

### 2️⃣ Run the React web app

Open a new terminal:

```bash
cd email-writer-react
npm install
npm run dev
```

Open the URL Vite prints (usually **http://localhost:5173**), paste an email, choose a tone and click **Generate Reply**.

### 3️⃣ Install the Chrome extension

1. Open `chrome://extensions` in Chrome
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the **`Email Writer Ext`** folder
5. Open [Gmail](https://mail.google.com), open an email and click **Reply**
6. Click **✨ AI Reply** next to the *Send* button and the generated reply appears in your draft

> ⚠️ The backend must be running on `localhost:8080` for the web app and the extension to work.

---

## 🧠 Good to know

- The extension reads the visible messages of the open Gmail thread and sends them to the backend as context.
- If you edit your draft while a reply is being generated, the extension keeps your text and shows a message instead of overwriting it.
- The extension currently uses the **Professional** tone. The web app lets you choose the tone.
- The backend allows all origins (`@CrossOrigin("*")`) to keep local development simple. Restrict this before any real deployment.

---

## 🗺️ Roadmap

- [ ] Tone selector inside the Gmail extension
- [ ] Reply length options (short, medium, detailed)
- [ ] Settings page for the extension's backend URL
- [ ] Docker setup for the backend
- [ ] Tests for the service layer
- [ ] Deploy the backend and web app

---

## 🤝 Contributing

Ideas and pull requests are welcome. Fork the repo, create a feature branch and open a PR.

---

## 👤 Author

**Arnav**
GitHub: [@Arnavsbapat](https://github.com/Arnavsbapat)

⭐ If this project helped you, consider giving it a star!
