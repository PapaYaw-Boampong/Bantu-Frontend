import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, Rocket, AlertCircle, CheckCircle, Plus, Trash2, GripVertical, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  EventType, 
  TaskType, 
  EventCategory, 
  ChallengeStatus, 
  ChallengeSaveRequest 
} from '@/types/challenge';
import { 
  RewardType, 
  DistributionMethod, 
  RewardConfiguration, 
  ChallengeRewardUpdate 
} from '@/types/rewards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { FormLabel } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Import the hooks
import { useSaveChallenge } from '@/hooks/challengeHooks/useSaveChallenge';
import { useGetChallenge } from '@/hooks/challengeHooks/useGetChallenge';
import { usePublishChallenge } from '@/hooks/challengeHooks/usePublishChallenge';
import { useLanguages } from '@/hooks/languageHooks/useLanguages';
import { useChallengeUpdate } from '@/hooks/challengeHooks/useChallengeUpdate';

// Import the RewardsTab component and types
import { RewardsTab} from '@/components/challenges/RewardsTab';

// Define interfaces for Rule and Prize
interface Rule {
  id: string;
  title: string;
  text: string;
}

interface Prize {
  id: string;
  label: string;
  description: string;
  amount: string;
  distribution_type: 'fixed' | 'percentage' | 'bounty';
}

// Item types for drag and drop
const ItemTypes = {
  RULE: 'rule',
  CRITERION: 'criterion',
  PRIZE: 'prize',
};

