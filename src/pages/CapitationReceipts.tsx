import { useState } from "react";
import { Upload, FileText, Calendar, DollarSign, Save, Download, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function CapitationReceipts() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    receiptNumber: "",
    amount: "",
    receivedDate: "",
    academicYear: "",
    term: "",
    description: "",
    receiptFile: null as File | null
  });

  const [receipts] = useState([
    {
      id: 1,
      receiptNumber: "CAP/2024/001",
      amount: "KSH 450,000",
      receivedDate: "2024-01-15",
      academicYear: "2024",
      term: "Term 1",
      description: "Q1 Capitation for 150 ECDE learners",
      status: "Verified",
      uploadDate: "2024-01-16"
    },
    {
      id: 2,
      receiptNumber: "CAP/2024/002",
      amount: "KSH 300,000",
      receivedDate: "2024-04-10",
      academicYear: "2024",
      term: "Term 2",
      description: "Q2 Capitation for 100 Vocational students",
      status: "Pending",
      uploadDate: "2024-04-11"
    }
  ]);

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.receiptFile) {
      toast({
        title: "Missing Receipt File",
        description: "Please upload the receipt document.",
        variant: "destructive",
      });
      return;
    }

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
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Upload Receipt
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt Details</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Academic Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{receipt.receiptNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        Received: {new Date(receipt.receivedDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded: {new Date(receipt.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{receipt.amount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{receipt.academicYear}</p>
                      <Badge variant="outline">{receipt.term}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={receipt.status === "Verified" ? "default" : "secondary"}>
                      {receipt.status}
                    </Badge>
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
        </CardContent>
      </Card>
    </div>
  );
}
