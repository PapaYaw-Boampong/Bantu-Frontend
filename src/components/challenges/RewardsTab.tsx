import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import {
  RewardType,
   DistributionMethod,
   RewardConfiguration,
  } from "@/types/rewards";


export const RewardsTab = ({
  rewardConfig,
  onChange,
  isLoading,
}: {
  rewardConfig: RewardConfiguration;
  onChange: (config: RewardConfiguration) => void;
  isLoading: boolean;
}) => {
  return (
    <div className="space-y-6">
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
            badge_name: type === RewardType.BADGE ? '' : undefined,
            swag_item: type === RewardType.SWAG ? '' : undefined,
          });
        }}
        disabled={isLoading}
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
            tiers: method === DistributionMethod.TIERED ? 
              rewardConfig.tiers || [
                { rank: 1, label: "1st Place", amount: 0, threshold: 0 },
                { rank: 2, label: "2nd Place", amount: 0, threshold: 0 },
                { rank: 3, label: "3rd Place", amount: 0, threshold: 0 },
              ] : undefined,
          });
        }}
        disabled={isLoading}
      />
      
      <Separator />
      
      <ConfigurationForm 
        config={rewardConfig}
        onChange={onChange}
        disabled={isLoading}
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
            <div className="text-muted-foreground text-sm">Monetary incentives for participation</div>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-accent">
          <RadioGroupItem value={RewardType.BADGE} id="badge" />
          <Label htmlFor="badge" className="flex-1">
            <div className="font-medium">Achievement Badges</div>
            <div className="text-muted-foreground text-sm">Digital recognition on profile</div>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-accent">
          <RadioGroupItem value={RewardType.SWAG} id="swag" />
          <Label htmlFor="swag" className="flex-1">
            <div className="font-medium">SWAG Items</div>
            <div className="text-muted-foreground text-sm">Physical merchandise rewards</div>
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
            <div className="text-muted-foreground text-sm">Same reward for all qualifying participants</div>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-accent">
          <RadioGroupItem value={DistributionMethod.PERCENTAGE} id="percentage" />
          <Label htmlFor="percentage" className="flex-1">
            <div className="font-medium">Percentage Based</div>
            <div className="text-muted-foreground text-sm">Based on contribution percentage</div>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer hover:bg-accent">
          <RadioGroupItem value={DistributionMethod.TIERED} id="tiered" />
          <Label htmlFor="tiered" className="flex-1">
            <div className="font-medium">Tiered Rewards</div>
            <div className="text-muted-foreground text-sm">Different rewards based on ranking</div>
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
                {config.currency || 'USD'}
              </div>
              <Input
                type="number"
                min={0}
                value={config.amount || 0}
                onChange={(e) => onChange({
                  ...config,
                  amount: parseFloat(e.target.value) || 0,
                })}
                className="rounded-l-none"
                disabled={disabled}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select
              value={config.currency || 'USD'}
              onValueChange={(value) => onChange({
                ...config,
                currency: value,
              })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    } else if (config.distribution_method === DistributionMethod.PERCENTAGE) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Total Pool Amount</Label>
            <div className="flex">
              <div className="flex items-center px-3 rounded-l-md border border-r-0 bg-muted">
                {config.currency || 'USD'}
              </div>
              <Input
                type="number"
                min={0}
                value={config.amount || 0}
                onChange={(e) => onChange({
                  ...config,
                  amount: parseFloat(e.target.value) || 0,
                })}
                className="rounded-l-none"
                disabled={disabled}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select
              value={config.currency || 'USD'}
              onValueChange={(value) => onChange({
                ...config,
                currency: value,
              })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
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
                value={config.currency || 'USD'}
                onValueChange={(value) => onChange({
                  ...config,
                  currency: value,
                })}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <h4 className="text-base font-medium mt-4">Reward Tiers</h4>
          <p className="text-sm text-muted-foreground">Define rewards for each tier</p>
          
          <div className="space-y-4">
            {(config.tiers || []).map((tier, index) => (
              <div key={tier.rank} className="grid grid-cols-2 gap-4 p-4 border rounded-md">
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
                      {config.currency || 'USD'}
                    </div>
                    <Input
                      type="number"
                      min={0}
                      value={tier.amount || 0}
                      onChange={(e) => {
                        const newTiers = [...(config.tiers || [])];
                        newTiers[index] = { ...tier, amount: parseFloat(e.target.value) || 0 };
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
                  label: `${nextRank}${nextRank === 1 ? 'st' : nextRank === 2 ? 'nd' : nextRank === 3 ? 'rd' : 'th'} Place`,
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
                value={config.badge_name || ''}
                onChange={(e) => onChange({
                  ...config,
                  badge_name: e.target.value,
                })}
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label>Badge Image URL (Optional)</Label>
              <Input
                value={config.badge_image || ''}
                onChange={(e) => onChange({
                  ...config,
                  badge_image: e.target.value,
                })}
                disabled={disabled}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Badge Description</Label>
            <Textarea
              value={config.badge_description || ''}
              onChange={(e) => onChange({
                ...config,
                badge_description: e.target.value,
              })}
              className="min-h-[100px] resize-none"
              disabled={disabled}
            />
          </div>
        </div>
      );
    } else if (config.distribution_method === DistributionMethod.TIERED) {
      return (
        <div className="space-y-4">
          <h4 className="text-base font-medium">Badge Tiers</h4>
          <p className="text-sm text-muted-foreground">Define badges for each tier</p>
          
          <div className="space-y-4">
            {(config.tiers || []).map((tier, index) => (
              <div key={tier.rank} className="grid grid-cols-1 gap-4 p-4 border rounded-md">
                <div className="font-medium">Rank {tier.rank}: {tier.label}</div>
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
                    value={tier.description || ''}
                    onChange={(e) => {
                      const newTiers = [...(config.tiers || [])];
                      newTiers[index] = { ...tier, description: e.target.value };
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
                  label: `${nextRank}${nextRank === 1 ? 'st' : nextRank === 2 ? 'nd' : nextRank === 3 ? 'rd' : 'th'} Place Badge`,
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
                value={config.swag_item || ''}
                onChange={(e) => onChange({
                  ...config,
                  swag_item: e.target.value,
                })}
                disabled={disabled}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>SWAG Description</Label>
            <Textarea
              value={config.swag_description || ''}
              onChange={(e) => onChange({
                ...config,
                swag_description: e.target.value,
              })}
              className="min-h-[100px] resize-none"
              disabled={disabled}
            />
          </div>
        </div>
      );
    } else if (config.distribution_method === DistributionMethod.TIERED) {
      return (
        <div className="space-y-4">
          <h4 className="text-base font-medium">SWAG Tiers</h4>
          <p className="text-sm text-muted-foreground">Define SWAG items for each tier</p>
          
          <div className="space-y-4">
            {(config.tiers || []).map((tier, index) => (
              <div key={tier.rank} className="grid grid-cols-1 gap-4 p-4 border rounded-md">
                <div className="font-medium">Rank {tier.rank}: {tier.label}</div>
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
                    value={tier.description || ''}
                    onChange={(e) => {
                      const newTiers = [...(config.tiers || [])];
                      newTiers[index] = { ...tier, description: e.target.value };
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
                  label: `${nextRank}${nextRank === 1 ? 'st' : nextRank === 2 ? 'nd' : nextRank === 3 ? 'rd' : 'th'} Place SWAG`,
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

const LivePreview = ({
  config,
}: {
  config: RewardConfiguration;
}) => {
  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: config.currency || 'USD',
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
            <div key={tier.rank} className="flex items-center justify-between p-3 bg-accent/50 rounded-md">
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
            <div className="font-medium">{config.badge_name || 'Challenge Badge'}</div>
            <Badge variant="secondary">Badge</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {config.badge_description || 'Awarded for completing the challenge'}
          </div>
        </div>
      );
    } else if (config.distribution_method === DistributionMethod.TIERED) {
      return (
        <div className="space-y-3">
          {(config.tiers || []).map((tier) => (
            <div key={tier.rank} className="p-3 bg-accent/50 rounded-md space-y-1">
              <div className="flex items-center justify-between">
                <div className="font-medium">{tier.label}</div>
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
            <div className="font-medium">{config.swag_item || 'SWAG Item'}</div>
            <Badge variant="secondary">SWAG</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {config.swag_description || 'Physical reward for challenge participants'}
          </div>
        </div>
      );
    } else if (config.distribution_method === DistributionMethod.TIERED) {
      return (
        <div className="space-y-3">
          {(config.tiers || []).map((tier) => (
            <div key={tier.rank} className="p-3 bg-accent/50 rounded-md space-y-1">
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