export default function CreateChallenge() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { toast } = useToast();
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  
  // Use the appropriate hooks
  const { mutateAsync: saveChallenge, isPending: isSaving } = useSaveChallenge();
  const { data: challenge, isLoading: isLoadingChallenge } = useGetChallenge(id || '');
  const { mutateAsync: publishChallenge, isPending: isPublishing } = usePublishChallenge();
  const { data: languages = [], isLoading: loadingLanguages } = useLanguages();
  
  // Optional: Use the challenge update hook to track real-time changes
  const { refreshChallenge } = useChallengeUpdate(id || '');
  
  const loading = isSaving || isLoadingChallenge || isPublishing || loadingLanguages;
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    challenge_name: '',
    description: '',
    event_type: EventType.DATA_COLLECTION,
    task_type: TaskType.TRANSCRIPTION,
    event_category: EventCategory.COMPETITION,
    start_date: '',
    end_date: '',
    target_contribution_count: '',
    language_id: '',
    rules: [] as Rule[],
    prizes: [] as Prize[],
    is_public: true,
    reward_configuration: {
      reward_type: RewardType.CASH,
      distribution_method: DistributionMethod.FIXED,
      amount: 0,
      currency: 'USD',
    } as RewardConfiguration,
  });

  // State for new item inputs
  const [newRule, setNewRule] = useState({ 
    title: '', 
    text: '' 
  });
  const [newPrize, setNewPrize] = useState({ 
    label: '', 
    description: '', 
    amount: '', 
    distribution_type: 'fixed' as 'fixed' | 'percentage' | 'bounty'
  });

  const [challengeImage, setChallengeImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (isEditing && id && challenge) {
      // Parse structured data from challenge if available
      let rules: Rule[] = [];
      let prizes: Prize[] = [];
      
      try {
        // Access rules from challenge directly
        const challengeRules = challenge.rules || [];
        if (Array.isArray(challengeRules) && challengeRules.length > 0) {
          rules = challengeRules.map(rule => ({
            id: rule.rule_id || crypto.randomUUID(),
            title: rule.rule_title,
            text: rule.rule_description
          }));
        } else if (typeof challengeRules === 'string') {
          // If still stored as string, try to parse it
          const parsedRules = JSON.parse(challengeRules);
          rules = Array.isArray(parsedRules) ? parsedRules.map(rule => ({
            id: rule.id || crypto.randomUUID(),
            title: rule.rule_title || rule.title,
            text: rule.rule_description || rule.text
          })) : [];
        }
      } catch (e) {
        console.error('Failed to parse challenge rules', e);
        rules = [];
      }
      
      // Try to parse reward configuration if it exists
      let rewardConfig = {
        reward_type: RewardType.CASH,
        distribution_method: DistributionMethod.FIXED,
        amount: 0,
        currency: 'USD',
      };
      
      try {
        const challengeRewardConfig = challenge.reward_configuration;
        if (challengeRewardConfig) {
          if (typeof challengeRewardConfig === 'string') {
            rewardConfig = JSON.parse(challengeRewardConfig);
          } else {
            rewardConfig = challengeRewardConfig;
          }
        }
      } catch (e) {
        console.error('Failed to parse reward configuration', e);
      }
      
      setFormData({
        challenge_name: challenge.challenge_name,
        description: challenge.description || '',
        event_type: challenge.event_type,
        task_type: challenge.task_type,
        event_category: challenge.event_category,
        start_date: new Date(challenge.start_date).toISOString().slice(0, 16),
        end_date: new Date(challenge.end_date).toISOString().slice(0, 16),
        target_contribution_count: challenge.target_contribution_count ? String(challenge.target_contribution_count) : '',
        language_id: challenge.language_id || '',
        rules,
        prizes,
        is_public: challenge.is_public !== undefined ? challenge.is_public : true,
        reward_configuration: rewardConfig,
      });
    }
  }, [id, isEditing, challenge]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.challenge_name.trim()) {
      errors.challenge_name = 'Challenge name is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.start_date) {
      errors.start_date = 'Start date is required';
    }
    
    if (!formData.end_date) {
      errors.end_date = 'End date is required';
    }
    
    if (!formData.language_id) {
      errors.language_id = 'Target language is required';
    }
    
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    const now = new Date();
    
    if (startDate < now) {
      errors.start_date = 'Start date must be in the future';
    }
    
    if (endDate <= startDate) {
      errors.end_date = 'End date must be after start date';
    }
    
    // Validate reward configuration
    const { reward_configuration } = formData;
    
    if (reward_configuration.reward_type === RewardType.CASH) {
      if (reward_configuration.distribution_method === DistributionMethod.FIXED || 
          reward_configuration.distribution_method === DistributionMethod.PERCENTAGE) {
        if (!reward_configuration.amount || reward_configuration.amount <= 0) {
          errors.reward_amount = 'Reward amount must be greater than zero';
        }
      } else if (reward_configuration.distribution_method === DistributionMethod.TIERED) {
        if (!reward_configuration.tiers || reward_configuration.tiers.length === 0) {
          errors.reward_tiers = 'At least one reward tier must be defined';
        } else {
          const invalidTiers = reward_configuration.tiers.filter(tier => !tier.amount || tier.amount <= 0);
          if (invalidTiers.length > 0) {
            errors.reward_tiers = 'All tier amounts must be greater than zero';
          }
        }
      }
    } else if (reward_configuration.reward_type === RewardType.BADGE) {
      if (reward_configuration.distribution_method === DistributionMethod.FIXED) {
        if (!reward_configuration.badge_name || !reward_configuration.badge_name.trim()) {
          errors.badge_name = 'Badge name is required';
        }
      } else if (reward_configuration.distribution_method === DistributionMethod.TIERED) {
        if (!reward_configuration.tiers || reward_configuration.tiers.length === 0) {
          errors.reward_tiers = 'At least one badge tier must be defined';
        }
      }
    } else if (reward_configuration.reward_type === RewardType.SWAG) {
      if (reward_configuration.distribution_method === DistributionMethod.FIXED) {
        if (!reward_configuration.swag_item || !reward_configuration.swag_item.trim()) {
          errors.swag_item = 'SWAG item name is required';
        }
      } else if (reward_configuration.distribution_method === DistributionMethod.TIERED) {
        if (!reward_configuration.tiers || reward_configuration.tiers.length === 0) {
          errors.reward_tiers = 'At least one SWAG tier must be defined';
        }
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Functions to handle structured data
  const addRule = () => {
    if (!newRule.title.trim() || !newRule.text.trim()) {
      toast({
        title: "Error",
        description: "Please provide both a title and description for the rule.",
        variant: "destructive",
      });
      return;
    }
    
    const rule: Rule = {
      id: crypto.randomUUID(),
      title: newRule.title.trim(),
      text: newRule.text.trim(),
    };
    
    setFormData({ ...formData, rules: [...formData.rules, rule] });
    setNewRule({ title: '', text: '' });
  };

  const removeRule = (id: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter(rule => rule.id !== id)
    }));
  };

  const addPrize = () => {
    if (!newPrize.label.trim() || !newPrize.description.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      prizes: [
        ...prev.prizes,
        { 
          id: Math.random().toString(36).substring(2, 9), 
          label: newPrize.label.trim(),
          description: newPrize.description.trim(),
          amount: newPrize.amount.trim(),
          distribution_type: newPrize.distribution_type
        }
      ]
    }));
    setNewPrize({ 
      label: '', 
      description: '', 
      amount: '', 
      distribution_type: 'fixed' 
    });
  };

  const removePrize = (id: string) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.filter(prize => prize.id !== id)
    }));
  };

  // Drag and drop functionality for rules
  const moveRule = (dragIndex: number, hoverIndex: number) => {
    const draggedRule = formData.rules[dragIndex];
    const newRules = [...formData.rules];
    newRules.splice(dragIndex, 1);
    newRules.splice(hoverIndex, 0, draggedRule);
    setFormData(prev => ({ ...prev, rules: newRules }));
  };

  // Drag and drop functionality for prizes
  const movePrize = (dragIndex: number, hoverIndex: number) => {
    const draggedPrize = formData.prizes[dragIndex];
    const newPrizes = [...formData.prizes];
    newPrizes.splice(dragIndex, 1);
    newPrizes.splice(hoverIndex, 0, draggedPrize);
    setFormData(prev => ({ ...prev, prizes: newPrizes }));
  };

  // Draggable rule component
  const DraggableRule = ({ rule, index, moveRule, onRemove }: { 
    rule: Rule; 
    index: number; 
    moveRule: (dragIndex: number, hoverIndex: number) => void;
    onRemove: (id: string) => void;
  }) => {
    const [{ isDragging }, drag] = useDrag({
      type: ItemTypes.RULE,
      item: { id: rule.id, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [, drop] = useDrop({
      accept: ItemTypes.RULE,
      hover: (item: { id: string; index: number }, monitor) => {
        if (!item) return;
        const dragIndex = item.index;
        const hoverIndex = index;

        if (dragIndex === hoverIndex) return;

        moveRule(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    });

    const ref = (node: HTMLDivElement | null) => {
      drag(drop(node));
    };

    return (
      <div
        ref={ref}
        className="flex items-center gap-4 p-4 bg-background border rounded-md"
      >
        <div 
          className="cursor-move text-muted-foreground" 
          ref={drag}
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="font-medium">{rule.title}</div>
          <div className="text-sm text-muted-foreground">{rule.text}</div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onRemove(rule.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    );
  };

  // Draggable prize component
  const DraggablePrize = ({ prize, index, movePrize, onRemove }: { 
    prize: Prize; 
    index: number; 
    movePrize: (dragIndex: number, hoverIndex: number) => void;
    onRemove: (id: string) => void;
  }) => {
    const [{ isDragging }, drag] = useDrag({
      type: ItemTypes.PRIZE,
      item: { id: prize.id, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [, drop] = useDrop({
      accept: ItemTypes.PRIZE,
      hover: (item: { id: string; index: number }, monitor) => {
        if (!item) return;
        const dragIndex = item.index;
        const hoverIndex = index;

        if (dragIndex === hoverIndex) return;

        movePrize(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    });

    const ref = (node: HTMLDivElement | null) => {
      drag(drop(node));
    };

    return (
      <div
        ref={ref}
        className={`flex items-center p-3 mb-2 border rounded-md ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      >
        <GripVertical className="h-5 w-5 mr-2 text-muted-foreground cursor-move" />
        <div className="flex-grow">
          <div className="font-medium">{prize.label}</div>
          <div className="text-sm">{prize.description}</div>
          {prize.amount && (
            <div className="text-sm text-muted-foreground">
              Amount: {prize.amount} ({prize.distribution_type})
            </div>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onRemove(prize.id)}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before saving',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Map the form rules to match the API expected format
      const mappedRules = formData.rules.map(rule => ({
        rule_id: rule.id,
        rule_title: rule.title,
        rule_description: rule.text,
        is_required: true
      }));

      // Prepare challenge data for the API
      const challengeData = {
        challenge_name: formData.challenge_name,
        language_id: formData.language_id,
        description: formData.description,
        event_type: formData.event_type,
        task_type: formData.task_type,
        event_category: formData.event_category,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_public: formData.is_public,
        target_contribution_count: formData.target_contribution_count ? parseInt(formData.target_contribution_count) : undefined,
        // Include the ID if we're editing an existing challenge
        ...(id && { id }),
      };
      
      // Format reward data based on the reward configuration
      let challengeReward: ChallengeRewardUpdate | undefined;
      if (formData.reward_configuration) {
        const rewardConfig = formData.reward_configuration;
        
        // Build reward value based on distribution method
        let reward_value: {};
        if (rewardConfig.distribution_method === DistributionMethod.TIERED && rewardConfig.tiers?.length) {
          // Structure tiered rewards as JSON string
          const tieredValue: Record<string, any> = {};
          rewardConfig.tiers.forEach((tier, index) => {
            tieredValue[`tier_${index + 1}`] = {
              rank: tier.rank,
              amount: tier.amount,
              currency: rewardConfig.currency || 'USD'
            };
          });
          reward_value = tieredValue;
        } else {
          // Structure fixed/percentage rewards as JSON string
          const fixedValue = {
            amount: rewardConfig.amount || 0,
            currency: rewardConfig.currency || 'USD'
          };
          reward_value = fixedValue;
        }
        
        // Create the challenge reward object
        challengeReward = {
          reward_type: rewardConfig.reward_type,
          reward_distribution_type: rewardConfig.distribution_method,
          reward_value: reward_value
        };
      }

      // Prepare data structure to send to the backend
      const dataToSave: ChallengeSaveRequest = {
        challenge_data: challengeData,
        challenge_rules: mappedRules,
        ...(challengeReward && { challenge_reward: challengeReward })
      };
      
      const result = await saveChallenge(dataToSave);
      
      if (isEditing) {
        toast({
          title: 'Success',
          description: 'Challenge saved as draft',
        });
        // Refresh the challenge data after saving
        refreshChallenge();
      } else {
        toast({
          title: 'Success',
          description: 'Challenge created as draft',
        });
        // Navigate to edit page with the new challenge ID
        navigate(`/user/edit-challenge/${result.id}`);
      }
    } catch (error) {
      console.error('Failed to save challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to save challenge',
        variant: 'destructive',
      });
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      setPublishDialogOpen(false);
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before publishing',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Map the form rules to match the API expected format
      const mappedRules = formData.rules.map(rule => ({
        rule_id: rule.id,
        rule_title: rule.title,
        rule_description: rule.text,
        is_required: true
      }));

      // Prepare challenge data for the API
      const challengeData = {
        challenge_name: formData.challenge_name,
        language_id: formData.language_id,
        description: formData.description,
        event_type: formData.event_type,
        task_type: formData.task_type,
        event_category: formData.event_category,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_public: formData.is_public,
        target_contribution_count: formData.target_contribution_count ? parseInt(formData.target_contribution_count) : undefined,
        // Include the ID if we're editing an existing challenge
        ...(id && { id }),
      };
      
      // Format reward data based on the reward configuration
      let challengeReward: ChallengeRewardUpdate | undefined;
      if (formData.reward_configuration) {
        const rewardConfig = formData.reward_configuration;
        
        // Build reward value based on distribution method
        let reward_value: string;
        if (rewardConfig.distribution_method === DistributionMethod.TIERED && rewardConfig.tiers?.length) {
          // Structure tiered rewards as JSON string
          const tieredValue: Record<string, any> = {};
          rewardConfig.tiers.forEach((tier, index) => {
            tieredValue[`tier_${index + 1}`] = {
              rank: tier.rank,
              amount: tier.amount,
              currency: rewardConfig.currency || 'USD'
            };
          });
          reward_value = JSON.stringify(tieredValue);
        } else {
          // Structure fixed/percentage rewards as JSON string
          const fixedValue = {
            amount: rewardConfig.amount || 0,
            currency: rewardConfig.currency || 'USD'
          };
          reward_value = JSON.stringify(fixedValue);
        }
        
        // Create the challenge reward object
        challengeReward = {
          reward_type: rewardConfig.reward_type,
          reward_distribution_type: rewardConfig.distribution_method,
          reward_value: reward_value
        };
      }

      // Prepare data structure to send to the backend
      const dataToSave: ChallengeSaveRequest = {
        challenge_data: challengeData,
        challenge_rules: mappedRules,
        ...(challengeReward && { challenge_reward: challengeReward })
      };
      
      if (isEditing && id) {
        // First save any changes to the existing challenge
        await saveChallenge(dataToSave);
        // Then publish it
        await publishChallenge(id);
        
        toast({
          title: 'Success',
          description: 'Challenge published successfully',
        });
        // Refresh the challenge data
        refreshChallenge();
      } else {
        // Create and save a new challenge first
        const newChallenge = await saveChallenge(dataToSave);
        // Then publish it
        await publishChallenge(newChallenge.id);
        
        toast({
          title: 'Success',
          description: 'Challenge published successfully',
        });
        // Navigate to the edit page with the new challenge ID
        navigate(`/user/edit-challenge/${newChallenge.id}`);
      }
      
      setPublishDialogOpen(false);
    } catch (error) {
      console.error('Failed to publish challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish challenge',
        variant: 'destructive',
      });
      setPublishDialogOpen(false);
    }
  };

  const getCompletionStatus = () => {
    const requiredFields = [
      'challenge_name',
      'description',
      'start_date',
      'end_date',
      'event_type',
      'task_type',
      'event_category',
      'language_id',
    ];
    
    const filledFields = requiredFields.filter(field => {
      const value = formData[field as keyof typeof formData];
      return value !== undefined && value !== '';
    });
    
    // Check if reward configuration is valid
    let isRewardValid = false;
    const { reward_configuration } = formData;
    
    if (reward_configuration.reward_type === RewardType.CASH) {
      if (reward_configuration.distribution_method === DistributionMethod.FIXED || 
          reward_configuration.distribution_method === DistributionMethod.PERCENTAGE) {
        isRewardValid = !!reward_configuration.amount && reward_configuration.amount > 0;
      } else if (reward_configuration.distribution_method === DistributionMethod.TIERED) {
        isRewardValid = !!reward_configuration.tiers && 
                        reward_configuration.tiers.length > 0 && 
                        reward_configuration.tiers.every(tier => tier.amount > 0);
      }
    } else if (reward_configuration.reward_type === RewardType.BADGE) {
      if (reward_configuration.distribution_method === DistributionMethod.FIXED) {
        isRewardValid = !!reward_configuration.badge_name && !!reward_configuration.badge_name.trim();
      } else if (reward_configuration.distribution_method === DistributionMethod.TIERED) {
        isRewardValid = !!reward_configuration.tiers && reward_configuration.tiers.length > 0;
      }
    } else if (reward_configuration.reward_type === RewardType.SWAG) {
      if (reward_configuration.distribution_method === DistributionMethod.FIXED) {
        isRewardValid = !!reward_configuration.swag_item && !!reward_configuration.swag_item.trim();
      } else if (reward_configuration.distribution_method === DistributionMethod.TIERED) {
        isRewardValid = !!reward_configuration.tiers && reward_configuration.tiers.length > 0;
      }
    }
    
    return {
      percentage: Math.round((filledFields.length / (requiredFields.length + 1)) * 100),
      isComplete: filledFields.length === requiredFields.length && isRewardValid,
    };
  };

  const completionStatus = getCompletionStatus();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setChallengeImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUploadedImage = () => {
    setChallengeImage(null);
    setImagePreview('');
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Get current date with time set to start of day for comparison
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Convert selected date to Date object for comparison
    const selectedDate = new Date(value);
    
    if (name === 'start_date') {
      // Clear previous error
      setFormErrors(prev => ({ ...prev, start_date: '' }));
      
      // Check if start date is in the past
      if (selectedDate < now) {
        setFormErrors(prev => ({ 
          ...prev, 
          start_date: 'Start date cannot be in the past' 
        }));
        return;
      }
      
      // If end date is already set, verify it's after new start date
      if (formData.end_date) {
        const endDate = new Date(formData.end_date);
        if (endDate <= selectedDate) {
          setFormErrors(prev => ({ 
            ...prev, 
            end_date: 'End date must be after start date' 
          }));
        } else {
          // Clear end date error if it exists
          setFormErrors(prev => ({ ...prev, end_date: '' }));
        }
      }
    } 
    else if (name === 'end_date') {
      // Clear previous error
      setFormErrors(prev => ({ ...prev, end_date: '' }));
      
      // Check if end date is in the past
      if (selectedDate < now) {
        setFormErrors(prev => ({ 
          ...prev, 
          end_date: 'End date cannot be in the past' 
        }));
        return;
      }
      
      // Verify end date is after start date
      if (formData.start_date) {
        const startDate = new Date(formData.start_date);
        if (selectedDate <= startDate) {
          setFormErrors(prev => ({ 
            ...prev, 
            end_date: 'End date must be after start date' 
          }));
          return;
        }
      }
    }
    
    // Update form data
    setFormData({ ...formData, [name]: value });
  };

  // Fix the EventCategory SelectItems
  // Later in the file find and replace these items...

  const eventCategoryItems = (
    <>
      <SelectItem value={EventCategory.COMPETITION}>Competition</SelectItem>
      <SelectItem value={EventCategory.BOUNTY}>Bounty</SelectItem>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-6 hover:bg-accent"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{isEditing ? 'Edit Challenge' : 'Create Challenge'}</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                {isEditing 
                  ? 'Update your challenge details and settings' 
                  : 'Set up a new challenge for participants'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={handleSaveDraft}
                disabled={loading}
                className="min-w-[120px]"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    disabled={loading || !completionStatus.isComplete}
                    className="min-w-[120px]"
                  >
                    <Rocket className="mr-2 h-4 w-4" />
                    Publish
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Publish Challenge</DialogTitle>
                    <DialogDescription className="text-base">
                      This will make your challenge visible to all users and start accepting contributions.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-6 space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Challenge Timeline</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Start Date</p>
                          <p className="font-medium">
                            {formData.start_date 
                              ? new Date(formData.start_date).toLocaleDateString() 
                              : 'Not set'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">End Date</p>
                          <p className="font-medium">
                            {formData.end_date 
                              ? new Date(formData.end_date).toLocaleDateString() 
                              : 'Not set'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Alert className="bg-primary/5 border-primary/20">
                      <AlertCircle className="h-4 w-4 text-primary" />
                      <AlertTitle>Ready to Launch</AlertTitle>
                      <AlertDescription>
                        Your challenge meets all requirements and is ready to be published.
                      </AlertDescription>
                    </Alert>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handlePublish} className="min-w-[100px]">
                      Publish
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="details" className="w-full">
              <div className="w-full bg-muted/50 rounded-lg p-1">
                <TabsList className="w-full h-full flex flex-wrap items-stretch justify-start gap-2">
                  <TabsTrigger value="details" className="flex-grow min-w-[150px] h-10 text-center">Basic Info</TabsTrigger>
                  <TabsTrigger value="settings" className="flex-grow min-w-[150px] h-10 text-center">Challenge Settings</TabsTrigger>
                  <TabsTrigger value="rules" className="flex-grow min-w-[150px] h-10 text-center">Rules & Criteria</TabsTrigger>
                  <TabsTrigger value="prizes" className="flex-grow min-w-[150px] h-10 text-center">Prizes & Rewards</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="details" className="mt-6">
                <Card className="border border-border/50">
                  <CardHeader>
                    <CardTitle className="text-2xl">Basic Information</CardTitle>
                    <CardDescription className="text-base">
                      Set the core details and visual identity of your challenge.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="challenge_name" className="text-base">
                        Challenge Name
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Input
                        id="challenge_name"
                        name="challenge_name"
                        placeholder="Enter a descriptive name for your challenge"
                        value={formData.challenge_name}
                        onChange={handleInputChange}
                        className={cn(
                          "h-11",
                          formErrors.challenge_name && "border-destructive"
                        )}
                      />
                      {formErrors.challenge_name && (
                        <p className="text-sm text-destructive">{formErrors.challenge_name}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-base">
                        Description
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe your challenge's purpose and goals"
                        value={formData.description}
                        onChange={handleInputChange}
                        className={cn(
                          "min-h-[120px] resize-none",
                          formErrors.description && "border-destructive"
                        )}
                      />
                      {formErrors.description && (
                        <p className="text-sm text-destructive">{formErrors.description}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base">Challenge Image</Label>
                      <div className="grid gap-4">
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="challenge-image"
                            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors relative"
                          >
                            {imagePreview ? (
                              <>
                                <img
                                  src={imagePreview}
                                  alt="Challenge preview"
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                <Button 
                                  type="button"
                                  size="icon"
                                  variant="destructive"
                                  className="absolute top-2 right-2"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeUploadedImage();
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                  <span className="font-medium">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  PNG, JPG or GIF (MAX. 800x400px)
                                </p>
                              </div>
                            )}
                            <input
                              id="challenge-image"
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <Card className="border border-border/50">
                  <CardHeader>
                    <CardTitle className="text-2xl">Challenge Settings</CardTitle>
                    <CardDescription className="text-base">
                      Configure the challenge parameters and visibility.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="event_type" className="text-base">
                          Challenge Type
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Select
                          value={formData.event_type}
                          onValueChange={(value) => handleSelectChange('event_type', value)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={EventType.DATA_COLLECTION}>Data Collection</SelectItem>
                            <SelectItem value={EventType.SAMPLE_REVIEW}>Sample Review</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="task_type" className="text-base">
                          Task Type
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Select
                          value={formData.task_type}
                          onValueChange={(value) => handleSelectChange('task_type', value)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select task type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={TaskType.TRANSCRIPTION}>Transcription</SelectItem>
                            <SelectItem value={TaskType.TRANSLATION}>Translation</SelectItem>
                            <SelectItem value={TaskType.ANNOTATION}>Annotation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="language_id" className="text-base">
                          Target Language
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Select
                          value={formData.language_id}
                          onValueChange={(value) => handleSelectChange('language_id', value)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((language) => (
                              <SelectItem key={language.id} value={language.id}>
                                {language.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formErrors.language_id && (
                          <p className="text-sm text-destructive">{formErrors.language_id}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="event_category" className="text-base">
                          Category
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Select
                          value={formData.event_category}
                          onValueChange={(value) => handleSelectChange('event_category', value)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventCategoryItems}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="target_contribution_count" className="text-base">
                          Target Contributions
                        </Label>
                        <Input
                          id="target_contribution_count"
                          name="target_contribution_count"
                          type="number"
                          placeholder="Enter target number"
                          value={formData.target_contribution_count}
                          onChange={handleInputChange}
                          className="h-11"
                        />
                        <p className="text-sm text-muted-foreground">Optional: Set a target for contributions</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="start_date" className="text-base">
                          Start Date
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Input
                          id="start_date"
                          name="start_date"
                          type="datetime-local"
                          value={formData.start_date}
                          onChange={handleDateInputChange}
                          className={cn(
                            "h-11",
                            formErrors.start_date && "border-destructive"
                          )}
                        />
                        {formErrors.start_date && (
                          <p className="text-sm text-destructive">{formErrors.start_date}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="end_date" className="text-base">
                          End Date
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Input
                          id="end_date"
                          name="end_date"
                          type="datetime-local"
                          value={formData.end_date}
                          onChange={handleDateInputChange}
                          className={cn(
                            "h-11",
                            formErrors.end_date && "border-destructive"
                          )}
                        />
                        {formErrors.end_date && (
                          <p className="text-sm text-destructive">{formErrors.end_date}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-base">Visibility</Label>
                      <Select
                        value={formData.is_public ? 'public' : 'private'}
                        onValueChange={(value) => handleSelectChange('is_public', value === 'public' ? 'true' : 'false')}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public - All users can see and join</SelectItem>
                          <SelectItem value="private">Private - Only invited users can join</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="rules" className="mt-6">
                <Card className="border border-border/50">
                  <CardHeader>
                    <CardTitle className="text-2xl">Rules & Evaluation Criteria</CardTitle>
                    <CardDescription className="text-base">
                      Define how participants should approach the challenge and how contributions will be evaluated.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="space-y-4">
                      <Label className="text-base">Challenge Rules</Label>
                      <DndProvider backend={HTML5Backend}>
                        <div className="space-y-3">
                          {formData.rules.map((rule, index) => (
                            <DraggableRule
                              key={rule.id}
                              rule={rule}
                              index={index}
                              moveRule={moveRule}
                              onRemove={removeRule}
                            />
                          ))}
                        </div>
                      </DndProvider>
                      <div className="flex gap-3">
                        <Input
                          placeholder="Add a new rule..."
                          value={newRule.title}
                          onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addRule();
                            }
                          }}
                          className="h-11"
                        />
                        <Input
                          placeholder="Add a new rule description..."
                          value={newRule.text}
                          onChange={(e) => setNewRule({ ...newRule, text: e.target.value })}
                          className="h-11"
                        />
                        <Button onClick={addRule} className="h-11">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Rule
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Clearly explain what participants should do and any guidelines to follow.
                      </p>
                    </div>

                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="prizes" className="mt-6">
                <Card className="border border-border/50">
                  <CardHeader>
                    <CardTitle className="text-2xl">Prizes & Rewards</CardTitle>
                    <CardDescription className="text-base">
                      Define what participants can win or earn from this challenge.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <Separator className="my-2" />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Structured Rewards</h3>
                        <Badge variant="outline" className="text-xs font-medium">New</Badge>
                      </div>
                      <RewardsTab 
                        rewardConfig={formData.reward_configuration}
                        onChange={(config: RewardConfiguration) => {
                          setFormData({
                            ...formData,
                            reward_configuration: config,
                          });
                        }}
                        isLoading={loading}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card className="border border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl">Challenge Status</CardTitle>
                <CardDescription className="text-base">
                  Track your progress and publishing details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-3">
                    <span className="text-base font-medium">Completion</span>
                    <span className="text-base text-muted-foreground">{completionStatus.percentage}%</span>
                  </div>
                  <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-300",
                        completionStatus.isComplete ? "bg-primary" : "bg-orange-500"
                      )}
                      style={{ width: `${completionStatus.percentage}%` }}
                    ></div>
                  </div>
                </div>
                
                {completionStatus.isComplete ? (
                  <Alert className="bg-primary/5 border-primary/20">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <AlertTitle className="text-base">All set!</AlertTitle>
                    <AlertDescription className="text-sm">
                      Your challenge is ready to be published.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-orange-500/5 border-orange-500/20">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <AlertTitle className="text-base">Almost there</AlertTitle>
                    <AlertDescription className="text-sm">
                      Complete all required fields to publish your challenge.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-4">
                  <h4 className="text-base font-medium">Challenge Timeline</h4>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date</span>
                      <span className="font-medium">
                        {formData.start_date 
                          ? new Date(formData.start_date).toLocaleDateString() 
                          : 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">End Date</span>
                      <span className="font-medium">
                        {formData.end_date 
                          ? new Date(formData.end_date).toLocaleDateString() 
                          : 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">
                        {formData.start_date && formData.end_date 
                          ? `${Math.ceil((new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()) / (1000 * 60 * 60 * 24))} days` 
                          : 'Not set'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 