import { Users, Building2, GraduationCap, FileText, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const stats = [
    {
      title: "Total Learners",
      value: "1,234",
      change: "+12.5%",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary-light",
    },
    {
      title: "Active Students",
      value: "856",
      change: "+8.3%", 
      icon: GraduationCap,
      color: "text-secondary",
      bgColor: "bg-secondary-light",
    },
    {
      title: "Institutions",
      value: "47",
      change: "+2.1%",
      icon: Building2,
      color: "text-accent",
      bgColor: "bg-accent-light",
    },
    {
      title: "Reports Generated",
      value: "289",
      change: "+18.7%",
      icon: FileText,
      color: "text-success",
      bgColor: "bg-success-light",
    },
  ];

  const recentActivities = [
    {
      title: "New learner registration",
      description: "John Doe has been registered in ECDE program",
      time: "2 minutes ago",
      type: "success",
    },
    {
      title: "Institution bio-data updated",
      description: "Sunflower Primary School updated their information",
      time: "15 minutes ago", 
      type: "info",
    },
    {
      title: "Capitation receipt uploaded",
      description: "Monthly capitation receipt submitted by Rainbow Academy",
      time: "1 hour ago",
      type: "success",
    },
    {
      title: "UPI report generated",
      description: "Student UPI report exported for Q3 2024",
      time: "2 hours ago",
      type: "info",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your Educational Capacity Development and Advancement System
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change}
                </Badge>
                <p className="text-xs text-muted-foreground">from last month</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Latest updates and changes in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                <div 
                  className={`h-2 w-2 rounded-full mt-2 ${
                    activity.type === "success" ? "bg-success" : "bg-accent"
                  }`} 
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Frequently used functions for efficient management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <Card className="cursor-pointer card-hover bg-gradient-primary">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-white" />
                    <div>
                      <h4 className="font-semibold text-white">Capture New Learner</h4>
                      <p className="text-xs text-white/80">Register a new student or learner</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer card-hover bg-gradient-secondary">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-white" />
                    <div>
                      <h4 className="font-semibold text-white">Update Institution</h4>
                      <p className="text-xs text-white/80">Modify institution information</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer card-hover bg-card border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-accent" />
                    <div>
                      <h4 className="font-semibold text-foreground">Generate Report</h4>
                      <p className="text-xs text-muted-foreground">Create and export reports</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}