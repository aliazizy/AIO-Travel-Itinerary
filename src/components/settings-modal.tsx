import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { APP_CONFIG, DEFAULT_SETTINGS, AppSettings, validateSettings } from '@/config/app-config';

export interface SettingsConfig {
  fileContentLimit: number;
  translationLimit: number;
  enableTranslation: boolean;
  enableWebSearch: boolean;
  webSearchResultsLimit: number;
  systemPrompt: string;
}

interface SettingsModalProps {
  settings: SettingsConfig;
  onSettingsChange: (settings: SettingsConfig) => void;
}

const defaultSettings: SettingsConfig = DEFAULT_SETTINGS;

export function SettingsModal({ settings, onSettingsChange }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<SettingsConfig>(settings);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    // Validate settings using the config
    if (localSettings.fileContentLimit < APP_CONFIG.limits.fileContentLimit.min || 
        localSettings.fileContentLimit > APP_CONFIG.limits.fileContentLimit.max) {
      toast.error(`File content limit must be between ${APP_CONFIG.limits.fileContentLimit.min} and ${APP_CONFIG.limits.fileContentLimit.max} characters`);
      return;
    }

    if (localSettings.translationLimit < APP_CONFIG.limits.translationLimit.min || 
        localSettings.translationLimit > APP_CONFIG.limits.translationLimit.max) {
      toast.error(`Translation limit must be between ${APP_CONFIG.limits.translationLimit.min} and ${APP_CONFIG.limits.translationLimit.max} characters`);
      return;
    }

    if (localSettings.systemPrompt.trim().length < APP_CONFIG.limits.systemPrompt.minLength) {
      toast.error(`System prompt must be at least ${APP_CONFIG.limits.systemPrompt.minLength} characters long`);
      return;
    }

    // Use validateSettings to ensure consistency
    const validatedSettings = validateSettings(localSettings);
    onSettingsChange(validatedSettings);
    setIsOpen(false);
    toast.success('Settings saved successfully');
  };

  const handleReset = () => {
    setLocalSettings(defaultSettings);
    toast.info('Settings reset to defaults');
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="w-10 h-10">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Application Settings</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* File Processing Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">File Processing</h3>
            
            <div className="space-y-2">
              <Label htmlFor="fileContentLimit">
                File Content Reading Limit (characters)
              </Label>
              <Input
                id="fileContentLimit"
                type="number"
                min={APP_CONFIG.limits.fileContentLimit.min}
                max={APP_CONFIG.limits.fileContentLimit.max}
                value={localSettings.fileContentLimit}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  fileContentLimit: parseInt(e.target.value) || APP_CONFIG.limits.fileContentLimit.default
                }))}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Maximum number of characters to read from uploaded files. Higher values may slow down processing.
              </p>
            </div>
          </div>

          <Separator />

          {/* Translation Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Translation</h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="enableTranslation"
                checked={localSettings.enableTranslation}
                onCheckedChange={(checked) => setLocalSettings(prev => ({
                  ...prev,
                  enableTranslation: checked
                }))}
              />
              <Label htmlFor="enableTranslation">
                Enable automatic translation to English
              </Label>
            </div>

            {localSettings.enableTranslation && (
              <div className="space-y-2">
                <Label htmlFor="translationLimit">
                  Translation Text Limit (characters)
                </Label>
                <Input
                  id="translationLimit"
                  type="number"
                  min={APP_CONFIG.limits.translationLimit.min}
                  max={APP_CONFIG.limits.translationLimit.max}
                  value={localSettings.translationLimit}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    translationLimit: parseInt(e.target.value) || APP_CONFIG.limits.translationLimit.default
                  }))}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Maximum number of characters to translate. Longer texts will be truncated.
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Web Search Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Web Search</h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="enableWebSearch"
                checked={localSettings.enableWebSearch}
                onCheckedChange={(checked) => setLocalSettings(prev => ({
                  ...prev,
                  enableWebSearch: checked
                }))}
              />
              <Label htmlFor="enableWebSearch">
                Enable web search for AI models
              </Label>
            </div>

            {localSettings.enableWebSearch && (
              <div className="space-y-2">
                <Label htmlFor="webSearchResultsLimit">
                  Web Search Results Limit
                </Label>
                <Input
                  id="webSearchResultsLimit"
                  type="number"
                  min={1}
                  max={10}
                  value={localSettings.webSearchResultsLimit}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    webSearchResultsLimit: parseInt(e.target.value) || 5
                  }))}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Maximum number of web search results to include in AI context (1-10).
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* AI Model Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">AI Model Configuration</h3>
            
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">
                System Prompt
              </Label>
              <Textarea
                id="systemPrompt"
                value={localSettings.systemPrompt}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  systemPrompt: e.target.value
                }))}
                className="min-h-[120px] resize-none"
                placeholder="Enter the system prompt that will be sent to the AI model..."
              />
              <p className="text-sm text-muted-foreground">
                This prompt defines the AI's role and behavior. It will be included with every conversation.
              </p>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Defaults</span>
            </Button>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { defaultSettings };