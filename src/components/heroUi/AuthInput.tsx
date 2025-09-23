import { Input } from "@/components/heroUi";
import { LucideIcon } from "lucide-react";

interface AuthInputProps {
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: LucideIcon;
}

const AuthInput = ({ id, type = "text", placeholder, value, onChange, icon: Icon }: AuthInputProps) => {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="pl-10"
        required
      />
    </div>
  );
};

export default AuthInput;
