import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import WorkspaceManager from '@/components/workspace/workspace-manager';
import { CardHeader } from '@/components/ui/card';

export default function Sandbox() {
  const location = useLocation();
  
  // Get the selected challenge ID from location state if available
  const selectedChallengeId = (location.state as any)?.selectedChallenge;
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-left justify-between mb-8">
        <h1 className="text-4xl font-bold">Sand Box</h1>
      </div>
      
      {/* Main workspace component */}
      <WorkspaceManager challengeId={selectedChallengeId} />
    </div>
  );
}
