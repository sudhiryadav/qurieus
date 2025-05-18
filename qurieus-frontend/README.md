# Qurieus Frontend

This is the frontend application for Qurieus, built with Next.js and Tailwind CSS. It provides a modern, responsive interface for document management and AI-powered chat functionality.

## Prerequisites

- Node.js 18+ 
- Yarn package manager
- Next.js 14+
- Tailwind CSS
- Backend API running (see backend README)

## Setup Steps

### 1. Install Dependencies

```bash
# Install dependencies
yarn install
```

### 2. Environment Setup

1. Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

2. Configure the following environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 3. Development

```bash
# Start development server
yarn dev
```

The application will be available at http://localhost:3000

### 4. Production Build

```bash
# Create production build
yarn build

# Start production server
yarn start
```

## Features

### 1. Document Management
- Upload and manage documents
- View document list and details
- Search and filter documents
- Document preview

### 2. AI Chat Integration
- Embedded chat widget
- Real-time document querying
- Source attribution
- Loading states and error handling

### 3. Authentication
- NextAuth.js integration
- Protected routes
- User session management

### 4. UI Components
- Responsive design
- Dark/Light theme support
- Loading states
- Error boundaries
- Toast notifications

## Project Structure

```
qurieus-frontend/
├── public/              # Static files
│   ├── chat.js         # Embedded chat widget
│   └── embed.js        # Chat widget loader
├── src/
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   ├── lib/           # Utility functions
│   └── styles/        # Global styles
├── .env.example       # Environment variables template
└── package.json       # Project dependencies
```

## Chat Widget Integration

To add the chat widget to any webpage:

1. Add the container div:
```html
<div id="qurieus-chat-container"></div>
```

2. Include the embed script:
```html
<script src="https://your-domain.com/embed.js"></script>
```

3. Initialize the chat:
```javascript
QurieusChat.init({
  apiUrl: 'https://your-api-url/api/v1/chat/query',
  documentOwnerId: 'your-document-owner-id',
  theme: 'light', // or 'dark'
  position: 'bottom-right' // or 'bottom-left'
});
```

## Development Guidelines

### Code Style
- Follow ESLint configuration
- Use TypeScript for type safety
- Follow component structure in `components/` directory

### Component Structure
```typescript
// Example component structure
import { FC } from 'react';

interface Props {
  // Component props
}

export const Component: FC<Props> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    // JSX
  );
};
```

### State Management
- Use React hooks for local state
- Use React Context for global state
- Follow the state management pattern in existing components

## Troubleshooting

### Common Issues

1. Chat Widget Not Loading
   - Check if the container div exists
   - Verify the embed script URL
   - Check browser console for errors

2. API Connection Issues
   - Verify API URL in environment variables
   - Check CORS configuration
   - Ensure backend is running

3. Authentication Problems
   - Check NEXTAUTH configuration
   - Verify session handling
   - Check token expiration

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request
4. Ensure all tests pass
5. Update documentation if needed

## License

This project is proprietary and confidential. All rights reserved.

Copyright (c) 2024 Qurieus

This software and its documentation are proprietary and confidential. No part of this software, including but not limited to the source code, documentation, and design, may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of Qurieus.

Unauthorized copying, distribution, or use of this software, via any medium, is strictly prohibited. The receipt or possession of the source code and/or related information does not convey or imply any right to use, reproduce, disclose or distribute its contents, or to manufacture, use, or sell anything that it may describe.
