import { useState, useEffect } from "react";
import { Upload, FileText, Calendar, DollarSign, Save, Download, Eye } from "lucide-react";
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

export default function CapitationReceipts() {
  const { toast } = useToast();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    receiptNumber: "",
    amount: "",
    receivedDate: "",
    academicYear: "",
    term: "",
    description: "",
    receiptFile: null as File | null
  });

  const [receipts, setReceipts] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.institution_id) return;

    const fetchReceipts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('capitation_receipts')
          .select('*')
          .eq('institution_id', profile.institution_id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReceipts(data || []);
      } catch (error: any) {
        console.error('Error fetching receipts:', error);
        toast({
          title: "Error",
          description: "Failed to load receipts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, [profile?.institution_id, toast]);

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.receiptFile) {
      toast({
        title: "Missing Receipt File",
        description: "Please upload the receipt document.",
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
      setIsSubmitting(true);

      // Upload file to storage
      const fileExt = formData.receiptFile.name.split('.').pop();
      const fileName = `${profile.institution_id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, formData.receiptFile);

      if (uploadError) throw uploadError;

      // Save receipt record
      const { error: insertError } = await supabase
        .from('capitation_receipts')
        .insert({
          institution_id: profile.institution_id,
          receipt_no: formData.receiptNumber,
          amount: parseFloat(formData.amount),
          date_received: formData.receivedDate,
          file_path: fileName,
        });

      if (insertError) throw insertError;

      toast({
        title: "Receipt Uploaded Successfully",
        description: `Capitation receipt ${formData.receiptNumber} has been uploaded for verification.`,
      });

      setFormData({
        receiptNumber: "",
        amount: "",
        receivedDate: "",
        academicYear: "",
        term: "",
        description: "",
        receiptFile: null
      });

      // Refresh list
      const { data } = await supabase
        .from('capitation_receipts')
        .select('*')
        .eq('institution_id', profile.institution_id)
        .order('created_at', { ascending: false });
      
      setReceipts(data || []);
    } catch (error: any) {
      console.error('Error uploading receipt:', error);
      toast({
        title: "Error",
        description: "Failed to upload receipt",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Upload className="h-8 w-8 text-primary" />
          Upload Capitation Receipts
        </h1>
        <p className="text-muted-foreground">
          Upload and manage capitation fund receipts for your institution
        </p>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New Receipt</CardTitle>
          <CardDescription>
            Upload official capitation fund receipts received from the government
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receiptNumber">Receipt Number</Label>
                <Input
                  id="receiptNumber"
                  value={formData.receiptNumber}
                  onChange={(e) => handleInputChange("receiptNumber", e.target.value)}
                  placeholder="e.g., CAP/2024/003"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount Received</Label>
                <Input
                  id="amount"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  placeholder="e.g., KSH 500,000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receivedDate">Date Received</Label>
                <Input
                  id="receivedDate"
                  type="date"
                  value={formData.receivedDate}
                  onChange={(e) => handleInputChange("receivedDate", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Select onValueChange={(value) => handleInputChange("academicYear", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="term">Term/Quarter</Label>
                <Select onValueChange={(value) => handleInputChange("term", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Term 1">Term 1</SelectItem>
                    <SelectItem value="Term 2">Term 2</SelectItem>
                    <SelectItem value="Term 3">Term 3</SelectItem>
                    <SelectItem value="Q1">Quarter 1</SelectItem>
                    <SelectItem value="Q2">Quarter 2</SelectItem>
                    <SelectItem value="Q3">Quarter 3</SelectItem>
                    <SelectItem value="Q4">Quarter 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Brief description of the capitation received"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiptFile">Receipt Document</Label>
              <Input
                id="receiptFile"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleInputChange("receiptFile", e.target.files?.[0] || null)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary-hover"
                required
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, JPG, PNG (Max 10MB)
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Uploading..." : "Upload Receipt"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Receipts */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Receipts</CardTitle>
          <CardDescription>All capitation receipts uploaded for your institution</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No receipts found. Upload your first capitation receipt.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt Details</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{receipt.receipt_no}</p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded: {new Date(receipt.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">KES {receipt.amount?.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {receipt.date_received ? new Date(receipt.date_received).toLocaleDateString() : '-'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
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
