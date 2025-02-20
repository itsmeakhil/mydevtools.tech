import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CronInputProps {
  value: string
  onChange: (value: string) => void
  label: string
  min: number
  max: number
}

export function CronInput({ value, onChange, label, min, max }: CronInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono"
        placeholder="*"
        maxLength={2}
      />
      <span className="text-xs text-muted-foreground">
        ({min}-{max})
      </span>
    </div>
  )
}

