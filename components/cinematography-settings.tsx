import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const CinematographySettings = ({ settings, onChange }) => {
  const lightingOptions = [
    { value: "natural", label: "Natural" }
  ];
  
  return (
    <div className="space-y-4">
      <div>
        <Label>Lighting</Label>
        <Select value={settings?.lighting} onValueChange={(value) => onChange({ ...settings, lighting: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select lighting" />
          </SelectTrigger>
          <SelectContent>
            {lightingOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}; 