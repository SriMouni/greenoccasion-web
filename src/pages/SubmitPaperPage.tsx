import React, { useState } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { TOPICS } from '../data/mockData';

const inputClass =
  'w-full border border-outline-variant rounded-lg px-3 py-3 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary outline-none transition-colors';

export const SubmitPaperPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorInstitution, setAuthorInstitution] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]?.id || '');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState('');
  const [doi, setDoi] = useState('');
  const [licenseUrl, setLicenseUrl] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      setErrorMsg("Please upload a PDF file.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('authorName', authorName);
    formData.append('authorInstitution', authorInstitution);
    formData.append('authorEmail', authorEmail);
    formData.append('topic', topic);
    formData.append('abstract', abstract);
    formData.append('keywords', keywords);
    formData.append('doi', doi);
    formData.append('licenseUrl', licenseUrl);
    formData.append('pdfFile', pdfFile);

    try {
      const res = await fetch('/api/submit-paper', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Submission failed');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container-custom py-16">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-12 text-center space-y-6">
            <div className="bg-secondary-container w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-serif text-3xl text-on-surface">Submission Successful</h1>
            <p className="text-on-surface-variant leading-relaxed">
              Your research paper has been successfully uploaded and is now in the review queue.
              You will receive an email notification once the initial review process is complete.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setPdfFile(null);
                }}
                className="btn-primary px-8 py-3"
              >
                Submit Another Paper
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12 md:py-16">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-secondary">
            <FileText className="w-4 h-4" />
            <h4 className="label-caps">Manuscript Submission</h4>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl leading-[1.05] text-on-surface">
            Submit Your Research
          </h1>
          <p className="text-on-surface-variant max-w-2xl leading-relaxed">
            Join our global community of researchers and contribute to the open environmental
            research library.
          </p>
        </div>

        {/* Guidelines */}
        <section className="glass-card p-8 bg-surface-container-low">
          <h2 className="font-serif text-xl text-on-surface mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" /> Submission Guidelines
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              'Paper must relate to environmental research',
              'Paper must be original, unpublished work',
              'PDF format required (max 20MB)',
            ].map((g) => (
              <li key={g} className="flex gap-3">
                <span className="bg-secondary-container p-1 rounded h-fit mt-0.5">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </span>
                <p className="text-sm text-on-surface-variant leading-relaxed">{g}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card p-8 md:p-12 space-y-8">
          {errorMsg && (
            <div className="flex items-center gap-2 bg-error-container/40 text-error p-4 rounded-lg text-sm border border-outline-variant">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full space-y-2">
              <label className="label-caps block">Paper Title</label>
              <input
                required
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter the full title of your research"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label className="label-caps block">Author Names</label>
              <input
                required
                type="text"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                placeholder="e.g. Dr. Sarah Chen, James Wilson"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label className="label-caps block">Author Affiliation</label>
              <input
                required
                type="text"
                value={authorInstitution}
                onChange={e => setAuthorInstitution(e.target.value)}
                placeholder="University or Institution"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label className="label-caps block">Contact Email</label>
              <input
                required
                type="email"
                value={authorEmail}
                onChange={e => setAuthorEmail(e.target.value)}
                placeholder="corresponding.author@example.edu"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label className="label-caps block">Topic Selection</label>
              <select
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className={inputClass}
              >
                {TOPICS.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-full space-y-2">
              <label className="label-caps block">Abstract</label>
              <textarea
                required
                rows={6}
                value={abstract}
                onChange={e => setAbstract(e.target.value)}
                placeholder="Provide a concise summary of your research (max 500 words)"
                className={`${inputClass} resize-none`}
              ></textarea>
            </div>

            <div className="col-span-full space-y-2">
              <label className="label-caps block">Keywords</label>
              <input
                type="text"
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
                placeholder="e.g. Carbon Capture, DAC, Sorbents (comma separated)"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label className="label-caps block">DOI (Optional)</label>
              <input
                type="text"
                value={doi}
                onChange={e => setDoi(e.target.value)}
                placeholder="e.g. 10.1186/s40984-015-0013-8"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label className="label-caps block">License URL (Optional)</label>
              <input
                type="url"
                value={licenseUrl}
                onChange={e => setLicenseUrl(e.target.value)}
                placeholder="e.g. https://creativecommons.org/licenses/by/4.0"
                className={inputClass}
              />
            </div>

            <div className="col-span-full space-y-2">
              <label className="label-caps block">Upload PDF</label>
              <input
                type="file"
                accept="application/pdf"
                id="pdf-upload"
                className="hidden"
                onChange={e => setPdfFile(e.target.files ? e.target.files[0] : null)}
              />
              <label
                htmlFor="pdf-upload"
                className="block border border-dashed border-outline-variant rounded-lg p-10 text-center space-y-4 bg-surface-container-lowest hover:border-primary transition-colors cursor-pointer group"
              >
                <span className="bg-surface-container p-4 rounded-full w-fit mx-auto flex group-hover:bg-secondary-container transition-colors">
                  <Upload className="w-7 h-7 text-on-surface-variant group-hover:text-primary transition-colors" />
                </span>
                <span className="block space-y-1">
                  <span className="block font-medium text-on-surface">
                    {pdfFile ? pdfFile.name : 'Click to upload or drag and drop'}
                  </span>
                  <span className="block text-xs text-on-surface-variant">PDF files only (max 20MB)</span>
                </span>
              </label>
            </div>

            <div className="col-span-full pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary accent-primary"
                />
                <span className="text-sm text-on-surface-variant leading-relaxed">
                  I confirm this research is original, has not been published elsewhere, and is
                  licensed for open publication under the platform's Open Access Policy.
                </span>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-outline-variant/60">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full md:w-auto px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Uploading...' : 'Submit Paper for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
