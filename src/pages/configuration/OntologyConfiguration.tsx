import React from 'react';
import OntologyStudio from '../OntologyStudio';

interface OntologyConfigurationProps {
  onNavigate: (page: string) => void;
}

export default function OntologyConfiguration({ onNavigate }: OntologyConfigurationProps) {
  return (
    <div className="h-full">
      <OntologyStudio onNavigate={onNavigate} />
    </div>
  );
}
