import { useState, useEffect } from "react";
import { Banknote, Building, CreditCard, Save, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

export default function BankAccount() {
  const { toast } = useToast();
  const { profile } = useProfile();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    branchName: "",
    branchCode: "",
    accountType: "",
    swiftCode: "",
    purpose: "operational"
  });

  const [bankAccounts, setBankAccounts] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.institution_id) return;

    const fetchBankAccounts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('bank_accounts')
          .select('*')
          .eq('institution_id', profile.institution_id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBankAccounts(data || []);
      } catch (error: any) {
        console.error('Error fetching bank accounts:', error);
        toast({
          title: "Error",
          description: "Failed to load bank accounts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBankAccounts();
  }, [profile?.institution_id, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.institution_id) {
      toast({
        title: "Error",
        description: "Institution not found",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('bank_accounts')
        .insert({
          institution_id: profile.institution_id,
          bank_name: formData.bankName,
          account_number: formData.accountNumber,
          branch: formData.branchName,
        });

      if (error) throw error;

      toast({
        title: "Bank Account Added",
        description: "New bank account has been successfully added to your institution.",
      });

      setShowForm(false);
      setFormData({
        bankName: "",
        accountNumber: "",
        accountName: "",
        branchName: "",
        branchCode: "",
        accountType: "",
        swiftCode: "",
        purpose: "operational"
      });

      // Refresh list
      const { data } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('institution_id', profile.institution_id)
        .order('created_at', { ascending: false });
      
      setBankAccounts(data || []);
    } catch (error: any) {
      console.error('Error adding bank account:', error);
      toast({
        title: "Error",
        description: "Failed to add bank account",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Banknote className="h-8 w-8 text-primary" />
            Bank Accounts
          </h1>
          <p className="text-muted-foreground">
            Manage your institution's bank accounts for capitation and operational funds
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Bank Account
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Bank Account</CardTitle>
            <CardDescription>Enter the details for the new bank account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Select onValueChange={(value) => handleInputChange("bankName", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kcb">Kenya Commercial Bank</SelectItem>
                      <SelectItem value="equity">Equity Bank</SelectItem>
                      <SelectItem value="coop">Co-operative Bank</SelectItem>
                      <SelectItem value="barclays">Absa Bank Kenya</SelectItem>
                      <SelectItem value="standard">Standard Chartered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                    placeholder="Enter account number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={formData.accountName}
                    onChange={(e) => handleInputChange("accountName", e.target.value)}
                    placeholder="Enter account name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branchName">Branch Name</Label>
                  <Input
                    id="branchName"
                    value={formData.branchName}
                    onChange={(e) => handleInputChange("branchName", e.target.value)}
                    placeholder="Enter branch name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branchCode">Branch Code</Label>
                  <Input
                    id="branchCode"
                    value={formData.branchCode}
                    onChange={(e) => handleInputChange("branchCode", e.target.value)}
                    placeholder="Enter branch code"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type</Label>
                  <Select onValueChange={(value) => handleInputChange("accountType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Account</SelectItem>
                      <SelectItem value="savings">Savings Account</SelectItem>
                      <SelectItem value="fixed">Fixed Deposit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Account Purpose</Label>
                  <Select onValueChange={(value) => handleInputChange("purpose", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="capitation">Capitation</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="payroll">Payroll</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="swiftCode">SWIFT Code (Optional)</Label>
                  <Input
                    id="swiftCode"
                    value={formData.swiftCode}
                    onChange={(e) => handleInputChange("swiftCode", e.target.value)}
                    placeholder="Enter SWIFT code"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Saving..." : "Save Account"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Existing Bank Accounts</CardTitle>
          <CardDescription>All registered bank accounts for your institution</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : bankAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No bank accounts found. Add your first bank account.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bank Details</TableHead>
                  <TableHead>Account Information</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bankAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{account.bank_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {account.branch}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{account.account_number}</p>
                        <p className="text-sm text-muted-foreground">
                          Added: {new Date(account.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}