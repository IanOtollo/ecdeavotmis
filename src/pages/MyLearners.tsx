import { useState } from "react";
import { Users, Search, Filter, Download, Eye, Calendar, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MyLearners() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClass, setFilterClass] = useState("all");

  const [myLearners] = useState([
    {
      id: 1,
      upi: "BT001",
      firstName: "John",
      lastName: "Doe",
      otherName: "Michael",
      gender: "Male",
      dateOfBirth: "2015-05-15",
      type: "ecde",
      course: "Early Childhood Development",
      level: "Pre-Unit",
      class: "Pre-Unit A",
      admissionDate: "2024-01-15",
      status: "Active",
      attendance: 95,
      guardianName: "Mary Doe",
      guardianPhone: "+254700000001",
      address: "Busia Town, Plot 123",
      lastSeen: "2024-03-20",
      photo: null
    },
    {
      id: 2,
      upi: "BT002",
      firstName: "Jane",
      lastName: "Smith",
      otherName: "",
      gender: "Female",
      dateOfBirth: "2002-08-22",
      type: "vocational",
      course: "Electrical Technology",
      level: "Certificate Level 2",
      class: "Electrical Yr2",
      admissionDate: "2024-02-01",
      status: "Active",
      attendance: 88,
      guardianName: "Robert Smith",
      guardianPhone: "+254700000002",
      address: "Malaba Township",
      lastSeen: "2024-03-19",
      photo: null
    },
    {
      id: 3,
      upi: "BT003",
      firstName: "Peter",
      lastName: "Johnson",
      otherName: "Paul",
      gender: "Male",
      dateOfBirth: "2016-03-10",
      type: "ecde",
      course: "Early Childhood Development",
      level: "Baby Class",
      class: "Baby Class B",
      admissionDate: "2024-01-20",
      status: "Active",
      attendance: 92,
      guardianName: "Susan Johnson",
      guardianPhone: "+254700000003",
      address: "Nangina Market Area",
      lastSeen: "2024-03-20",
      photo: null
    },
    {
      id: 4,
      upi: "BT004",
      firstName: "Mary",
      lastName: "Wilson",
      otherName: "Grace",
      gender: "Female",
      dateOfBirth: "2003-11-05",
      type: "vocational",
      course: "Fashion Design & Textile",
      level: "Diploma Year 1",
      class: "Fashion Yr1",
      admissionDate: "2024-01-10",
      status: "Completed",
      attendance: 97,
      guardianName: "David Wilson",
      guardianPhone: "+254700000004",
      address: "Busia Central",
      lastSeen: "2024-03-15",
      photo: null
    }
  ]);

  const filteredLearners = myLearners.filter(learner => {
    const matchesSearch = 
      learner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.upi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.course.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || learner.type === filterType;
    const matchesStatus = filterStatus === "all" || learner.status.toLowerCase() === filterStatus;
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

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 95) return "text-green-600";
    if (attendance >= 85) return "text-yellow-600";
    return "text-red-600";
  };

  // Summary statistics
  const totalLearners = myLearners.length;
  const activeLearners = myLearners.filter(l => l.status === "Active").length;
  const ecdeLearners = myLearners.filter(l => l.type === "ecde").length;
  const vocationalLearners = myLearners.filter(l => l.type === "vocational").length;
  const averageAttendance = Math.round(myLearners.reduce((sum, l) => sum + l.attendance, 0) / totalLearners);

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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{averageAttendance}%</p>
              <p className="text-sm text-muted-foreground">Avg Attendance</p>
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger>
                <SelectValue placeholder="Class/Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="pre-unit">Pre-Unit</SelectItem>
                <SelectItem value="baby">Baby Class</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Info</TableHead>
                <TableHead>Program & Class</TableHead>
                <TableHead>Personal Details</TableHead>
                <TableHead>Guardian Info</TableHead>
                <TableHead>Performance</TableHead>
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
                        <MapPin className="h-3 w-3" />
                        <span>{learner.address}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{learner.guardianName}</p>
                      <p className="text-sm text-muted-foreground">{learner.guardianPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className={`text-sm font-medium ${getAttendanceColor(learner.attendance)}`}>
                        {learner.attendance}% Attendance
                      </p>
                      <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                        <div 
                          className="h-2 bg-primary rounded-full" 
                          style={{ width: `${learner.attendance}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Last seen: {new Date(learner.lastSeen).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={learner.status === 'Active' ? 'default' : 'secondary'}>
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
        </CardContent>
      </Card>
    </div>
  );
}