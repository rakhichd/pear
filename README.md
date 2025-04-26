# ResumeFind

ResumeFind is a searchable database of top-tier resume examples, organized by industry, role, experience level, skills, and more. It helps users find resume examples from people with similar backgrounds who successfully landed jobs at their target companies.

## Core Problem

People without strong professional networks (non-target schools, first-gen students, career switchers) often lack access to high-quality resume examples that match:

- Their background
- Their career goals
- The industry and companies they're aiming for
- Proven success (offers received or interviews landed)

Most current resume tools are too generic and don't show what a successful resume actually looks like for specific situations.

## Features

- **Searchable Database**: Find resumes by role, skills, education, companies, and more
- **Verified Success**: See which companies made offers based on each resume
- **Personalized Results**: Filter by background, experience level, and career goals
- **Premium Content**: Unlock full access to all resume examples with a subscription

## Tech Stack

- **Frontend**: React.js with Next.js framework
- **UI**: TailwindCSS for styling
- **Authentication**: Firebase Authentication
- **Database**: Firestore for document storage
- **Vector Search**: Pinecone for semantic search capabilities
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/resumefind.git
   cd resumefind
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file with your API keys:
   ```
   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

   # Pinecone
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX_NAME=resumefind
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
resumefind/
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API Routes
│   │   ├── auth/          # Authentication pages
│   │   ├── main/          # Main application pages  
│   ├── components/        # Reusable React components
│   ├── lib/               # Utility libraries
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper functions
├── public/                # Static assets
└── README.md              # Project documentation
```

## Future Extensions

- Resume builder: Start from a searched example and customize it
- AI resume editor: Suggest tweaks based on a selected "inspiration resume"
- Career pivot search: Show examples of successful career transitions
- Anonymous community contributions: "This resume got me X offer"

## License

This project is licensed under the MIT License.
