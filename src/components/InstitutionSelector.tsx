import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface Institution {
  id: number;
  name: string;
  type: string;
  level: string;
}

interface InstitutionSelectorProps {
  value: number | null;
  onChange: (institutionId: number) => void;
  label?: string;
  required?: boolean;
}

export function InstitutionSelector({ value, onChange, label = "Select Institution", required = true }: InstitutionSelectorProps) {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const { data, error } = await supabase
          .from('institutions')
          .select('id, name, type, level')
          .order('name');

        if (error) throw error;
        setInstitutions(data || []);
      } catch (error) {
        console.error('Error fetching institutions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutions();
  }, []);

  return (
    <div className="space-y-2">
      <Label>{label} {required && "*"}</Label>
      <Select 
        value={value?.toString()} 
        onValueChange={(val) => onChange(parseInt(val))}
        disabled={loading}
      >
        <SelectTrigger>
          <SelectValue placeholder={loading ? "Loading..." : "Choose an institution"} />
        </SelectTrigger>
        <SelectContent className="bg-background border z-50">
          {institutions.map((institution) => (
            <SelectItem key={institution.id} value={institution.id.toString()}>
              {institution.name} ({institution.level})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
