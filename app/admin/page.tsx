"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/app/contexts/AuthContext"

// Mock data
const recentUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", date: "2024-02-15", status: "active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", date: "2024-02-14", status: "active" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", date: "2024-02-14", status: "pending" },
]

const tickets = [
  { id: "T-1001", user: "John Doe", subject: "Workout Plan Issue", status: "open", priority: "high" },
  { id: "T-1002", user: "Jane Smith", subject: "Nutrition Tracking Bug", status: "in-progress", priority: "medium" },
  { id: "T-1003", user: "Mike Johnson", subject: "Account Access", status: "closed", priority: "low" },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  
  // Get admin's name
  const adminName = user?.fullName || "Admin"

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome, {adminName}!</h2>
          <p className="text-muted-foreground">Here's what's happening in your system today.</p>
        </div>
      </div>

      {/* User Statistics & System Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground">+180 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,890</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45ms</div>
            <p className="text-xs text-muted-foreground">Average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* System Performance Metrics */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>Server metrics over the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {/* Placeholder for SystemMetrics component */}
            <div className="h-80 w-full bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">System Metrics Chart</p>
            </div>
          </CardContent>
        </Card>

        {/* Active Users Tracking */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>Real-time user activity</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for UserActivity component */}
            <div className="h-80 w-full bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">User Activity Chart</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Registrations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Registrations</CardTitle>
          <CardDescription>Latest user registrations in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>#{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.date}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "success" : "warning"}>{user.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Support Tickets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Recent support requests from users</CardDescription>
            </div>
            <Button>View All Tickets</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>{ticket.id}</TableCell>
                    <TableCell>{ticket.user}</TableCell>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          ticket.status === "open"
                            ? "destructive"
                            : ticket.status === "in-progress"
                              ? "warning"
                              : "success"
                        }
                      >
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          ticket.priority === "high"
                            ? "destructive"
                            : ticket.priority === "medium"
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}