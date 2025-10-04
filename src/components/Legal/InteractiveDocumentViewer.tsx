// components/Legal/InteractiveDocumentViewer.tsx

import { useState } from 'react';
import { X, Check } from 'lucide-react';

type DocumentSection = {
  title: string;
  content: string;
  highlight?: 'medium' | 'high' | 'low'; 
};

type AiSuggestion = {
  title: string;
  originalContent: string;
  suggestedContent: string;
  riskLevel: 'medium' | 'high' | 'low';
};

type DocumentViewerProps = {
  documentTitle: string;
  sections: DocumentSection[];
  suggestions: AiSuggestion[];
};

function SuggestionModal({ suggestion, onClose }: { suggestion: AiSuggestion; onClose: () => void }) {
  const styles = {
    medium: { background: 'bg-orange-50', text: 'text-orange-800' },
    high: { background: 'bg-red-50', text: 'text-red-800' },
    low: { background: 'bg-green-50', text: 'text-green-800' },
  };
  const currentStyle = styles[suggestion.riskLevel];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={20} /></button>
        <h3 className="text-lg font-bold text-gray-800">{suggestion.title}</h3>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase text-gray-500">Original Clause</p>
          <div className={`mt-1 rounded-md p-3 text-sm ${currentStyle.background} ${currentStyle.text}`}>{suggestion.originalContent}</div>
        </div>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase text-green-700">AI Suggestion ✨</p>
          <div className="mt-1 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">{suggestion.suggestedContent}</div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Reject</button>
          <button className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"><Check size={14} /> Accept</button>
        </div>
      </div>
    </div>
  );
}

export default function InteractiveDocumentViewer({ documentTitle, sections, suggestions }: DocumentViewerProps) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<AiSuggestion | null>(null);
  const highlightStyles = {
    medium: 'bg-orange-100 border border-orange-200 rounded-md p-2 cursor-pointer hover:bg-orange-200',
    high: 'bg-red-100 border border-red-200 rounded-md p-2 cursor-pointer hover:bg-red-200',
    low: 'bg-green-100 border border-green-200 rounded-md p-2 cursor-pointer hover:bg-green-200',
  };

  const handleSectionClick = (section: DocumentSection) => {
    const foundSuggestion = suggestions.find(s => s.title === section.title);
    if (foundSuggestion) setSelectedSuggestion(foundSuggestion);
  };

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm h-full">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-xl font-bold text-gray-900">Contract Document</h2>
        </div>
        <div className="p-6">
          <div className="rounded-md bg-gray-50 p-8 shadow-inner">
            <h1 className="mb-10 text-center text-xl font-bold uppercase tracking-wider text-gray-900">{documentTitle}</h1>
            <div className="space-y-6">
              {sections.map((section, index) => (
                <div key={index}>
                  <h3 className="font-bold text-gray-800">{section.title}</h3>
                  <p className={`mt-1 text-gray-700 ${section.highlight ? highlightStyles[section.highlight] : ''}`} onClick={() => section.highlight && handleSectionClick(section)}>
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {selectedSuggestion && <SuggestionModal suggestion={selectedSuggestion} onClose={() => setSelectedSuggestion(null)} />}
    </>
  );
}