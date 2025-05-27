import { useState } from "react";

export function CitizenSurvivalGuideAccordion({ disasterData }: { disasterData: any }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!disasterData?.citizen_survival_guide) {
    return <p className="text-gray-500">No AI insights available for this disaster.</p>;
  }
    const renderMarkdown = (text: string) => {
    // Simple markdown parser for basic formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/### (.*?)$/gm, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>')
      .replace(/## (.*?)$/gm, '<h2 class="text-xl font-semibold mb-3 mt-6">$1</h2>')
      .replace(/# (.*?)$/gm, '<h1 class="text-2xl font-bold mb-4 mt-8">$1</h1>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 font-medium flex justify-between items-center"
      >
        Citizen Survival Guide
        <span className="ml-2">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div
          className="prose max-w-none px-4 py-2"
          dangerouslySetInnerHTML={{
            __html: '<p class="mb-4">' + renderMarkdown(disasterData.citizen_survival_guide) + '</p>',
          }}
        />
      )}
    </div>
  );
}
