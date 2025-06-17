import { useEffect, useState } from 'react';
import { Clock, Languages, Globe, Coins, RefreshCw } from 'lucide-react';
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
} from '@/components/ui/carousel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

import { useUserStats } from '@/hooks/userHooks/useUserStats';
import { useUserLanguageStats } from '@/hooks/languageHooks/useUserLanguageStats';
import { useGetUserLanguages } from '@/hooks/languageHooks/useGetUserLanguages';

type InfoCard = {
  title: string;
  description: string;
  type: 'info' | 'event' | 'tip';
};

export default function Dashboard() {
  // State for info cards
  const [infoCards] = useState<InfoCard[]>([
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

  // User data from localStorage
  const [userName, setUserName] = useState<string | null>(null);
  // Selected language for stats
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>('general');

  // Load the user data from localStorage when the component mounts
  useEffect(() => {
    const userMeta = localStorage.getItem('user_meta');
    if (userMeta) {
      const user = JSON.parse(userMeta);
      setUserName(user.fullname);
    }
  }, []);
  
  // Fetch user languages
  const { 
    data: userLanguages = [], 
    isLoading: isLoadingLanguages 
  } = useGetUserLanguages();

  // Fetch general user statistics
  const { 
    data: userStats, 
    isLoading: isLoadingStats,
    refetch: refetchStats
  } = useUserStats();

  // Fetch language-specific statistics if a language is selected
  const { 
    data: languageStats,
    isLoading: isLoadingLanguageStats 
  } = useUserLanguageStats(selectedLanguageId);

  // Determine which stats to display (general or language-specific)
  const isLoading = isLoadingStats || isLoadingLanguageStats || isLoadingLanguages;
  
  // Get the statistics values to display
  const getStatsValues = () => {
    // Default empty values
    const defaultStats = {
      totalHoursSpeech: 0,
      totalSentencesTranslated: 0,
      totalAnnotationTokens: 0,
      languages: userLanguages.length,
    };

    // If loading, return default
    if (isLoading) return defaultStats;

    // If viewing general stats, use userStats
    if (selectedLanguageId === 'general' && userStats) {
      return {
        totalHoursSpeech: userStats.general_statistics.total_hours_speech || 0,
        totalSentencesTranslated: userStats.general_statistics.total_sentences_translated || 0,
        totalAnnotationTokens: userStats.general_statistics.total_annotation_tokens || 0,
        languages: userLanguages.length,
      };
    }
    
    // If viewing language-specific stats, use languageStats
    if (languageStats && languageStats.length > 0) {
      // Sum up values across different task types
      return {
        totalHoursSpeech: languageStats.reduce((sum, stat) => sum + (stat.statistics.total_hours_speech || 0), 0),
        totalSentencesTranslated: languageStats.reduce((sum, stat) => sum + (stat.statistics.total_sentences_translated || 0), 0),
        totalAnnotationTokens: languageStats.reduce((sum, stat) => sum + (stat.statistics.total_annotation_tokens || 0), 0),
        languages: 1, // It's for a specific language
      };
    }

    return defaultStats;
  };

  // Get the formatted language list
  const getLanguageList = () => {
    if (userLanguages.length === 0) return "None";
    return userLanguages
      .map(lang => lang.language.name)
      .join(", ");
  };

  // Get the stats values
  const { totalHoursSpeech, totalSentencesTranslated, totalAnnotationTokens, languages } = getStatsValues();

  // Handle language change
  const handleLanguageChange = (value: string) => {
    setSelectedLanguageId(value);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    refetchStats();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Hi {userName || ''}</h1>
        
        <div className="flex items-center gap-3">
          <Select
            value={selectedLanguageId}
            onValueChange={handleLanguageChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General (All Languages)</SelectItem>
              {userLanguages.map((lang) => (
                <SelectItem key={lang.association_id} value={lang.association_id}>
                  {lang.language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button 
            onClick={handleRefresh} 
            className="p-2 rounded-full hover:bg-muted"
            title="Refresh statistics"
            disabled={isLoading}
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 p-4">
        <Card className="animate-fade-up [animation-delay:200ms] opacity-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Hours of Speech Contributed
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalHoursSpeech.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Hours of audio recordings
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="animate-fade-up [animation-delay:400ms] opacity-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Translated Sentences
            </CardTitle>
            <Languages className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalSentencesTranslated.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Sentences translated
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="animate-fade-up [animation-delay:400ms] opacity-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Image Annotation Tokens
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalAnnotationTokens.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Annotation tokens created
                </p>
              </>
            )}
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
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{languages}</div>
                <p className="text-xs text-muted-foreground truncate">
                  {getLanguageList()}
                </p>
              </>
            )}
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