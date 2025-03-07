import { useState } from 'react';
import { Calendar, Trophy, Star, ArrowRight } from 'lucide-react';
import Autoplay from "embla-carousel-autoplay";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'workshop' | 'hackathon' | 'webinar';
  imageUrl: string;
};

type Contributor = {
  id: string;
  name: string;
  avatar: string;
  contributions: number;
  languages: string[];
  rank: number;
};

export default function Events() {
  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'Yoruba Language Workshop',
      description: 'Learn about Yoruba language preservation techniques and contribute to our database.',
      date: '2025-03-15',
      type: 'workshop',
      imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1469&auto=format&fit=crop'
    },
    {
      id: '2',
      title: 'African Languages Hackathon',
      description: 'Join developers to build tools for African language processing and translation.',
      date: '2025-04-10',
      type: 'hackathon',
      imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1470&auto=format&fit=crop'
    },
    {
      id: '3',
      title: 'Speech Recognition Advances',
      description: 'Learn about the latest advances in speech recognition for low-resource languages.',
      date: '2025-03-28',
      type: 'webinar',
      imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1470&auto=format&fit=crop'
    },
    {
      id: '4',
      title: 'Community Translation Sprint',
      description: 'Help translate key resources into multiple African languages in this collaborative event.',
      date: '2025-05-05',
      type: 'workshop',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop'
    },
  ]);

  const [contributors] = useState<Contributor[]>([
    {
      id: '1',
      name: 'Amara Okafor',
      avatar: 'https://i.pravatar.cc/150?img=32',
      contributions: 1250,
      languages: ['Yoruba', 'Igbo'],
      rank: 1
    },
    {
      id: '2',
      name: 'Kwame Mensah',
      avatar: 'https://i.pravatar.cc/150?img=60',
      contributions: 980,
      languages: ['Twi', 'Hausa'],
      rank: 2
    },
    {
      id: '3',
      name: 'Zainab Ahmed',
      avatar: 'https://i.pravatar.cc/150?img=47',
      contributions: 845,
      languages: ['Hausa', 'Swahili'],
      rank: 3
    },
    {
      id: '4',
      name: 'Thabo Ndlovu',
      avatar: 'https://i.pravatar.cc/150?img=68',
      contributions: 720,
      languages: ['Zulu', 'Xhosa'],
      rank: 4
    },
    {
      id: '5',
      name: 'Fatima Diallo',
      avatar: 'https://i.pravatar.cc/150?img=45',
      contributions: 690,
      languages: ['Wolof', 'French'],
      rank: 5
    },
  ]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <h1 className="text-4xl font-bold mb-6 mt-6 animate-fade-up">Community Events</h1>
      
      {/* Events Carousel */}
      <Card className="animate-fade-up [animation-delay:200ms] opacity-0 shadow-none border-none mb-12 w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Upcoming Events
          </CardTitle>
          <CardDescription>
            Join these events to connect with the community and contribute to language preservation
          </CardDescription>
        </CardHeader>
        <CardContent className="border-none">
          <Carousel
            plugins={[
              Autoplay({
                delay: 5000,
              }),
            ]}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {events.map((event) => (
                <CarouselItem key={event.id} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full flex flex-col overflow-hidden">
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title} 
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {formatDate(event.date)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow p-4 pt-0">
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </CardContent>
                    <CardFooter className="p-4">
                      <Button variant="outline" size="sm" className="w-full">
                        Register
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-4">
              <CarouselPrevious className="relative static mr-2" />
              <CarouselNext className="relative static" />
            </div>
          </Carousel>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="animate-fade-up [animation-delay:400ms] opacity-0 w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Top Contributors
          </CardTitle>
          <CardDescription>
            Community members who have made the most contributions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contributors.map((contributor) => (
              <div 
                key={contributor.id} 
                className="flex items-center p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold mr-4">
                  {contributor.rank}
                </div>
                <Avatar className="h-10 w-10 mr-4">
                  <AvatarImage src={contributor.avatar} alt={contributor.name} />
                  <AvatarFallback>{contributor.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium">{contributor.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Languages: {contributor.languages.join(', ')}
                  </p>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="font-medium">{contributor.contributions.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground ml-1">points</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline">View Full Leaderboard</Button>
        </CardFooter>
      </Card>
    </div>
  );
}