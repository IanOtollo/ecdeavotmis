import { useState, useEffect } from "react";
import { Database, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

export default function Infrastructure() {
  const { toast } = useToast();
  const { profile } = useProfile();
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    assetName: "",
    assetType: "",
    classification: "",
    acquisitionYear: "",
    quantity: "",
    estimatedCost: "",
    condition: "",
  });

  const [infrastructure, setInfrastructure] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.institution_id) return;

    const fetchInfrastructure = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('infrastructure')
          .select('*')
          .eq('institution_id', profile.institution_id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setInfrastructure(data || []);
      } catch (error: any) {
        console.error('Error fetching infrastructure:', error);
        toast({
          title: "Error",
          description: "Failed to load infrastructure",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInfrastructure();
  }, [profile?.institution_id, toast]);

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
      const { error } = await supabase
        .from('infrastructure')
        .insert({
          institution_id: profile.institution_id,
          asset_name: formData.assetName,
          asset_type: formData.assetType,
          classification: formData.classification,
          year_of_acquisition: parseInt(formData.acquisitionYear),
          quantity: parseInt(formData.quantity),
          cost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
        });

      if (error) throw error;

      toast({
        title: "Infrastructure Added",
        description: "New infrastructure asset has been successfully recorded.",
      });

      setShowAddForm(false);
      setFormData({
        assetName: "",
        assetType: "",
        classification: "",
        acquisitionYear: "",
        quantity: "",
        estimatedCost: "",
        condition: "",
      });

      // Refresh list
      const { data } = await supabase
        .from('infrastructure')
        .select('*')
        .eq('institution_id', profile.institution_id)
        .order('created_at', { ascending: false });
      
      setInfrastructure(data || []);
    } catch (error: any) {
      console.error('Error adding infrastructure:', error);
      toast({
        title: "Error",
        description: "Failed to add infrastructure",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConditionBadge = (condition: string) => {
    const variants = {
      Excellent: "status-active",
      Good: "status-active", 
      Fair: "status-pending",
      Poor: "status-inactive"
    };
    return variants[condition as keyof typeof variants] || "status-pending";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            Infrastructure Management
          </h1>
          <p className="text-muted-foreground">
            Manage school assets, buildings, equipment and infrastructure
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-primary hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      </div>

      {/* Add Asset Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Infrastructure Asset</CardTitle>
            <CardDescription>
              Record new infrastructure, equipment, or facility assets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assetName">Asset Name *</Label>
                  <Input
                    id="assetName"
                    placeholder="Enter asset name"
                    value={formData.assetName}
                    onChange={(e) => setFormData(prev => ({ ...prev, assetName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assetType">Asset Type *</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, assetType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Building">Building</SelectItem>
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Vehicle">Vehicle</SelectItem>
                      <SelectItem value="Sports">Sports Equipment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="classification">Classification *</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, classification: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select classification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Permanent">Permanent Structure</SelectItem>
                      <SelectItem value="Semi-permanent">Semi-permanent</SelectItem>
                      <SelectItem value="Movable">Movable Asset</SelectItem>
                      <SelectItem value="Technology">Technology Asset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="acquisitionYear">Acquisition Year *</Label>
                  <Input
                    id="acquisitionYear"
                    type="number"
                    min="1990"
                    max="2030"
                    placeholder="e.g., 2024"
                    value={formData.acquisitionYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, acquisitionYear: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="Enter quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedCost">Estimated Cost (KES)</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    placeholder="Enter cost in KES"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="condition">Current Condition *</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary hover:opacity-90" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Asset"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Infrastructure List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Infrastructure Assets</CardTitle>
          <CardDescription>
            Overview of all recorded infrastructure and assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : infrastructure.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No infrastructure assets found. Add your first asset.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {infrastructure.map((asset) => (
                <Card key={asset.id} className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-foreground">{asset.asset_name}</h4>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant="outline">{asset.asset_type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Classification:</span>
                        <span className="font-medium">{asset.classification}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Year:</span>
                        <span className="font-medium">{asset.year_of_acquisition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-medium">{asset.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost:</span>
                        <span className="font-medium">KES {asset.cost ? Number(asset.cost).toLocaleString() : 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}