import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import {
  RewardType,
  DistributionMethod,
  RewardConfiguration,
} from "@/types/rewards";

// Utility function to convert API reward data to RewardConfiguration
export const parseRewardFromAPI = (apiReward: any): RewardConfiguration => {
  if (!apiReward) {
    return {
      reward_type: RewardType.CASH,
      distribution_method: DistributionMethod.FIXED,
      amount: 0,
      currency: 'USD',
    };
  }

  // Extract reward type and distribution type
  const reward_type = apiReward.reward_type as RewardType || RewardType.CASH;
  const distribution_method = apiReward.reward_distribution_type as DistributionMethod || DistributionMethod.FIXED;
  
  // Parse reward value from string if needed
  let reward_value: any = apiReward.reward_value;
  if (typeof reward_value === 'string') {
    try {
      reward_value = JSON.parse(reward_value);
    } catch (e) {
      console.error('Failed to parse reward value string:', e);
      reward_value = {};
    }
  }

  // Default configuration
  const config: RewardConfiguration = {
    reward_type,
    distribution_method,
  };

  // Add additional fields based on reward type and distribution method
  if (reward_type === RewardType.CASH) {
    if (distribution_method === DistributionMethod.FIXED || distribution_method === DistributionMethod.PERCENTAGE) {
      config.amount = reward_value?.amount || 0;
      config.currency = reward_value?.currency || 'USD';
    } else if (distribution_method === DistributionMethod.TIERED && reward_value) {
      config.currency = Object.values(reward_value)[0]?.currency || 'USD';
      
      // Extract tiers from reward_value structure
      const tiers = Object.keys(reward_value).map(key => {
        const tierData = reward_value[key];
        const rank = parseInt(key.replace('tier_', '')) || 1;
        return {
          rank,
          label: `${rank}${rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th'} Place`,
          amount: tierData.amount || 0,
          threshold: 0,
        };
      }).sort((a, b) => a.rank - b.rank);
      
      config.tiers = tiers.length > 0 ? tiers : undefined;
    }
  } else if (reward_type === RewardType.BADGE) {
    if (distribution_method === DistributionMethod.FIXED) {
      config.badge_name = reward_value?.name || '';
      config.badge_description = reward_value?.description || '';
      config.badge_icon = reward_value?.icon || '';
    } else if (distribution_method === DistributionMethod.TIERED && reward_value) {
      const tiers = Object.keys(reward_value).map(key => {
        const tierData = reward_value[key];
        const rank = parseInt(key.replace('tier_', '')) || 1;
        return {
          rank,
          label: tierData.name || `${rank}${rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th'} Place Badge`,
          description: tierData.description || '',
          amount: 0,
          threshold: 0,
        };
      }).sort((a, b) => a.rank - b.rank);
      
      config.tiers = tiers.length > 0 ? tiers : undefined;
      config.badge_icon = reward_value?.icon || '';
    }
  } else if (reward_type === RewardType.SWAG) {
    if (distribution_method === DistributionMethod.FIXED) {
      config.swag_item = reward_value?.item || '';
      config.swag_description = reward_value?.description || '';
      config.coupon_code = reward_value?.coupon_code || '';
    } else if (distribution_method === DistributionMethod.TIERED && reward_value) {
      const tiers = Object.keys(reward_value).map(key => {
        const tierData = reward_value[key];
        const rank = parseInt(key.replace('tier_', '')) || 1;
        return {
          rank,
          label: tierData.item || `${rank}${rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th'} Place SWAG`,
          description: tierData.description || '',
          amount: 0,
          threshold: 0,
        };
      }).sort((a, b) => a.rank - b.rank);
      
      config.tiers = tiers.length > 0 ? tiers : undefined;
    }
  }

  return config;
};

