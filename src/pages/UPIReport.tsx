import { useState, useEffect } from "react";
import { FileBarChart, Search, Download, Filter, QrCode, Copy, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

export default function UPIReport() {
  const { toast } = useToast();
  const { profile } = useProfile();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [copiedUPI, setCopiedUPI] = useState("");
  const [loading, setLoading] = useState(true);
  const [upiRecords, setUpiRecords] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.institution_id) return;

    const fetchUPIRecords = async () => {
      try {
        setLoading(true);

        const { data: ecdeLearners, error: ecdeError } = await supabase
          .from('learners')
          .select('*')
          .eq('institution_id', profile.institution_id);

        if (ecdeError) throw ecdeError;

        const { data: vocationalStudents, error: vocationalError } = await supabase
          .from('students')
          .select('*')
          .eq('institution_id', profile.institution_id);

        if (vocationalError) throw vocationalError;

        const records = [
          ...(ecdeLearners || []).map(l => ({
            id: l.id,
            upi: l.upi,
            firstName: l.first_name,
            lastName: l.last_name,
            otherName: l.other_name,
            gender: l.gender,
            dateOfBirth: l.dob,
            admissionDate: l.admission_date || l.created_at,
            type: 'ecde',
            status: l.status,
            photo: l.photo,
            course: 'ECDE',
            level: 'Early Childhood',
            generatedDate: l.created_at
          })),
          ...(vocationalStudents || []).map(s => ({
            id: s.id,
            upi: s.upi,
            firstName: s.first_name,
            lastName: s.last_name,
            otherName: s.other_name,
            gender: s.gender,
            dateOfBirth: s.dob,
            admissionDate: s.admission_date || s.created_at,
            type: 'vocational',
            status: s.status,
            photo: s.photo,
            course: 'Vocational Training',
            level: 'Technical',
            generatedDate: s.created_at
          }))
        ];

        setUpiRecords(records);
      } catch (error: any) {
        console.error('Error fetching UPI records:', error);
        toast({
          title: "Error",
          description: "Failed to load UPI records",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUPIRecords();
  }, [profile?.institution_id, toast]);

  const filteredRecords = upiRecords.filter(record => {
    const matchesSearch = 
      record.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.upi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.course.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || record.type === filterType;
    const matchesStatus = filterStatus === "all" || record.status?.toLowerCase() === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const copyUPI = async (upi: string) => {
    try {
      await navigator.clipboard.writeText(upi);
      setCopiedUPI(upi);
      toast({
        title: "UPI Copied",
        description: `UPI ${upi} copied to clipboard`,
      });
      setTimeout(() => setCopiedUPI(""), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy UPI to clipboard",
        variant: "destructive",
      });
    }
  };

  const totalUPIs = upiRecords.length;
  const activeUPIs = upiRecords.filter(r => r.status === "enrolled").length;
  const ecdeUPIs = upiRecords.filter(r => r.type === "ecde").length;
  const vocationalUPIs = upiRecords.filter(r => r.type === "vocational").length;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading UPI records...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileBarChart className="h-8 w-8 text-primary" />
            Student UPI Report
          </h1>
          <p className="text-muted-foreground">
            Comprehensive report of all Unique Personal Identifiers (UPIs) issued by your institution
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <QrCode className="h-4 w-4 mr-2" />
            Generate QR Codes
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total UPIs Issued</p>
                <p className="text-3xl font-bold text-primary">{totalUPIs}</p>
              </div>
              <FileBarChart className="h-12 w-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active UPIs</p>
                <p className="text-3xl font-bold text-green-600">{activeUPIs}</p>
                <p className="text-xs text-muted-foreground">
                  {totalUPIs > 0 ? ((activeUPIs / totalUPIs) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ECDE UPIs</p>
                <p className="text-3xl font-bold text-blue-600">{ecdeUPIs}</p>
                <p className="text-xs text-muted-foreground">Early Childhood</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">ECDE</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vocational UPIs</p>
                <p className="text-3xl font-bold text-purple-600">{vocationalUPIs}</p>
                <p className="text-xs text-muted-foreground">Technical Training</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-purple-600">VOC</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, UPI, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Program type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                <SelectItem value="ecde">ECDE</SelectItem>
                <SelectItem value="vocational">Vocational</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="enrolled">Active</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* UPI Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>UPI Registry</CardTitle>
          <CardDescription>
            {filteredRecords.length} UPI record(s) found
            {searchTerm && ` for "${searchTerm}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Information</TableHead>
                  <TableHead>UPI Details</TableHead>
                  <TableHead>Program Information</TableHead>
                  <TableHead>Demographics</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={record.photo || ""} />
                          <AvatarFallback>{getInitials(record.firstName, record.lastName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {record.firstName} {record.lastName}
                            {record.otherName && ` ${record.otherName}`}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-bold text-primary text-lg">{record.upi}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyUPI(record.upi)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedUPI === record.upi ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Admitted: {new Date(record.admissionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{record.course}</p>
                        <p className="text-sm text-muted-foreground">{record.level}</p>
                        <Badge variant="outline" className="mt-1">
                          {record.type === 'ecde' ? 'ECDE' : 'Vocational'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm"><strong>Gender:</strong> {record.gender}</p>
                        <p className="text-sm"><strong>Age:</strong> {calculateAge(record.dateOfBirth)} years</p>
                        <p className="text-sm text-muted-foreground">
                          DOB: {new Date(record.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        record.status === 'enrolled' ? 'default' :
                        record.status === 'transferred' ? 'secondary' :
                        record.status === 'graduated' ? 'outline' : 'destructive'
                      }>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <QrCode className="h-4 w-4" />
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
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No UPI records found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
