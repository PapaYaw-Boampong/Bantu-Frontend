import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useBeforeUnload } from 'react-router-dom';
import { ChevronLeft, Save, Rocket, AlertCircle, CheckCircle, Plus, Trash2, GripVertical, Upload, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
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
import { useGetDetailedChallenge } from '@/hooks/challengeHooks/useGetDetailedChallenge';
import { usePublishChallenge } from '@/hooks/challengeHooks/usePublishChallenge';
import { useLanguages } from '@/hooks/languageHooks/useLanguages';
import { useChallengeUpdate } from '@/hooks/challengeHooks/useChallengeUpdate';
import { useRemoveRule } from '@/hooks/challengeHooks/useRemoveRule';
import { useQueryClient } from '@tanstack/react-query';

// Import the RewardsTab component and types
import { RewardsTab, parseRewardFromAPI, serializeRewardForAPI } from '@/components/challenges/RewardsTab';

// Define interfaces for Rule and Prize
interface Rule {
  id?: string;
  title: string;
  text: string;
}

interface addRule{
  title: string;
  text: string;
}

// Item types for drag and drop
const ItemTypes = {
  RULE: 'rule',
};

export default function CreateChallenge() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  
  // Instead of using URL params, get from query string if editing
  const challengeId = searchParams.get('id');
  const isEditing = !!challengeId;

  const { toast } = useToast();
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  
  // Use the appropriate hooks
  const { mutateAsync: saveChallenge, isPending: isSaving } = useSaveChallenge();
  const { data: challenge, isLoading: isLoadingChallenge } = useGetDetailedChallenge(challengeId || '');
  const { mutateAsync: publishChallenge, isPending: isPublishing } = usePublishChallenge();
  const { data: languages = [], isLoading: loadingLanguages } = useLanguages();
  const { mutateAsync: removeRuleApi, isPending: isRemovingRule } = useRemoveRule();
  
  // Optional: Use the challenge update hook to track real-time changes
  const { refreshChallenge } = useChallengeUpdate(challengeId || '');
  
  const loading = isSaving || isLoadingChallenge || isPublishing || loadingLanguages || isRemovingRule;
  
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

  const [challengeImage, setChallengeImage] = useState<File | null>(null);

  
  const [imagePreview, setImagePreview] = useState<string>('');

  const toDatetimeLocal = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      // Parse the date string and ensure it's valid
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString);
        return '';
      }
      
      // Get the timezone offset in minutes
      const offset = date.getTimezoneOffset();
      
      // Create a new date adjusted for the timezone
      const localDate = new Date(date.getTime() - offset * 60000);
      
      // Return the date in the format expected by datetime-local input
      return localDate.toISOString().slice(0, 16);
    } catch (error) {
      console.error('Error converting date:', error);
      return '';
    }
  };
  

  useEffect(() => {
    console.log('useEffect running, isEditing:', isEditing, 'challengeId:', challengeId);
    console.log('Challenge data received:', challenge);
    
    if (isEditing && challengeId && challenge) {
      // The API returns a structure where the challenge data might be nested
      // Extract the actual challenge data
      const challengeData = challenge.challenge || challenge;
      console.log('Using challenge data:', challengeData);
      
      // Parse structured data from challenge if available
      let rules: Rule[] = [];
      
      try {
        // The API might return the rules in different formats
        // 1. As challenge.rules for direct API response
        // 2. As challenge.parsedRules for cached response
        // 3. Nested inside challenge as challenge.rules
        let challengeRules = [];
        
        if (Array.isArray(challenge.rules)) {
          // Format from direct API response: {challenge, reward, rules}
          challengeRules = challenge.rules;
          console.log('Using rules array from direct API response:', challengeRules);
        // } else if (challenge.parsedRules && Array.isArray(challenge.parsedRules)) {
        //   // Format from cache when previously processed
        //   challengeRules = challenge.parsedRules;
        //   console.log('Using parsedRules array from cache:', challengeRules);
        } else if (typeof challenge.rules === 'string') {
          // Rules might be a JSON string
          try {
            challengeRules = JSON.parse(challenge.rules);
            console.log('Parsed rules from string:', challengeRules);
          } catch (e) {
            console.error('Failed to parse rules string:', e);
          }
        }
        
        console.log('Challenge rules to process:', challengeRules);
        
        if (Array.isArray(challengeRules) && challengeRules.length > 0) {
          rules = challengeRules.map(rule => {
            // Ensure each rule has an ID for proper tracking
            const ruleId = rule.id || rule.rule_id || `server_rule_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            
            return {
              id: ruleId,
              title: rule.rule_title,
              text: rule.rule_description
            };
          });
        }
        
        console.log('Processed rules:', rules);
      } catch (e) {
        console.error('Failed to parse challenge rules', e);
        rules = [];
      }
      
      // Try to parse reward configuration if it exists
      let rewardConfig: RewardConfiguration = {
        reward_type: RewardType.CASH,
        distribution_method: DistributionMethod.FIXED,
        amount: 0,
        currency: 'USD'
      };
      
      try {
        // The API might return the reward in different formats
        // 1. As challenge.reward for direct API response
        // 2. As challenge.parsedReward for cached response
        let rewardData = null;
        
        if (challenge.reward && typeof challenge.reward === 'object' && !Array.isArray(challenge.reward)) {
          // Direct API response format
          rewardData = challenge.reward;
          console.log('Using reward from direct API response:', rewardData);
        // } else if (challenge.parsedReward) {
        //   // Format from cache when previously processed
        //   rewardData = challenge.parsedReward;
        //   console.log('Using parsedReward from cache:', rewardData);
        } else if (typeof challenge.reward === 'string') {
          // Reward might be a JSON string
          try {
            rewardData = JSON.parse(challenge.reward);
            console.log('Parsed reward from string:', rewardData);
          } catch (e) {
            console.error('Failed to parse reward string:', e);
          }
        } else if (challengeData.reward_configuration) {
          // Might be stored in reward_configuration
          rewardData = typeof challengeData.reward_configuration === 'string' 
            ? JSON.parse(challengeData.reward_configuration) 
            : challengeData.reward_configuration;
          console.log('Using reward_configuration:', rewardData);
        }
        
        console.log('Reward data to process:', rewardData);
        
        if (rewardData) {
          // Use the parseRewardFromAPI utility function to parse the reward data
          rewardConfig = parseRewardFromAPI(rewardData);
          console.log('Processed reward config:', rewardConfig);
        }
      } catch (e) {
        console.error('Failed to parse reward configuration', e);
      }
      
      // Format dates for the form
      const startDate = challengeData.start_date ? toDatetimeLocal(challengeData.start_date) : '';
      const endDate = challengeData.end_date ? toDatetimeLocal(challengeData.end_date) : '';
      
      console.log('Converted dates - start:', startDate, 'end:', endDate);
      console.log('Original dates - start:', challengeData.start_date, 'end:', challengeData.end_date);
      
      // Safely set the form data with proper date handling
      const updatedFormData = {
        challenge_name: challengeData.challenge_name,
        description: challengeData.description || '',
        event_type: challengeData.event_type,
        task_type: challengeData.task_type,
        event_category: challengeData.event_category,
        start_date: startDate,
        end_date: endDate,
        target_contribution_count: challengeData.target_contribution_count ? String(challengeData.target_contribution_count) : '',
        language_id: challengeData.language_id || '',
        rules,
        is_public: challengeData.is_public !== undefined ? challengeData.is_public : true,
        reward_configuration: rewardConfig,
      };
      
      console.log('Setting form data to:', updatedFormData);
      setFormData(updatedFormData);
    }
    // At the end, reset unsaved changes flag since we're loading fresh data
    setHasUnsavedChanges(false);
  }, [challengeId, isEditing, challenge]);

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

  // Handle unsaved changes warning when navigating away
  useBeforeUnload((event) => {
    if (hasUnsavedChanges) {
      event.preventDefault();
      return 'You have unsaved changes. Are you sure you want to leave?';
    }
  });

  // Handle back button navigation safely
  const handleBackNavigation = useCallback(() => {
    if (hasUnsavedChanges) {
      setPendingNavigation('-1'); // Store where we want to navigate
      setShowUnsavedChangesDialog(true); // Show confirmation dialog
    } else {
      if (isEditing) {
        navigate(-2); // Go back twice if editing
      } else {
        navigate(-1); // Normal back
      }
    }
  }, [hasUnsavedChanges, navigate]);

  // Custom navigation handler for any link
  const handleNavigate = useCallback((to: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(to);
      setShowUnsavedChangesDialog(true);
    } else {
      navigate(to);
    }
  }, [hasUnsavedChanges, navigate]);

  // Function to confirm navigation after saving or discarding changes
  const confirmNavigation = useCallback(() => {
    setShowUnsavedChangesDialog(false);
    if (pendingNavigation === '-1') {
      if (isEditing) {
        navigate(-2); // Go back twice if editing
      } else {
        navigate(-1); // Normal back
      }
    } else if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setPendingNavigation(null);
  }, [navigate, pendingNavigation]);

  // Mark form as having unsaved changes when inputs change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string | boolean | EventType | TaskType | EventCategory } }
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Helper function for direct value changes
  const handleDirectChange = (name: string, value: string | boolean | EventType | TaskType | EventCategory) => {
    handleInputChange({ target: { name, value } });
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
    
    // Generate a temporary unique ID for new rules
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const rule: Rule = {
      id: tempId, // Assign a temporary ID for tracking
      title: newRule.title.trim(),
      text: newRule.text.trim(),
    };
    
    console.log('Adding new rule:', rule);
    
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, rule]
    }));
    setNewRule({ title: '', text: '' });
    setHasUnsavedChanges(true);
  };

  const handleRemoveRule = async (id: string) => {
    console.log('Removing rule with ID:', id);
    if (!id) {
      console.error('Attempted to remove rule without ID');
      return;
    }
    
    // If it's a server rule (not a temp ID) and we're in edit mode
    if (isEditing && challengeId && !id.startsWith('temp_')) {
      try {
        // Call the API to remove the rule
        await removeRuleApi({
          challengeId,
          ruleId: id
        });
        
        toast({
          title: 'Success',
          description: 'Rule removed successfully',
        });
        
        // The rule will be removed from our local state when the query is invalidated
        // and the challenge data is refreshed
      } catch (error) {
        console.error('Failed to remove rule:', error);
        toast({
          title: 'Error',
          description: 'Failed to remove rule',
          variant: 'destructive',
        });
      }
    }
    
    // For client-side only or if the API call fails, update the local state
    setFormData(prev => {
      // Check if we have the rule before attempting removal
      const ruleExists = prev.rules.some(r => r.id === id);
      if (!ruleExists) {
        console.error('Rule not found for removal:', id);
        return prev;
      }
      
      setHasUnsavedChanges(true);
      return {
        ...prev,
        rules: prev.rules.filter(rule => rule.id !== id)
      };
    });
  };

  // Drag and drop functionality for rules
  const moveRule = (dragIndex: number, hoverIndex: number) => {
    const draggedRule = formData.rules[dragIndex];
    const newRules = [...formData.rules];
    newRules.splice(dragIndex, 1);
    newRules.splice(hoverIndex, 0, draggedRule);
    setFormData(prev => ({ ...prev, rules: newRules }));
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
          onClick={() => rule.id && onRemove(rule.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    );
  };

  const handleSaveDraft = async () => {
    const isValid = validateForm();
    if (!isValid) {
      // Create a more detailed error message
      const errorFields = Object.keys(formErrors);
      const errorMessages = errorFields.map(field => {
        const fieldName = field.replace(/_/g, ' ');
        return `${fieldName}: ${formErrors[field]}`;
      });
      
      toast({
        title: 'Missing Required Fields',
        description: `Please fill in all required fields before saving.`,
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Map the form rules to match the API expected format
      const mappedRules = formData.rules.map(rule => ({
        ...(rule.id ? { rule_id: rule.id } : {}),  // ✅ only include for existing rules
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
        // Include the ID and challenge_reward_id if we're editing an existing challenge
        ...(challengeId && { 
          id: challengeId,
          challenge_reward_id: challenge?.challenge?.challenge_reward_id || undefined
        }),
      };
      
      // Format reward data based on the reward configuration using our serialization utility
      let challengeReward: ChallengeRewardUpdate | undefined;
      if (formData.reward_configuration) {
        const serializedReward = serializeRewardForAPI(formData.reward_configuration);
        
        challengeReward = {
          // Only include id if we're editing an existing challenge
          ...(challengeId && challenge?.challenge?.challenge_reward_id && { id: challenge.challenge.challenge_reward_id }),
          reward_type: serializedReward.reward_type,
          reward_distribution_type: serializedReward.reward_distribution_type,
          reward_value: serializedReward.reward_value
        };
      }

      // Prepare data structure to send to the backend
      const dataToSave: ChallengeSaveRequest = {
        challenge_data: challengeData,
        challenge_rules: mappedRules,
        ...(challengeReward && { challenge_reward: challengeReward })
      };
      
      const result = await saveChallenge(dataToSave);
      
      // After successful save, clear the unsaved changes flag
      setHasUnsavedChanges(false);
      
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
        
        // Navigate to edit page with the new challenge ID as a query parameter
        if (result && result.challenge && result.challenge.id) {
          navigate(`/user/create-challenge?id=${result.challenge.id}`);
        }
      }
      
      // If we were about to navigate away, now we can safely do so
      if (pendingNavigation) {
        confirmNavigation();
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
    const isValid = validateForm();
    if (!isValid) {
      setPublishDialogOpen(false);
      
      // Create a more detailed error message
      const errorFields = Object.keys(formErrors);
      const errorMessages = errorFields.map(field => {
        const fieldName = field.replace(/_/g, ' ');
        return `${fieldName}: ${formErrors[field]}`;
      });
      
      toast({
        title: 'Missing Required Fields',
        description: `Please fill in all required fields before publishing.`,
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Map the form rules to match the API expected format
      const mappedRules = formData.rules.map(rule => ({
        rule_id: rule.id || "",
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
        // Include the ID and challenge_reward_id if we're editing an existing challenge
        ...(challengeId && { 
          id: challengeId,
          challenge_reward_id: challenge?.challenge?.challenge_reward_id 
        }),
      };
      
      // Format reward data based on the reward configuration using our serialization utility
      let challengeReward: ChallengeRewardUpdate | undefined;
      if (formData.reward_configuration) {
        const serializedReward = serializeRewardForAPI(formData.reward_configuration);
        
        challengeReward = {
          // Only include id if we're editing an existing challenge
          ...(challengeId && challenge?.challenge?.challenge_reward_id && { id: challenge.challenge.challenge_reward_id }),
          reward_type: serializedReward.reward_type,
          reward_distribution_type: serializedReward.reward_distribution_type,
          reward_value: serializedReward.reward_value
        };
      }

      // Prepare data structure to send to the backend
      const dataToSave: ChallengeSaveRequest = {
        challenge_data: challengeData,
        challenge_rules: mappedRules,
        ...(challengeReward && { challenge_reward: challengeReward })
      };
      
      if (isEditing && challengeId) {
        // First save any changes to the existing challenge
        await saveChallenge(dataToSave);
        // Then publish it
        await publishChallenge(challengeId);
        
        toast({
          title: 'Success',
          description: 'Challenge published successfully',
        });
        // Refresh the challenge data
        refreshChallenge();
      } else {
        // Create and save a new challenge first
        const newChallenge = await saveChallenge(dataToSave);
        
        if (newChallenge && newChallenge.challenge && newChallenge.challenge.id) {
          // Then publish it
          await publishChallenge(newChallenge.challenge.id);
          
          toast({
            title: 'Success',
            description: 'Challenge published successfully',
          });
          
          // Navigate to the edit page with the new challenge ID as a query parameter
          navigate(`/user/create-challenge?id=${newChallenge.challenge.id}`);
        }
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
    
    // Always update form data first
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'start_date') {
      // Clear previous error
      setFormErrors(prev => ({ ...prev, start_date: '' }));
      
      // Check if start date is in the past
      if (selectedDate < now) {
        setFormErrors(prev => ({ 
          ...prev, 
          start_date: 'Start date cannot be in the past' 
        }));
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
      }
      
      // Verify end date is after start date
      if (formData.start_date) {
        const startDate = new Date(formData.start_date);
        if (selectedDate <= startDate) {
          setFormErrors(prev => ({ 
            ...prev, 
            end_date: 'End date must be after start date' 
          }));
        }
      }
    }
  };

  // Fix the EventCategory SelectItems
  // Later in the file find and replace these items...

  const eventCategoryItems = (
    <>
      <SelectItem value={EventCategory.COMPETITION}>Competition</SelectItem>
      <SelectItem value={EventCategory.BOUNTY}>Bounty</SelectItem>
    </>
  );

  // Add dialog for unsaved changes
  const UnsavedChangesDialog = () => (
    <Dialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Unsaved Changes</DialogTitle>
          <DialogDescription className="text-base">
            You have unsaved changes. What would you like to do?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              If you leave without saving, your changes will be lost.
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setShowUnsavedChangesDialog(false)}
          >
            Continue Editing
          </Button>
          <Button 
            variant="secondary"
            onClick={() => {
              setHasUnsavedChanges(false);
              confirmNavigation();
            }}
          >
            Discard Changes
          </Button>
          <Button onClick={handleSaveDraft}>
            Save & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-6 hover:bg-accent"
            onClick={handleBackNavigation}
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
                        onChange={(e) => handleInputChange(e)}
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
                        onChange={(e) => handleInputChange(e)}
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
                      Configure the basic settings and parameters for your challenge.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <Separator className="my-2" />
                    
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="challenge_name">Challenge Name *</Label>
                          <Input
                            id="challenge_name"
                            value={formData.challenge_name}
                            onChange={(e) => handleInputChange(e)}
                            placeholder="Enter challenge name"
                            className={formErrors.challenge_name ? 'border-red-500' : ''}
                          />
                          {formErrors.challenge_name && (
                            <p className="text-sm text-red-500">{formErrors.challenge_name}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="language">Language *</Label>
                          <Select
                            value={formData.language_id}
                            onValueChange={(value) => handleDirectChange('language_id', value)}
                          >
                            <SelectTrigger className={formErrors.language_id ? 'border-red-500' : ''}>
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
                            <p className="text-sm text-red-500">{formErrors.language_id}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange(e)}
                          placeholder="Enter challenge description"
                          className={formErrors.description ? 'border-red-500' : ''}
                          rows={4}
                        />
                        {formErrors.description && (
                          <p className="text-sm text-red-500">{formErrors.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Challenge Type */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Challenge Type</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="event_type">Event Type *</Label>
                          <Select
                            value={formData.event_type}
                            onValueChange={(value) => handleDirectChange('event_type', value as EventType)}
                          >
                            <SelectTrigger className={formErrors.event_type ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(EventType).map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type.replace(/_/g, ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formErrors.event_type && (
                            <p className="text-sm text-red-500">{formErrors.event_type}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="task_type">Task Type *</Label>
                          <Select
                            value={formData.task_type}
                            onValueChange={(value) => handleDirectChange('task_type', value as TaskType)}
                          >
                            <SelectTrigger className={formErrors.task_type ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select task type" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(TaskType).map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type.replace(/_/g, ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formErrors.task_type && (
                            <p className="text-sm text-red-500">{formErrors.task_type}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="event_category">Event Category *</Label>
                          <Select
                            value={formData.event_category}
                            onValueChange={(value) => handleDirectChange('event_category', value as EventCategory)}
                          >
                            <SelectTrigger className={formErrors.event_category ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select event category" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(EventCategory).map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category.replace(/_/g, ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formErrors.event_category && (
                            <p className="text-sm text-red-500">{formErrors.event_category}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Dates and Targets */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Dates and Targets</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="start_date">Start Date *</Label>
                          <Input
                            id="start_date"
                            type="datetime-local"
                            name ="start_date"
                            value={formData.start_date}
                            onChange={(e) => handleInputChange(e)}
                            className={formErrors.start_date ? 'border-red-500' : ''}
                          />
                          {formErrors.start_date && (
                            <p className="text-sm text-red-500">{formErrors.start_date}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="end_date">End Date *</Label>
                          <Input
                            id="end_date"
                            name = "end_date"
                            type="datetime-local"
                            value={formData.end_date}
                            onChange={(e) => handleInputChange(e)}
                            className={formErrors.end_date ? 'border-red-500' : ''}
                          />
                          {formErrors.end_date && (
                            <p className="text-sm text-red-500">{formErrors.end_date}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="target_contribution_count">Target Contributions</Label>
                          <Input
                            id="target_contribution_count"
                            type="number"
                            value={formData.target_contribution_count}
                            onChange={(e) => handleDirectChange('target_contribution_count', e.target.value)}
                            placeholder="Enter target number"
                            className={formErrors.target_contribution_count ? 'border-red-500' : ''}
                          />
                          {formErrors.target_contribution_count && (
                            <p className="text-sm text-red-500">{formErrors.target_contribution_count}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Visibility */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Visibility</h3>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_public"
                          checked={formData.is_public}
                          onCheckedChange={(checked) => handleDirectChange('is_public', checked)}
                        />
                        <Label htmlFor="is_public">Make this challenge public</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Public challenges are visible to all users. Private challenges are only visible to users you invite.
                      </p>
                    </div>
                    
                    {/* Rewards Configuration */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Rewards Configuration</h3>
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
                        isPublished={isEditing && challenge?.challenge?.is_published}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="rules" className="mt-6">
                <Card className="border border-border/50">
                  <CardHeader>
                    <CardTitle className="text-2xl">Rules & Criteria</CardTitle>
                    <CardDescription className="text-base">
                      Define the rules and criteria for your challenge.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <Separator className="my-2" />
                    
                    {/* Rules List */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Challenge Rules</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addRule}
                          disabled={loading}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Rule
                        </Button>
                      </div>
                      
                      {/* New Rule Form */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                        <div className="space-y-2">
                          <Label htmlFor="new_rule_title">Rule Title</Label>
                          <Input
                            id="new_rule_title"
                            value={newRule.title}
                            onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                            placeholder="Enter rule title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new_rule_text">Rule Description</Label>
                          <Input
                            id="new_rule_text"
                            value={newRule.text}
                            onChange={(e) => setNewRule({ ...newRule, text: e.target.value })}
                            placeholder="Enter rule description"
                          />
                        </div>
                      </div>
                      
                      {/* Rules List */}
                      <div className="space-y-4">
                        {formData.rules.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No rules added yet. Click "Add Rule" to create your first rule.</p>
                          </div>
                        ) : (
                          <DndProvider backend={HTML5Backend}>
                            <div className="space-y-2">
                              {formData.rules.map((rule, index) => (
                                <DraggableRule
                                  key={rule.id}
                                  rule={rule}
                                  index={index}
                                  moveRule={moveRule}
                                  onRemove={handleRemoveRule}
                                />
                              ))}
                            </div>
                          </DndProvider>
                        )}
                      </div>
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
      
      {/* Add the unsaved changes dialog */}
      <UnsavedChangesDialog />
    </div>
  );
} 