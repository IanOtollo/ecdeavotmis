import { useState } from "react";
import { BookOpen, Plus, Search, Edit, Trash2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function SchoolBooks() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    level: "",
    subject: "",
    publisher: "",
    yearPublished: "",
    quantity: "",
    unitPrice: "",
    condition: "new"
  });

  const [books] = useState([
    {
      id: 1,
      title: "Mathematics for Early Learners",
      author: "Dr. Jane Smith",
      isbn: "978-9966-123-45-6",
      category: "Textbook",
      level: "ECDE",
      subject: "Mathematics",
      publisher: "Kenya Literature Bureau",
      yearPublished: "2023",
      quantity: 50,
      unitPrice: "KSH 450",
      condition: "New",
      status: "Available"
    },
    {
      id: 2,
      title: "Fundamentals of Electronics",
      author: "Prof. Michael Johnson",
      isbn: "978-9966-234-56-7",
      category: "Technical Manual",
      level: "Vocational",
      subject: "Electronics",
      publisher: "Technical Publishers Kenya",
      yearPublished: "2022",
      quantity: 25,
      unitPrice: "KSH 850",
      condition: "Good",
      status: "Available"
    },
    {
      id: 3,
      title: "Child Development & Psychology",
      author: "Sarah Wilson",
      isbn: "978-9966-345-67-8",
      category: "Reference",
      level: "ECDE",
      subject: "Child Development",
      publisher: "Education Press",
      yearPublished: "2023",
      quantity: 15,
      unitPrice: "KSH 650",
      condition: "New",
      status: "Available"
    }
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Book Added Successfully",
      description: `"${formData.title}" has been added to the school library inventory.`,
    });
    setShowForm(false);
    setFormData({
      title: "",
      author: "",
      isbn: "",
      category: "",
      level: "",
      subject: "",
      publisher: "",
      yearPublished: "",
      quantity: "",
      unitPrice: "",
      condition: "new"
    });
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            School Books
          </h1>
          <p className="text-muted-foreground">
            Manage your institution's book inventory and library resources
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Book
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search books by title, author, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Book Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Book</CardTitle>
            <CardDescription>Enter the details for the new book</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Book Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter book title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => handleInputChange("author", e.target.value)}
                    placeholder="Enter author name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    value={formData.isbn}
                    onChange={(e) => handleInputChange("isbn", e.target.value)}
                    placeholder="Enter ISBN number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="textbook">Textbook</SelectItem>
                      <SelectItem value="reference">Reference Book</SelectItem>
                      <SelectItem value="manual">Technical Manual</SelectItem>
                      <SelectItem value="workbook">Workbook</SelectItem>
                      <SelectItem value="guide">Teacher's Guide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select onValueChange={(value) => handleInputChange("level", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ecde">ECDE</SelectItem>
                      <SelectItem value="vocational">Vocational</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    placeholder="Enter subject"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publisher">Publisher</Label>
                  <Input
                    id="publisher"
                    value={formData.publisher}
                    onChange={(e) => handleInputChange("publisher", e.target.value)}
                    placeholder="Enter publisher name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearPublished">Year Published</Label>
                  <Input
                    id="yearPublished"
                    type="number"
                    value={formData.yearPublished}
                    onChange={(e) => handleInputChange("yearPublished", e.target.value)}
                    placeholder="Enter year"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    placeholder="Enter quantity"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price</Label>
                  <Input
                    id="unitPrice"
                    value={formData.unitPrice}
                    onChange={(e) => handleInputChange("unitPrice", e.target.value)}
                    placeholder="e.g., KSH 500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select onValueChange={(value) => handleInputChange("condition", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Add Book
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Books Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Books Inventory</CardTitle>
          <CardDescription>
            {filteredBooks.length} book(s) found
            {searchTerm && ` for "${searchTerm}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book Details</TableHead>
                <TableHead>Category & Level</TableHead>
                <TableHead>Publisher Info</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{book.title}</p>
                      <p className="text-sm text-muted-foreground">by {book.author}</p>
                      <p className="text-xs text-muted-foreground">ISBN: {book.isbn}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline">{book.category}</Badge>
                      <div className="text-sm">
                        <p><strong>Level:</strong> {book.level}</p>
                        <p><strong>Subject:</strong> {book.subject}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p><strong>Publisher:</strong> {book.publisher}</p>
                      <p><strong>Year:</strong> {book.yearPublished}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">Qty: {book.quantity}</p>
                      <p className="text-sm text-muted-foreground">{book.unitPrice}</p>
                      <Badge variant="secondary" className="mt-1">
                        {book.condition}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
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