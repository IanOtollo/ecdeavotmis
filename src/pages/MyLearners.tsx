import { useState, useEffect } from "react";
import { Users, Search, Filter, Download, Eye, Calendar, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

export default function MyLearners() {
  const { profile } = useProfile();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClass, setFilterClass] = useState("all");
  const [loading, setLoading] = useState(true);
  const [myLearners, setMyLearners] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.institution_id) return;

    const fetchLearners = async () => {
      try {
        setLoading(true);

        const { data: ecdeLearners, error: ecdeError } = await supabase
          .from('learners')
          .select('*')
          .eq('institution_id', profile.institution_id)
          .eq('deceased', false);

        if (ecdeError) throw ecdeError;

        const { data: vocationalStudents, error: vocationalError } = await supabase
          .from('students')
          .select('*')
          .eq('institution_id', profile.institution_id)
          .eq('deceased', false);

        if (vocationalError) throw vocationalError;

        const learners = [
          ...(ecdeLearners || []).map(l => ({
            id: l.id,
            upi: l.upi,
            firstName: l.first_name,
            lastName: l.last_name,
            otherName: l.other_name,
            gender: l.gender,
            dateOfBirth: l.dob,
            type: 'ecde',
            course: 'Early Childhood Development',
            level: 'ECDE',
            class: 'ECDE',
            admissionDate: l.admission_date || l.created_at,
            status: l.status,
            photo: l.photo
          })),
          ...(vocationalStudents || []).map(s => ({
            id: s.id,
            upi: s.upi,
            firstName: s.first_name,
            lastName: s.last_name,
            otherName: s.other_name,
            gender: s.gender,
            dateOfBirth: s.dob,
            type: 'vocational',
            course: 'Vocational Training',
            level: 'Technical',
            class: 'Vocational',
            admissionDate: s.admission_date || s.created_at,
            status: s.status,
            photo: s.photo
          }))
        ];

        setMyLearners(learners);
      } catch (error: any) {
        console.error('Error fetching learners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLearners();
  }, [profile?.institution_id]);

  const filteredLearners = myLearners.filter(learner => {
    const matchesSearch = 
      learner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.upi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.course.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || learner.type === filterType;
    const matchesStatus = filterStatus === "all" || learner.status?.toLowerCase() === filterStatus;
    const matchesClass = filterClass === "all" || learner.class.toLowerCase().includes(filterClass.toLowerCase());
    
    return matchesSearch && matchesType && matchesStatus && matchesClass;
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

  const totalLearners = myLearners.length;
  const activeLearners = myLearners.filter(l => l.status === "enrolled").length;
  const ecdeLearners = myLearners.filter(l => l.type === "ecde").length;
  const vocationalLearners = myLearners.filter(l => l.type === "vocational").length;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading learners...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            My Learners
          </h1>
          <p className="text-muted-foreground">
            Comprehensive overview of all learners under your supervision
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export List
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{totalLearners}</p>
              <p className="text-sm text-muted-foreground">Total Learners</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{activeLearners}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{ecdeLearners}</p>
              <p className="text-sm text-muted-foreground">ECDE</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{vocationalLearners}</p>
              <p className="text-sm text-muted-foreground">Vocational</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search learners..."
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
                <SelectItem value="graduated">Completed</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger>
                <SelectValue placeholder="Class/Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="ecde">ECDE</SelectItem>
                <SelectItem value="vocational">Vocational</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Learners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Learner Directory</CardTitle>
          <CardDescription>
            {filteredLearners.length} learner(s) found
            {searchTerm && ` for "${searchTerm}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLearners.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Info</TableHead>
                  <TableHead>Program & Class</TableHead>
                  <TableHead>Personal Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLearners.map((learner) => (
                  <TableRow key={learner.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={learner.photo || ""} />
                          <AvatarFallback>{getInitials(learner.firstName, learner.lastName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {learner.firstName} {learner.lastName}
                            {learner.otherName && ` ${learner.otherName}`}
                          </p>
                          <p className="text-sm text-muted-foreground">UPI: {learner.upi}</p>
                          <Badge variant="outline" className="mt-1">
                            {learner.type === 'ecde' ? 'ECDE' : 'Vocational'}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{learner.course}</p>
                        <p className="text-sm text-muted-foreground">{learner.level}</p>
                        <Badge variant="secondary" className="mt-1">
                          {learner.class}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm"><strong>Age:</strong> {calculateAge(learner.dateOfBirth)} years</p>
                        <p className="text-sm"><strong>Gender:</strong> {learner.gender}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>Admitted: {new Date(learner.admissionDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={learner.status === 'enrolled' ? 'default' : 'secondary'}>
                        {learner.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No learners found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
