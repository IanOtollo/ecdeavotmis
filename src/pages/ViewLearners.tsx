import { useState } from "react";
import { Eye, Search, Filter, Download, Edit, UserCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ViewLearners() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [learners] = useState([]);

  const filteredLearners = learners.filter(learner => {
    const matchesSearch = 
      learner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.upi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.course.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || learner.type === filterType;
    const matchesStatus = filterStatus === "all" || learner.status.toLowerCase() === filterStatus;
    
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Eye className="h-8 w-8 text-primary" />
            View Learners / Students
          </h1>
          <p className="text-muted-foreground">
            View and manage all registered learners and students in your institution
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
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
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ecde">ECDE Learners</SelectItem>
                <SelectItem value="vocational">Vocational Students</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Learners</p>
                <p className="text-2xl font-bold">{learners.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ECDE Learners</p>
                <p className="text-2xl font-bold">{learners.filter(l => l.type === 'ecde').length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vocational Students</p>
                <p className="text-2xl font-bold">{learners.filter(l => l.type === 'vocational').length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{learners.filter(l => l.status === 'Active').length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Learners & Students Directory</CardTitle>
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
                <TableHead>Personal Details</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Admission</TableHead>
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
                      <p className="text-sm"><strong>Gender:</strong> {learner.gender}</p>
                      <p className="text-sm"><strong>Age:</strong> {calculateAge(learner.dateOfBirth)} years</p>
                      <p className="text-sm text-muted-foreground">
                        DOB: {new Date(learner.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{learner.course}</p>
                      <Badge variant="secondary">{learner.level}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {new Date(learner.admissionDate).toLocaleDateString()}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={learner.status === 'Active' ? 'default' : 
                                   learner.status === 'Graduated' ? 'secondary' : 'outline'}>
                      {learner.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
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