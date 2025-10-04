import { useState, useEffect } from "react";
import { RefreshCw, Search, UserCheck, UserX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

export default function TransferLearners() {
  const { toast } = useToast();
  const { profile } = useProfile();
  const [searchUPI, setSearchUPI] = useState("");
  const [transferData, setTransferData] = useState({
    transferType: "",
    targetInstitution: "",
    reason: "",
    effectiveDate: "",
    notes: "",
  });
  const [foundLearner, setFoundLearner] = useState<any>(null);

  const handleSearch = async () => {
    if (!searchUPI.trim()) {
      toast({
        title: "Enter UPI",
        description: "Please enter a UPI to search for a learner",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.institution_id) {
      toast({
        title: "Error",
        description: "Institution not found",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: ecde, error: ecdeError } = await supabase
        .from('learners')
        .select('*')
        .eq('upi', searchUPI)
        .eq('institution_id', profile.institution_id)
        .single();

      if (ecde) {
        setFoundLearner({
          id: ecde.id,
          upi: ecde.upi,
          firstName: ecde.first_name,
          lastName: ecde.last_name,
          gender: ecde.gender,
          program: 'ECDE',
          admissionDate: ecde.admission_date || ecde.created_at,
          status: ecde.status,
          type: 'learner'
        });
        return;
      }

      const { data: vocational, error: vocationalError } = await supabase
        .from('students')
        .select('*')
        .eq('upi', searchUPI)
        .eq('institution_id', profile.institution_id)
        .single();

      if (vocational) {
        setFoundLearner({
          id: vocational.id,
          upi: vocational.upi,
          firstName: vocational.first_name,
          lastName: vocational.last_name,
          gender: vocational.gender,
          program: 'Vocational',
          admissionDate: vocational.admission_date || vocational.created_at,
          status: vocational.status,
          type: 'student'
        });
        return;
      }

      toast({
        title: "Not Found",
        description: "No learner found with that UPI",
        variant: "destructive",
      });
    } catch (error: any) {
      console.error('Error searching learner:', error);
      toast({
        title: "Error",
        description: "Failed to search for learner",
        variant: "destructive",
      });
    }
  };

  const handleTransfer = async (type: string) => {
    if (!foundLearner) {
      toast({
        title: "No Learner Selected",
        description: "Please search and select a learner first",
        variant: "destructive",
      });
      return;
    }

    try {
      const table = foundLearner.type === 'learner' ? 'learners' : 'students';
      const newStatus = type === 'receive' ? 'enrolled' : 'transferred';

      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq('id', foundLearner.id);

      if (error) throw error;

      toast({
        title: `${type === 'receive' ? 'Learner Received' : 'Learner Released'}`,
        description: `${foundLearner.firstName} ${foundLearner.lastName} has been ${type === 'receive' ? 'received into' : 'released from'} this institution.`,
      });

      setFoundLearner(null);
      setSearchUPI("");
      setTransferData({
        transferType: "",
        targetInstitution: "",
        reason: "",
        effectiveDate: "",
        notes: "",
      });
    } catch (error: any) {
      console.error('Error transferring learner:', error);
      toast({
        title: "Error",
        description: "Failed to transfer learner",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <RefreshCw className="h-8 w-8 text-primary" />
          Receive / Release Learners
        </h1>
        <p className="text-muted-foreground">
          Manage learner transfers between institutions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Search Learner
            </CardTitle>
            <CardDescription>
              Enter the learner's UPI to find their records
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="searchUPI">Learner UPI</Label>
                <Input
                  id="searchUPI"
                  placeholder="Enter UPI (e.g., UPI-123456-ABC123)"
                  value={searchUPI}
                  onChange={(e) => setSearchUPI(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} className="bg-primary hover:bg-primary-hover">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {foundLearner && (
              <Card className="bg-primary-light border-primary">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-primary mb-2">Learner Found</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{foundLearner.firstName} {foundLearner.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">UPI:</span>
                      <span className="font-mono">{foundLearner.upi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Program:</span>
                      <Badge variant="secondary">{foundLearner.program}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline" className="status-active">{foundLearner.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Transfer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Transfer Details</CardTitle>
            <CardDescription>
              Provide details for the transfer process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transferType">Transfer Type</Label>
              <Select onValueChange={(value) => setTransferData(prev => ({ ...prev, transferType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select transfer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receive">Receive Learner</SelectItem>
                  <SelectItem value="release">Release Learner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetInstitution">
                {transferData.transferType === 'receive' ? 'Previous Institution' : 'Target Institution'}
              </Label>
              <Input
                id="targetInstitution"
                placeholder="Enter institution name"
                value={transferData.targetInstitution}
                onChange={(e) => setTransferData(prev => ({ ...prev, targetInstitution: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Effective Date</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={transferData.effectiveDate}
                onChange={(e) => setTransferData(prev => ({ ...prev, effectiveDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Transfer</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for transfer"
                value={transferData.reason}
                onChange={(e) => setTransferData(prev => ({ ...prev, reason: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes or comments"
                value={transferData.notes}
                onChange={(e) => setTransferData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {foundLearner && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => handleTransfer('receive')}
                className="bg-gradient-secondary hover:opacity-90"
                size="lg"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Receive Learner
              </Button>
              <Button 
                onClick={() => handleTransfer('release')}
                variant="outline"
                size="lg"
                className="border-warning text-warning hover:bg-warning hover:text-warning-foreground"
              >
                <UserX className="h-4 w-4 mr-2" />
                Release Learner
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
