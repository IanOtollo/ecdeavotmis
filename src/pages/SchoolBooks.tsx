import { useState, useEffect } from "react";
import { BookOpen, Plus, Search, Edit, Trash2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

export default function SchoolBooks() {
  const { toast } = useToast();
  const { profile } = useProfile();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [books, setBooks] = useState<any[]>([]);
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

  useEffect(() => {
    if (!profile?.institution_id) return;

    const fetchBooks = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('institution_id', profile.institution_id);

        if (error) throw error;

        setBooks(data || []);
      } catch (error: any) {
        console.error('Error fetching books:', error);
        toast({
          title: "Error",
          description: "Failed to load books",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [profile?.institution_id, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile?.institution_id) {
      toast({
        title: "Error",
        description: "Institution not found",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const { data, error } = await supabase
        .from('books')
        .insert({
          institution_id: profile.institution_id,
          title: formData.title,
          author: formData.author,
          isbn: formData.isbn,
          category: formData.category,
          level: formData.level,
          subject: formData.subject,
          publisher: formData.publisher,
          year_published: formData.yearPublished ? parseInt(formData.yearPublished) : null,
          quantity: formData.quantity ? parseInt(formData.quantity) : 0,
          unit_price: formData.unitPrice,
          condition: formData.condition
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Book Added Successfully",
        description: `"${formData.title}" has been added to the school library inventory.`,
      });

      setBooks([...books, data]);
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
    } catch (error: any) {
      console.error('Error adding book:', error);
      toast({
        title: "Error",
        description: "Failed to add book",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading books...</p>
      </div>
    );
  }

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
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
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
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Adding..." : "Add Book"}
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
          {filteredBooks.length > 0 ? (
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
                        {book.isbn && <p className="text-xs text-muted-foreground">ISBN: {book.isbn}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {book.category && <Badge variant="outline">{book.category}</Badge>}
                        <div className="text-sm">
                          {book.level && <p><strong>Level:</strong> {book.level}</p>}
                          {book.subject && <p><strong>Subject:</strong> {book.subject}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {book.publisher && <p><strong>Publisher:</strong> {book.publisher}</p>}
                        {book.year_published && <p><strong>Year:</strong> {book.year_published}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">Qty: {book.quantity}</p>
                        {book.unit_price && <p className="text-sm text-muted-foreground">{book.unit_price}</p>}
                        {book.condition && (
                          <Badge variant="secondary" className="mt-1">
                            {book.condition}
                          </Badge>
                        )}
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
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No books found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
