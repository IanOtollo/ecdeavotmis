import { useState } from "react";
import { Skull, Search, Calendar, AlertCircle, Save, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export default function DeceasedLearner() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [formData, setFormData] = useState({
    dateOfDeath: "",
    causeOfDeath: "",
    placeOfDeath: "",
    reportedBy: "",
    reporterRelation: "",
    reporterContact: "",
    deathCertificateNumber: "",
    additionalNotes: ""
  });

  // Sample active learners
  const activeLearners = [
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
      guardianName: "Mary Doe",
      guardianPhone: "+254700000001",
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
      level: "Certificate",
      guardianName: "Robert Smith",
      guardianPhone: "+254700000002",
      photo: null
    }
  ];

  // Sample deceased records
  const [deceasedRecords] = useState([
    {
      id: 1,
      upi: "BT010",
      firstName: "Samuel",
      lastName: "Mwangi",
      dateOfDeath: "2024-03-15",
      causeOfDeath: "Illness",
      reportedBy: "Grace Mwangi",
      reporterRelation: "Mother",
      recordedDate: "2024-03-16",
      status: "Verified"
    }
  ]);

  const filteredLearners = activeLearners.filter(learner =>
    learner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    learner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    learner.upi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLearner) {
      toast({
        title: "No Learner Selected",
        description: "Please search and select a learner first.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.dateOfDeath || !formData.causeOfDeath) {
      toast({
        title: "Missing Required Information",
        description: "Please provide date of death and cause of death.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Deceased Record Created",
      description: `Record for ${selectedLearner.firstName} ${selectedLearner.lastName} has been created and marked as deceased.`,
    });

    // Reset form
    setSelectedLearner(null);
    setFormData({
      dateOfDeath: "",
      causeOfDeath: "",
      placeOfDeath: "",
      reportedBy: "",
      reporterRelation: "",
      reporterContact: "",
      deathCertificateNumber: "",
      additionalNotes: ""
    });
    setSearchTerm("");
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Skull className="h-8 w-8 text-red-600" />
          Capture Deceased Learner
        </h1>
        <p className="text-muted-foreground">
          Record and manage information about deceased learners and students
        </p>
        <div className="flex items-center gap-2 mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            This is a sensitive process. Please ensure all information is accurate and verified.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search and Select Learner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Search Active Learner
            </CardTitle>
            <CardDescription>
              Search for the learner who has passed away
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="searchTerm">Search by Name or UPI</Label>
              <Input
                id="searchTerm"
                placeholder="Enter name or UPI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {searchTerm && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Search Results:</p>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredLearners.map((learner) => (
                    <div
                      key={learner.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedLearner?.id === learner.id
                          ? 'border-primary bg-primary-light'
                          : 'border-border hover:bg-muted'
                      }`}
                      onClick={() => setSelectedLearner(learner)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={learner.photo || ""} />
                          <AvatarFallback className="text-xs">
                            {getInitials(learner.firstName, learner.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {learner.firstName} {learner.lastName}
                            {learner.otherName && ` ${learner.otherName}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            UPI: {learner.upi} | {learner.course}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredLearners.length === 0 && (
                    <p className="text-sm text-muted-foreground">No learners found.</p>
                  )}
                </div>
              </div>
            )}

            {selectedLearner && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Selected Learner:</p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedLearner.photo || ""} />
                    <AvatarFallback>
                      {getInitials(selectedLearner.firstName, selectedLearner.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedLearner.firstName} {selectedLearner.lastName}
                      {selectedLearner.otherName && ` ${selectedLearner.otherName}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      UPI: {selectedLearner.upi}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedLearner.course} - {selectedLearner.level}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Death Information Form */}
        <Card>
          <CardHeader>
            <CardTitle>Death Information</CardTitle>
            <CardDescription>
              Provide details about the learner's passing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfDeath">Date of Death *</Label>
                  <Input
                    id="dateOfDeath"
                    type="date"
                    value={formData.dateOfDeath}
                    onChange={(e) => handleInputChange("dateOfDeath", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placeOfDeath">Place of Death</Label>
                  <Input
                    id="placeOfDeath"
                    placeholder="e.g., Busia County Hospital"
                    value={formData.placeOfDeath}
                    onChange={(e) => handleInputChange("placeOfDeath", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="causeOfDeath">Cause of Death *</Label>
                <Select onValueChange={(value) => handleInputChange("causeOfDeath", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cause of death" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="illness">Illness</SelectItem>
                    <SelectItem value="accident">Accident</SelectItem>
                    <SelectItem value="natural">Natural Causes</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportedBy">Reported By</Label>
                  <Input
                    id="reportedBy"
                    placeholder="Name of person reporting"
                    value={formData.reportedBy}
                    onChange={(e) => handleInputChange("reportedBy", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reporterRelation">Relation to Deceased</Label>
                  <Select onValueChange={(value) => handleInputChange("reporterRelation", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="relative">Relative</SelectItem>
                      <SelectItem value="family-friend">Family Friend</SelectItem>
                      <SelectItem value="official">Official/Authority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reporterContact">Reporter Contact</Label>
                  <Input
                    id="reporterContact"
                    placeholder="Phone number or email"
                    value={formData.reporterContact}
                    onChange={(e) => handleInputChange("reporterContact", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deathCertificateNumber">Death Certificate Number</Label>
                  <Input
                    id="deathCertificateNumber"
                    placeholder="Official certificate number"
                    value={formData.deathCertificateNumber}
                    onChange={(e) => handleInputChange("deathCertificateNumber", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  placeholder="Any additional information or circumstances..."
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="destructive">
                  <Save className="h-4 w-4 mr-2" />
                  Record as Deceased
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Deceased Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deceased Records</CardTitle>
          <CardDescription>Recently recorded deceased learners</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Learner Details</TableHead>
                <TableHead>Death Information</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deceasedRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{record.firstName} {record.lastName}</p>
                      <p className="text-sm text-muted-foreground">UPI: {record.upi}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(record.dateOfDeath).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">{record.causeOfDeath}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{record.reportedBy}</p>
                      <p className="text-sm text-muted-foreground">{record.reporterRelation}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{record.status}</Badge>
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