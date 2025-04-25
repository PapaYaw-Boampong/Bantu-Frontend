import { useEffect, useState } from 'react';
import { Clock, Languages, Globe } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Card,
  CardContent,
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


type InfoCard = {
  title: string;
  description: string;
  type: 'info' | 'event' | 'tip';
};

export default function Dashboard() {
  const [infoCards, setInfoCards] = useState<InfoCard[]>([
    {
      title: 'Welcome to Project Bantu',
      description: 'Help preserve African languages through your contributions.',
      type: 'info',
    },
    {
      title: 'Upcoming Event: Language Workshop',
      description: 'Join us for a virtual workshop on Yoruba language preservation.',
      type: 'event',
    },
    {
      title: 'Tip: Clear Audio Recording',
      description: 'Use a quiet environment and speak clearly for best results.',
      type: 'tip',
    },
    {
      title: 'New Feature: API Access',
      description: 'Access our speech recognition and translation APIs.',
      type: 'info',
    },
  ]);

  // State for user data
  const [userName, setUserName] = useState<string | null>(null);

  // Load the user data from localStorage when the component mounts
  useEffect(() => {
    const userMeta = localStorage.getItem('user_meta');
    if (userMeta) {
      const user = JSON.parse(userMeta);  // Assuming your user data is stored in 'user_meta'
      setUserName(user.fullname);  // Set the user's name to state
    }
    // setLoading(false);
  }, []);
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold pb-3"> Hi {userName || ''}</h1>
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-4">
        <Card className="animate-fade-up [animation-delay:200ms] opacity-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Hours Contributed
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5</div>
            <p className="text-xs text-muted-foreground">
              +2.1 hours from last week
            </p>
          </CardContent>
        </Card>
        <Card className="animate-fade-up [animation-delay:400ms] opacity-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Words Transcribed
            </CardTitle>
            <Languages className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,345</div>
            <p className="text-xs text-muted-foreground">
              +180 words from last week
            </p>
          </CardContent>
        </Card>
        <Card className="animate-fade-up [animation-delay:600ms] opacity-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Languages Contributed
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Yoruba, Igbo, Hausa, Swahili
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Cards Carousel */}

      <Card className="animate-fade-up [animation-delay:800ms] opacity-0 shadow-none border-none">
        <CardHeader>
          <CardTitle>Project Updates</CardTitle>
        </CardHeader>
        <CardContent className="border-none">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
            plugins={[Autoplay({ delay: 6000 })]}
          >
            <CarouselContent>
              {infoCards.map((card, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 ">
                  <Card className="h-full flex flex-col ">
                    <CardHeader>
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground">{card.description}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </CardContent>
      </Card>
    </div>
  );
}