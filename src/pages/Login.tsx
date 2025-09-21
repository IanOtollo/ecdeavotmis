import { useState } from "react";
import { Shield, Building2, User, Lock, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface LoginProps {
  onLogin: (userType: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    institutionCode: "",
  });

  const handleSubmit = (e: React.FormEvent, userType: string) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    if (userType === "institution" && !formData.institutionCode) {
      toast({
        title: "Missing Institution Code",
        description: "Please enter your institution code",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Login Successful",
      description: `Welcome to ECDEAVOTMIS dashboard`,
    });

    onLogin(userType);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">ECDEAVOTMIS</h1>
          <p className="text-muted-foreground">Educational Capacity Development & Advancement</p>
          <p className="text-sm text-muted-foreground">Vocational and Technical Management Information System</p>
        </div>

        {/* Login Forms */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>System Login</CardTitle>
            <CardDescription>
              Access your educational management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="institution" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Institution
                </TabsTrigger>
              </TabsList>

              {/* Admin Login */}
              <TabsContent value="admin">
                <form onSubmit={(e) => handleSubmit(e, "admin")} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-username">Username</Label>
                    <Input
                      id="admin-username"
                      type="text"
                      placeholder="Enter admin username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90">
                    <Lock className="h-4 w-4 mr-2" />
                    Login as Admin
                  </Button>
                </form>
              </TabsContent>

              {/* Institution Login */}
              <TabsContent value="institution">
                <form onSubmit={(e) => handleSubmit(e, "institution")} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="institution-code">Institution Code</Label>
                    <Input
                      id="institution-code"
                      type="text"
                      placeholder="Enter institution code"
                      value={formData.institutionCode}
                      onChange={(e) => handleInputChange("institutionCode", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institution-username">Username</Label>
                    <Input
                      id="institution-username"
                      type="text"
                      placeholder="Enter username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institution-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="institution-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-secondary hover:opacity-90">
                    <Building2 className="h-4 w-4 mr-2" />
                    Login as Institution
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Forgot Password */}
            <div className="mt-6 text-center">
              <Button variant="link" className="text-sm text-muted-foreground hover:text-primary">
                Forgot your password?
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>© 2024 ECDEAVOTMIS. All rights reserved.</p>
          <p>Educational Capacity Development & Advancement System</p>
        </div>
      </div>
    </div>
  );
}