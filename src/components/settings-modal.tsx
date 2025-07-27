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

export interface SettingsConfig {
  fileContentLimit: number;
  translationLimit: number;
  enableTranslation: boolean;
  systemPrompt: string;
}

interface SettingsModalProps {
  settings: SettingsConfig;
  onSettingsChange: (settings: SettingsConfig) => void;
}

const defaultSettings: SettingsConfig = {
  fileContentLimit: 500,
  translationLimit: 500,
  enableTranslation: true,
  systemPrompt: 'You are AIO Travel Itinerary assistant, a helpful AI assistant specialized in travel planning and itinerary creation. Provide detailed, accurate, and helpful travel advice.',
};

export function SettingsModal({ settings, onSettingsChange }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<SettingsConfig>(settings);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    // Validate settings
    if (localSettings.fileContentLimit < 100 || localSettings.fileContentLimit > 10000) {
      toast.error('File content limit must be between 100 and 10,000 characters');
      return;
    }

    if (localSettings.translationLimit < 100 || localSettings.translationLimit > 10000) {
      toast.error('Translation limit must be between 100 and 10,000 characters');
      return;
    }

    if (localSettings.systemPrompt.trim().length < 10) {
      toast.error('System prompt must be at least 10 characters long');
      return;
    }

    onSettingsChange(localSettings);
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
                min="100"
                max="10000"
                value={localSettings.fileContentLimit}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  fileContentLimit: parseInt(e.target.value) || 500
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
                  min="100"
                  max="10000"
                  value={localSettings.translationLimit}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    translationLimit: parseInt(e.target.value) || 500
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