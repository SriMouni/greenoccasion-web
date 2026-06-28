/**
 * Public reading application — a static website that reads from the API.
 * No login, no admin. Build target: index.html (deploy to a CDN).
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ResearchPapersPage } from './pages/ResearchPapersPage';
import { PaperDetailPage } from './pages/PaperDetailPage';
import { TopicPage } from './pages/TopicPage';
import { TopicsDirectoryPage } from './pages/TopicsDirectoryPage';
import { SubmitPaperPage } from './pages/SubmitPaperPage';
import { AuthorsDirectoryPage } from './pages/AuthorsDirectoryPage';
import { AuthorProfilePage } from './pages/AuthorProfilePage';
import { AboutPage } from './pages/AboutPage';

export default function PublicApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/papers" element={<ResearchPapersPage />} />
          <Route path="/paper/:id" element={<PaperDetailPage />} />
          <Route path="/topics" element={<TopicsDirectoryPage />} />
          <Route path="/topics/:topicId" element={<TopicPage />} />
          <Route path="/submit" element={<SubmitPaperPage />} />
          <Route path="/authors" element={<AuthorsDirectoryPage />} />
          <Route path="/author/:authorName" element={<AuthorProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