// Utility function to convert RewardConfiguration to API format
export const serializeRewardForAPI = (config: RewardConfiguration) => {
  const { reward_type, distribution_method } = config;
  
  // Base reward object
  const reward = {
    reward_type,
    reward_distribution_type: distribution_method,
  };
  
  // Build reward_value based on reward type and distribution method
  let reward_value: Record<string, any> = {};
  
  if (reward_type === RewardType.CASH) {
    if (distribution_method === DistributionMethod.FIXED || distribution_method === DistributionMethod.PERCENTAGE) {
      reward_value = {
        amount: config.amount || 0,
        currency: config.currency || 'USD'
      };
    } else if (distribution_method === DistributionMethod.TIERED && config.tiers?.length) {
      // Structure tiered rewards as key-value pairs
      config.tiers.forEach((tier, index) => {
        reward_value[`tier_${tier.rank}`] = {
          rank: tier.rank,
          amount: tier.amount,
          currency: config.currency || 'USD'
        };
      });
    }
  } else if (reward_type === RewardType.BADGE) {
    if (distribution_method === DistributionMethod.FIXED) {
      reward_value = {
        name: config.badge_name || '',
        description: config.badge_description || '',
        icon: config.badge_icon || ''
      };
    } else if (distribution_method === DistributionMethod.TIERED && config.tiers?.length) {
      // Add common badge properties
      if (config.badge_icon) {
        reward_value.icon = config.badge_icon;
      }
      
      // Add tier-specific badge properties
      config.tiers.forEach((tier) => {
        reward_value[`tier_${tier.rank}`] = {
          rank: tier.rank,
          name: tier.label || '',
          description: tier.description || ''
        };
      });
    }
  } else if (reward_type === RewardType.SWAG) {
    if (distribution_method === DistributionMethod.FIXED) {
      reward_value = {
        item: config.swag_item || '',
        description: config.swag_description || '',
        coupon_code: config.coupon_code || ''
      };
    } else if (distribution_method === DistributionMethod.TIERED && config.tiers?.length) {
      // Structure tiered swag rewards
      config.tiers.forEach((tier) => {
        reward_value[`tier_${tier.rank}`] = {
          rank: tier.rank,
          item: tier.label || '',
          description: tier.description || ''
        };
      });
    }
  }
  
  return {
    ...reward,
    reward_value
  };
};

export const RewardsTab = ({
  rewardConfig,
  onChange,
  isLoading,
  isPublished = false,
}: {
  rewardConfig: RewardConfiguration;
  onChange: (config: RewardConfiguration) => void;
  isLoading: boolean;
  isPublished?: boolean;
}) => {
  // Combine isLoading and isPublished to determine if the form should be disabled
  const isDisabled = isLoading || isPublished;
  
  return (
    <div className="space-y-6">
      {isPublished && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-800 rounded-md p-4 mb-4">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-400">Published Challenge</h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
            Rewards cannot be modified for published challenges.
          </p>
        </div>
      )}
      
      <TypeSelector
        selectedType={rewardConfig.reward_type}
        onChange={(type) => {
          // Reset method when type changes
          onChange({
            ...rewardConfig,
            reward_type: type,
            distribution_method: DistributionMethod.FIXED,
            // Reset specific fields
            amount: type === RewardType.CASH ? 0 : undefined,
            badge_name: type === RewardType.BADGE ? "" : undefined,
            badge_icon: type === RewardType.BADGE ? "" : undefined,
            swag_item: type === RewardType.SWAG ? "" : undefined,
          });
        }}
        disabled={isDisabled}
      />

      <Separator />

      <MethodSelector
        selectedMethod={rewardConfig.distribution_method}
        rewardType={rewardConfig.reward_type}
        onChange={(method) => {
          onChange({
            ...rewardConfig,
            distribution_method: method,
            // Reset tiers if switching to/from tiered
            tiers:
              method === DistributionMethod.TIERED
                ? rewardConfig.tiers || [
                    { rank: 1, label: "1st Place", amount: 0, threshold: 0 },
                    { rank: 2, label: "2nd Place", amount: 0, threshold: 0 },
                    { rank: 3, label: "3rd Place", amount: 0, threshold: 0 },
                  ]
                : undefined,
          });
        }}
        disabled={isDisabled}
      />

      <Separator />

      <ConfigurationForm
        config={rewardConfig}
        onChange={onChange}
        disabled={isDisabled}
      />

      <Separator />

      <LivePreview config={rewardConfig} />
    </div>
  );
};

