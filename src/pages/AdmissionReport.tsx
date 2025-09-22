import { useState } from "react";
import { BarChart3, Calendar, Download, Filter, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdmissionReport() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedTerm, setSelectedTerm] = useState("all");
  const [selectedProgram, setSelectedProgram] = useState("all");

  // Sample admission data
  const admissionStats = {
    totalAdmissions: 156,
    ecdeAdmissions: 98,
    vocationalAdmissions: 58,
    maleStudents: 78,
    femaleStudents: 78,
    avgAge: 12.5
  };

  const monthlyAdmissions = [
    { month: "January", ecde: 25, vocational: 15, total: 40 },
    { month: "February", ecde: 20, vocational: 12, total: 32 },
    { month: "March", ecde: 18, vocational: 8, total: 26 },
    { month: "April", ecde: 15, vocational: 10, total: 25 },
    { month: "May", ecde: 12, vocational: 7, total: 19 },
    { month: "June", ecde: 8, vocational: 6, total: 14 }
  ];

  const courseWiseAdmissions = [
    { course: "Early Childhood Development", admissions: 98, percentage: 62.8 },
    { course: "Electrical Technology", admissions: 18, percentage: 11.5 },
    { course: "Mechanical Engineering", admissions: 15, percentage: 9.6 },
    { course: "ICT", admissions: 12, percentage: 7.7 },
    { course: "Fashion Design", admissions: 8, percentage: 5.1 },
    { course: "Catering & Hotel Management", admissions: 5, percentage: 3.2 }
  ];

  const recentAdmissions = [
    {
      id: 1,
      upi: "BT001",
      name: "John Doe Michael",
      course: "Early Childhood Development",
      admissionDate: "2024-01-15",
      gender: "Male",
      age: 6,
      type: "ECDE"
    },
    {
      id: 2,
      upi: "BT002",
      name: "Jane Smith",
      course: "Electrical Technology",
      admissionDate: "2024-02-01",
      gender: "Female",
      age: 19,
      type: "Vocational"
    },
    {
      id: 3,
      upi: "BT003",
      name: "Peter Johnson Paul",
      course: "Early Childhood Development",
      admissionDate: "2024-01-20",
      gender: "Male",
      age: 5,
      type: "ECDE"
    },
    {
      id: 4,
      upi: "BT004",
      name: "Mary Wilson Grace",
      course: "Fashion Design & Textile",
      admissionDate: "2024-01-10",
      gender: "Female",
      age: 20,
      type: "Vocational"
    }
  ];

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
                <p className="text-3xl font-bold text-primary">{admissionStats.totalAdmissions}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from last year
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
                <p className="text-3xl font-bold text-blue-600">{admissionStats.ecdeAdmissions}</p>
                <p className="text-xs text-muted-foreground">
                  {((admissionStats.ecdeAdmissions / admissionStats.totalAdmissions) * 100).toFixed(1)}% of total
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
                <p className="text-3xl font-bold text-green-600">{admissionStats.vocationalAdmissions}</p>
                <p className="text-xs text-muted-foreground">
                  {((admissionStats.vocationalAdmissions / admissionStats.totalAdmissions) * 100).toFixed(1)}% of total
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
                <p className="text-2xl font-bold">{admissionStats.maleStudents}</p>
                <p className="text-xs text-muted-foreground">50% of admissions</p>
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
                <p className="text-2xl font-bold">{admissionStats.femaleStudents}</p>
                <p className="text-xs text-muted-foreground">50% of admissions</p>
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
                <p className="text-2xl font-bold">{admissionStats.avgAge}</p>
                <p className="text-xs text-muted-foreground">years</p>
              </div>
              <Calendar className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Admission Trends</CardTitle>
          <CardDescription>Admission patterns throughout the year</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>ECDE</TableHead>
                <TableHead>Vocational</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyAdmissions.map((month) => (
                <TableRow key={month.month}>
                  <TableCell className="font-medium">{month.month}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-blue-600">
                      {month.ecde}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-green-600">
                      {month.vocational}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{month.total}</span>
                  </TableCell>
                  <TableCell>
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-primary rounded-full" 
                        style={{ width: `${(month.total / 40) * 100}%` }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Course-wise Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Course-wise Admissions</CardTitle>
          <CardDescription>Distribution of students across different courses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course/Program</TableHead>
                <TableHead>Admissions</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Distribution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseWiseAdmissions.map((course) => (
                <TableRow key={course.course}>
                  <TableCell className="font-medium">{course.course}</TableCell>
                  <TableCell>
                    <span className="font-semibold">{course.admissions}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{course.percentage}%</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="w-32 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-primary rounded-full" 
                        style={{ width: `${course.percentage}%` }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Admissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Admissions</CardTitle>
          <CardDescription>Latest students admitted to the institution</CardDescription>
        </CardHeader>
        <CardContent>
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
                      <p className="text-sm">{student.gender}, {student.age} years</p>
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
        </CardContent>
      </Card>
    </div>
  );
}