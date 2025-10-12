import { useState, useEffect } from "react";
import { Search, Filter, UserSearch, Download, Eye, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

export default function SearchLearners() {
  const { profile } = useProfile();
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: "",
    type: "all",
    gender: "all",
    status: "all",
    course: "all",
    admissionYear: "all",
    ageRange: "all"
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allLearners, setAllLearners] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.institution_id) return;

    const fetchLearners = async () => {
      try {
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
            admissionDate: l.admission_date || l.created_at,
            status: l.status,
            photo: l.photo,
            guardianName: 'Not recorded',
            guardianPhone: 'Not recorded'
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
            admissionDate: s.admission_date || s.created_at,
            status: s.status,
            photo: s.photo,
            guardianName: 'Not recorded',
            guardianPhone: 'Not recorded'
          }))
        ];

        setAllLearners(learners);
      } catch (error: any) {
        console.error('Error fetching learners:', error);
      }
    };

    fetchLearners();
  }, [profile?.institution_id]);

  const handleFilterChange = (field: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const performSearch = () => {
    setIsSearching(true);
    
    setTimeout(() => {
      const filtered = allLearners.filter(learner => {
        const matchesSearch = !searchFilters.searchTerm || 
          learner.firstName.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
          learner.lastName.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
          learner.upi.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
          learner.course.toLowerCase().includes(searchFilters.searchTerm.toLowerCase());
        
        const matchesType = searchFilters.type === "all" || learner.type === searchFilters.type;
        const matchesGender = searchFilters.gender === "all" || learner.gender?.toLowerCase() === searchFilters.gender;
        const matchesStatus = searchFilters.status === "all" || learner.status?.toLowerCase() === searchFilters.status;
        const matchesCourse = searchFilters.course === "all" || learner.course.toLowerCase().includes(searchFilters.course.toLowerCase());
        
        const admissionYear = new Date(learner.admissionDate).getFullYear().toString();
        const matchesYear = searchFilters.admissionYear === "all" || admissionYear === searchFilters.admissionYear;
        
        const age = calculateAge(learner.dateOfBirth);
        let matchesAge = true;
        if (searchFilters.ageRange !== "all") {
          const [min, max] = searchFilters.ageRange.split('-').map(Number);
          matchesAge = age >= min && age <= max;
        }
        
        return matchesSearch && matchesType && matchesGender && matchesStatus && matchesCourse && matchesYear && matchesAge;
      });
      
      setSearchResults(filtered);
      setIsSearching(false);
    }, 500);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <UserSearch className="h-8 w-8 text-primary" />
          Search Learners
        </h1>
        <p className="text-muted-foreground">
          Advanced search and filtering for learners and students
        </p>
      </div>

      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Search Filters
          </CardTitle>
          <CardDescription>
            Use multiple filters to find specific learners or students
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Search */}
          <div className="space-y-2">
            <Label htmlFor="searchTerm">Search Term</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="searchTerm"
                  placeholder="Search by name, UPI, course, or any keyword..."
                  value={searchFilters.searchTerm}
                  onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={performSearch} disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Learner Type</Label>
              <Select value={searchFilters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ecde">ECDE Learners</SelectItem>
                  <SelectItem value="vocational">Vocational Students</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={searchFilters.gender} onValueChange={(value) => handleFilterChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={searchFilters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="enrolled">Active</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Admission Year</Label>
              <Select value={searchFilters.admissionYear} onValueChange={(value) => handleFilterChange("admissionYear", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Age Range</Label>
              <Select value={searchFilters.ageRange} onValueChange={(value) => handleFilterChange("ageRange", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="6-12">6-12 years</SelectItem>
                  <SelectItem value="13-17">13-17 years</SelectItem>
                  <SelectItem value="18-25">18-25 years</SelectItem>
                  <SelectItem value="26-35">26-35 years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={performSearch} disabled={isSearching}>
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? "Searching..." : "Apply Filters"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setSearchFilters({
                searchTerm: "",
                type: "all",
                gender: "all", 
                status: "all",
                course: "all",
                admissionYear: "all",
                ageRange: "all"
              })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>
                  Found {searchResults.length} learner(s) matching your criteria
                </CardDescription>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Info</TableHead>
                  <TableHead>Personal Details</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map((learner) => (
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
                        <p className="text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          Admitted: {new Date(learner.admissionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{learner.status}</Badge>
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
      )}

      {/* No Results */}
      {searchResults.length === 0 && searchFilters.searchTerm && !isSearching && (
        <Card>
          <CardContent className="text-center py-8">
            <UserSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-4">
              No learners found matching your search criteria. Try adjusting your filters.
            </p>
            <Button variant="outline" onClick={() => setSearchFilters({
              searchTerm: "",
              type: "all",
              gender: "all",
              status: "all", 
              course: "all",
              admissionYear: "all",
              ageRange: "all"
            })}>
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