const TypeSelector = ({
  selectedType,
  onChange,
  disabled,
}: {
  selectedType: RewardType;
  onChange: (type: RewardType) => void;
  disabled?: boolean;
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Reward Type</h3>
      <p className="text-sm text-muted-foreground">
        Select the type of reward you want to offer for this challenge
      </p>

      <RadioGroup
        value={selectedType}
        onValueChange={(value) => onChange(value as RewardType)}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        disabled={disabled}
      >
        <div className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-accent">
          <RadioGroupItem value={RewardType.CASH} id="cash" />
          <Label htmlFor="cash" className="flex-1">
            <div className="font-medium">Cash Rewards</div>
            <div className="text-muted-foreground text-sm">
              Monetary incentives for participation
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-accent">
          <RadioGroupItem value={RewardType.BADGE} id="badge" />
          <Label htmlFor="badge" className="flex-1">
            <div className="font-medium">Achievement Badges</div>
            <div className="text-muted-foreground text-sm">
              Digital recognition on profile
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-accent">
          <RadioGroupItem value={RewardType.SWAG} id="swag" />
          <Label htmlFor="swag" className="flex-1">
            <div className="font-medium">SWAG Items</div>
            <div className="text-muted-foreground text-sm">
              Physical Coupon rewards
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

const MethodSelector = ({
  selectedMethod,
  rewardType,
  onChange,
  disabled,
}: {
  selectedMethod: DistributionMethod;
  rewardType: RewardType;
  onChange: (method: DistributionMethod) => void;
  disabled?: boolean;
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Distribution Method</h3>
      <p className="text-sm text-muted-foreground">
        How should rewards be distributed to participants?
      </p>

      <RadioGroup
        value={selectedMethod}
        onValueChange={(value) => onChange(value as DistributionMethod)}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        disabled={disabled}
      >
        <div className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-accent">
          <RadioGroupItem value={DistributionMethod.FIXED} id="fixed" />
          <Label htmlFor="fixed" className="flex-1">
            <div className="font-medium">Fixed Amount</div>
            <div className="text-muted-foreground text-sm">
              Same reward for all qualifying participants
            </div>
          </Label>
        </div>

        {/* <div className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-accent">
          <RadioGroupItem value={DistributionMethod.PERCENTAGE} id="percentage" />
          <Label htmlFor="percentage" className="flex-1">
            <div className="font-medium">Percentage Based</div>
            <div className="text-muted-foreground text-sm">Based on or percentage</div>
          </Label>
        </div> */}

        <div className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-accent">
          <RadioGroupItem value={DistributionMethod.TIERED} id="tiered" />
          <Label htmlFor="tiered" className="flex-1">
            <div className="font-medium">Tiered Rewards</div>
            <div className="text-muted-foreground text-sm">
              Different rewards based on ranking
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

const ConfigurationForm = ({
  config,
  onChange,
  disabled,
}: {
  config: RewardConfiguration;
  onChange: (config: RewardConfiguration) => void;
  disabled?: boolean;
}) => {
  const renderCashConfig = () => {
    if (config.distribution_method === DistributionMethod.FIXED) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="flex">
              <div className="flex items-center px-3 rounded-l-md border border-r-0 bg-muted">
                {config.currency || "USD"}
              </div>
              <Input
                type="number"
                min={0}
                value={config.amount || 0}
                onChange={(e) =>
                  onChange({
                    ...config,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="rounded-l-none"
                disabled={disabled}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select
              value={config.currency || "USD"}
              onValueChange={(value) =>
                onChange({
                  ...config,
                  currency: value,
                })
              }
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="GHS">GH Cedi (GH)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    } else if (config.distribution_method === DistributionMethod.TIERED) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={config.currency || "USD"}
                onValueChange={(value) =>
                  onChange({
                    ...config,
                    currency: value,
                  })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GHS">GH Cedi (GH)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <h4 className="text-base font-medium mt-4">Reward Tiers</h4>
          <p className="text-sm text-muted-foreground">
            Define rewards for each tier
          </p>

          <div className="space-y-4">
            {(config.tiers || []).map((tier, index) => (
              <div
                key={tier.rank}
                className="grid grid-cols-2 gap-4 p-4 border rounded-md"
              >
                <div className="space-y-2">
                  <Label>Rank {tier.rank} Label</Label>
                  <Input
                    value={tier.label}
                    onChange={(e) => {
                      const newTiers = [...(config.tiers || [])];
                      newTiers[index] = { ...tier, label: e.target.value };
                      onChange({ ...config, tiers: newTiers });
                    }}
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 rounded-l-md border border-r-0 bg-muted">
                      {config.currency || "USD"}
                    </div>
                    <Input
                      type="number"
                      min={0}
                      value={tier.amount || 0}
                      onChange={(e) => {
                        const newTiers = [...(config.tiers || [])];
                        newTiers[index] = {
                          ...tier,
                          amount: parseFloat(e.target.value) || 0,
                        };
                        onChange({ ...config, tiers: newTiers });
                      }}
                      className="rounded-l-none"
                      disabled={disabled}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const newTiers = [...(config.tiers || [])];
                const nextRank = newTiers.length + 1;
                newTiers.push({
                  rank: nextRank,
                  label: `${nextRank}${
                    nextRank === 1
                      ? "st"
                      : nextRank === 2
                      ? "nd"
                      : nextRank === 3
                      ? "rd"
                      : "th"
                  } Place`,
                  amount: 0,
                  threshold: 0,
                });
                onChange({ ...config, tiers: newTiers });
              }}
              disabled={disabled || (config.tiers?.length || 0) >= 10}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Tier
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderBadgeConfig = () => {
    if (config.distribution_method === DistributionMethod.FIXED) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Badge Name</Label>
              <Input
                value={config.badge_name || ""}
                onChange={(e) =>
                  onChange({
                    ...config,
                    badge_name: e.target.value,
                  })
                }
                disabled={disabled}
              />
            </div>
            {/* <div className="space-y-2">
              <Label>Badge Image URL (Optional)</Label>
              <Input
                value={config.badge_image || ''}
                onChange={(e) => onChange({
                  ...config,
                  badge_image: e.target.value,
                })}
                disabled={disabled}
              />
            </div> */}
          </div>

          <div className="space-y-2">
            <Label>Badge Description</Label>
            <Textarea
              value={config.badge_description || ""}
              onChange={(e) =>
                onChange({
                  ...config,
                  badge_description: e.target.value,
                })
              }
              className="min-h-[100px] resize-none"
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label>Badge Icon (optional)</Label>
            <Select
              value={config.badge_icon || ""}
              onValueChange={(value) =>
                onChange({
                  ...config,
                  badge_icon: value,
                })
              }
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select icon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="⭐">Star ⭐</SelectItem>
                <SelectItem value="🏆">Trophy 🏆</SelectItem>
                <SelectItem value="🔥">Fire 🔥</SelectItem>
                <SelectItem value="🎖️">Medal 🎖️</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    } else if (config.distribution_method === DistributionMethod.TIERED) {
      return (
        <div className="space-y-4">
          <h4 className="text-base font-medium">Badge Tiers</h4>
          <p className="text-sm text-muted-foreground">
            Define badges for each tier
          </p>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 md:gap-4">
            <p className="text-sm text-muted-foreground">
              Define badges for each tier
            </p>

            <div className="space-y-1 w-full md:w-auto">
              <Label className="text-sm">Badge Icon (optional)</Label>
              <Select
                value={config.badge_icon || ""}
                onValueChange={(value) =>
                  onChange({
                    ...config,
                    badge_icon: value,
                  })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="⭐">Star ⭐</SelectItem>
                  <SelectItem value="🏆">Trophy 🏆</SelectItem>
                  <SelectItem value="🔥">Fire 🔥</SelectItem>
                  <SelectItem value="🎖️">Medal 🎖️</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {(config.tiers || []).map((tier, index) => (
              <div
                key={tier.rank}
                className="grid grid-cols-1 gap-4 p-4 border rounded-md"
              >
                <div className="font-medium">
                  Rank {tier.rank}: {tier.label}
                </div>
                <div className="space-y-2">
                  <Label>Badge Name</Label>
                  <Input
                    value={tier.label}
                    onChange={(e) => {
                      const newTiers = [...(config.tiers || [])];
                      newTiers[index] = { ...tier, label: e.target.value };
                      onChange({ ...config, tiers: newTiers });
                    }}
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Badge Description</Label>
                  <Textarea
                    value={tier.description || ""}
                    onChange={(e) => {
                      const newTiers = [...(config.tiers || [])];
                      newTiers[index] = {
                        ...tier,
                        description: e.target.value,
                      };
                      onChange({ ...config, tiers: newTiers });
                    }}
                    className="min-h-[60px] resize-none"
                    disabled={disabled}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const newTiers = [...(config.tiers || [])];
                const nextRank = newTiers.length + 1;
                newTiers.push({
                  rank: nextRank,
                  label: `${nextRank}${
                    nextRank === 1
                      ? "st"
                      : nextRank === 2
                      ? "nd"
                      : nextRank === 3
                      ? "rd"
                      : "th"
                  } Place Badge`,
                  amount: 0,
                  threshold: 0,
                });
                onChange({ ...config, tiers: newTiers });
              }}
              disabled={disabled || (config.tiers?.length || 0) >= 5}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Badge Tier
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderSwagConfig = () => {
    if (config.distribution_method === DistributionMethod.FIXED) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SWAG Item</Label>
              <Input
                value={config.swag_item || ""}
                onChange={(e) =>
                  onChange({
                    ...config,
                    swag_item: e.target.value,
                  })
                }
                disabled={disabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>SWAG Description</Label>
            <Textarea
              value={config.swag_description || ""}
              onChange={(e) =>
                onChange({
                  ...config,
                  swag_description: e.target.value,
                })
              }
              className="min-h-[100px] resize-none"
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label>Coupon Code</Label>
            <Input
              value={config.coupon_code || ""}
              onChange={(e) =>
                onChange({
                  ...config,
                  coupon_code: e.target.value,
                })
              }
              disabled={disabled}
            />
          </div>
        </div>
      );
    } else if (config.distribution_method === DistributionMethod.TIERED) {
      return (
        <div className="space-y-4">
          <h4 className="text-base font-medium">SWAG Tiers</h4>
          <p className="text-sm text-muted-foreground">
            Define SWAG items for each tier
          </p>

          <div className="space-y-4">
            {(config.tiers || []).map((tier, index) => (
              <div
                key={tier.rank}
                className="grid grid-cols-1 gap-4 p-4 border rounded-md"
              >
                <div className="font-medium">
                  Rank {tier.rank}: {tier.label}
                </div>
                <div className="space-y-2">
                  <Label>SWAG Item</Label>
                  <Input
                    value={tier.label}
                    onChange={(e) => {
                      const newTiers = [...(config.tiers || [])];
                      newTiers[index] = { ...tier, label: e.target.value };
                      onChange({ ...config, tiers: newTiers });
                    }}
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={tier.description || ""}
                    onChange={(e) => {
                      const newTiers = [...(config.tiers || [])];
                      newTiers[index] = {
                        ...tier,
                        description: e.target.value,
                      };
                      onChange({ ...config, tiers: newTiers });
                    }}
                    className="min-h-[60px] resize-none"
                    disabled={disabled}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const newTiers = [...(config.tiers || [])];
                const nextRank = newTiers.length + 1;
                newTiers.push({
                  rank: nextRank,
                  label: `${nextRank}${
                    nextRank === 1
                      ? "st"
                      : nextRank === 2
                      ? "nd"
                      : nextRank === 3
                      ? "rd"
                      : "th"
                  } Place SWAG`,
                  amount: 0,
                  threshold: 0,
                });
                onChange({ ...config, tiers: newTiers });
              }}
              disabled={disabled || (config.tiers?.length || 0) >= 5}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add SWAG Tier
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Configure Rewards</h3>
      <p className="text-sm text-muted-foreground">
        Set up the details for your {config.reward_type} rewards
      </p>

      {config.reward_type === RewardType.CASH && renderCashConfig()}
      {config.reward_type === RewardType.BADGE && renderBadgeConfig()}
      {config.reward_type === RewardType.SWAG && renderSwagConfig()}
    </div>
  );
};

const LivePreview = ({ config }: { config: RewardConfiguration }) => {
  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return "";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: config.currency || "GHs",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const renderCashPreview = () => {
    if (config.distribution_method === DistributionMethod.FIXED) {
      return (
        <div className="flex items-center justify-between p-4 bg-accent/50 rounded-md">
          <div>
            <div className="font-medium">Fixed Cash Reward</div>
            <div className="text-sm text-muted-foreground">
              All qualifying participants receive the same amount
            </div>
          </div>
          <div className="text-xl font-bold">
            {formatCurrency(config.amount)}
          </div>
        </div>
      );
    } else if (config.distribution_method === DistributionMethod.PERCENTAGE) {
      return (
        <div className="flex items-center justify-between p-4 bg-accent/50 rounded-md">
          <div>
            <div className="font-medium">Percentage-Based Pool</div>
            <div className="text-sm text-muted-foreground">
              Rewards based on contribution percentage
            </div>
          </div>
          <div className="text-xl font-bold">
            {formatCurrency(config.amount)} Total
          </div>
        </div>
      );
    } else if (config.distribution_method === DistributionMethod.TIERED) {
      return (
        <div className="space-y-3">
          {(config.tiers || []).map((tier) => (
            <div
              key={tier.rank}
              className="flex items-center justify-between p-3 bg-accent/50 rounded-md"
            >
              <div className="font-medium">{tier.label}</div>
              <div className="font-bold">{formatCurrency(tier.amount)}</div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  const renderBadgePreview = () => {
    if (config.distribution_method === DistributionMethod.FIXED) {
      return (
        <div className="p-4 bg-accent/50 rounded-md space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">
              {config.badge_icon}
              {config.badge_name || "Challenge Badge"}
            </div>
            <Badge variant="secondary">Badge</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {config.badge_description || "Awarded for completing the challenge"}
          </div>
        </div>
      );
    } else if (config.distribution_method === DistributionMethod.TIERED) {
      return (
        <div className="space-y-3">
          {(config.tiers || []).map((tier) => (
            <div
              key={tier.rank}
              className="p-3 bg-accent/50 rounded-md space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  {config.badge_icon}
                  {tier.label}
                </div>
                <Badge variant="secondary">Rank {tier.rank}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {tier.description || `Badge for rank ${tier.rank}`}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  const renderSwagPreview = () => {
    if (config.distribution_method === DistributionMethod.FIXED) {
      return (
        <div className="p-4 bg-accent/50 rounded-md space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">{config.swag_item || "SWAG Item"}</div>
            <Badge variant="secondary">SWAG</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {config.swag_description ||
              "Coupons for some GOODIES❤️!!! for challenge participants"}
          </div>
        </div>
      );
    } else if (config.distribution_method === DistributionMethod.TIERED) {
      return (
        <div className="space-y-3">
          {(config.tiers || []).map((tier) => (
            <div
              key={tier.rank}
              className="p-3 bg-accent/50 rounded-md space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{tier.label}</div>
                <Badge variant="secondary">Rank {tier.rank}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {tier.description || `SWAG for rank ${tier.rank}`}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Reward Preview</h3>
      <p className="text-sm text-muted-foreground">
        Here's how your rewards will appear to participants
      </p>

      {config.reward_type === RewardType.CASH && renderCashPreview()}
      {config.reward_type === RewardType.BADGE && renderBadgePreview()}
      {config.reward_type === RewardType.SWAG && renderSwagPreview()}
    </div>
  );
};
