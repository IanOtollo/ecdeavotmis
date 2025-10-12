import { useState, useEffect } from "react";
import { BarChart3, Calendar, Download, Filter, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

export default function AdmissionReport() {
  const { profile } = useProfile();
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedTerm, setSelectedTerm] = useState("all");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAdmissions: 0,
    ecdeAdmissions: 0,
    vocationalAdmissions: 0,
    maleStudents: 0,
    femaleStudents: 0,
    avgAge: 0
  });
  const [recentAdmissions, setRecentAdmissions] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.institution_id) return;

    const fetchAdmissionData = async () => {
      try {
        setLoading(true);

        // Fetch ECDE learners
        const { data: ecdeLearners, error: ecdeError } = await supabase
          .from('learners')
          .select('*')
          .eq('institution_id', profile.institution_id)
          .eq('status', 'enrolled');

        if (ecdeError) throw ecdeError;

        // Fetch vocational students
        const { data: vocationalStudents, error: vocationalError } = await supabase
          .from('students')
          .select('*')
          .eq('institution_id', profile.institution_id)
          .eq('status', 'enrolled');

        if (vocationalError) throw vocationalError;

        const allAdmissions = [...(ecdeLearners || []), ...(vocationalStudents || [])];
        
        const maleCount = allAdmissions.filter(a => a.gender?.toLowerCase() === 'male').length;
        const femaleCount = allAdmissions.filter(a => a.gender?.toLowerCase() === 'female').length;

        const ages = allAdmissions.map(a => {
          if (!a.dob) return 0;
          const today = new Date();
          const birthDate = new Date(a.dob);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age;
        });
        const avgAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;

        setStats({
          totalAdmissions: allAdmissions.length,
          ecdeAdmissions: (ecdeLearners || []).length,
          vocationalAdmissions: (vocationalStudents || []).length,
          maleStudents: maleCount,
          femaleStudents: femaleCount,
          avgAge: Math.round(avgAge * 10) / 10
        });

        const recent = allAdmissions
          .sort((a, b) => new Date(b.admission_date || b.created_at).getTime() - new Date(a.admission_date || a.created_at).getTime())
          .slice(0, 10)
          .map(a => ({
            id: a.id,
            upi: a.upi,
            name: `${a.first_name} ${a.last_name}`,
            course: 'course' in a ? 'Vocational' : 'ECDE',
            admissionDate: a.admission_date || a.created_at,
            gender: a.gender,
            type: 'course' in a ? 'Vocational' : 'ECDE'
          }));

        setRecentAdmissions(recent);
      } catch (error: any) {
        console.error('Error fetching admission data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmissionData();
  }, [profile?.institution_id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading admission data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            School Admission Report
          </h1>
          <p className="text-muted-foreground">
            Comprehensive admission statistics and trends for your institution
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Academic Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Term/Quarter</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  <SelectItem value="term1">Term 1</SelectItem>
                  <SelectItem value="term2">Term 2</SelectItem>
                  <SelectItem value="term3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Program Type</label>
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  <SelectItem value="ecde">ECDE</SelectItem>
                  <SelectItem value="vocational">Vocational</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button>
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Admissions</p>
                <p className="text-3xl font-bold text-primary">{stats.totalAdmissions}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Current year
                </p>
              </div>
              <Users className="h-12 w-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ECDE Admissions</p>
                <p className="text-3xl font-bold text-blue-600">{stats.ecdeAdmissions}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalAdmissions > 0 ? ((stats.ecdeAdmissions / stats.totalAdmissions) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vocational Admissions</p>
                <p className="text-3xl font-bold text-green-600">{stats.vocationalAdmissions}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalAdmissions > 0 ? ((stats.vocationalAdmissions / stats.totalAdmissions) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Male Students</p>
                <p className="text-2xl font-bold">{stats.maleStudents}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalAdmissions > 0 ? ((stats.maleStudents / stats.totalAdmissions) * 100).toFixed(0) : 0}% of admissions
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">M</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Female Students</p>
                <p className="text-2xl font-bold">{stats.femaleStudents}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalAdmissions > 0 ? ((stats.femaleStudents / stats.totalAdmissions) * 100).toFixed(0) : 0}% of admissions
                </p>
              </div>
              <div className="h-8 w-8 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-pink-600">F</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Age</p>
                <p className="text-2xl font-bold">{stats.avgAge}</p>
                <p className="text-xs text-muted-foreground">years</p>
              </div>
              <Calendar className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Admissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Admissions</CardTitle>
          <CardDescription>Latest students admitted to the institution</CardDescription>
        </CardHeader>
        <CardContent>
          {recentAdmissions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Details</TableHead>
                  <TableHead>Course/Program</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Demographics</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAdmissions.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">UPI: {student.upi}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{student.course}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(student.admissionDate).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{student.gender}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.type === 'ECDE' ? 'default' : 'secondary'}>
                        {student.type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No admission records found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
