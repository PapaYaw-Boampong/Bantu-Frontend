import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const MyChallenges: React.FC = () => {
  const navigate = useNavigate();

  // This would be replaced with actual data from your backend
  const myChallenges = [
    {
      id: 1,
      title: 'Sample Challenge 1',
      description: 'This is a sample challenge description.',
      status: 'In Progress',
      dueDate: '2024-04-01',
    },
    {
      id: 2,
      title: 'Sample Challenge 2',
      description: 'This is another sample challenge description.',
      status: 'Completed',
      dueDate: '2024-03-15',
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Challenges</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {myChallenges.map((challenge) => (
          <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{challenge.title}</CardTitle>
              <CardDescription>{challenge.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Badge variant={challenge.status === 'Completed' ? 'default' : 'secondary'}>
                  {challenge.status}
                </Badge>
                <span className="text-sm text-gray-500">Due: {challenge.dueDate}</span>
              </div>
              <Button
                className="w-full"
                onClick={() => navigate(`/user/challenge/${challenge.id}`)}
              >
                View Challenge
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyChallenges; 