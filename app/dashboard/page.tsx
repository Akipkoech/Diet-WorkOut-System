"use client"

import { useState } from "react"
import { Activity, Dumbbell, Apple, Calendar, TrendingUp, Timer, Flame, Plus, ChevronRight, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/app/contexts/AuthContext"

// Mock data for charts
const weightData = [
  { name: "Mon", value: 185 },
  { name: "Tue", value: 184 },
  { name: "Wed", value: 184 },
  { name: "Thu", value: 183 },
  { name: "Fri", value: 183 },
  { name: "Sat", value: 182 },
  { name: "Sun", value: 182 },
]

export default function Dashboard() {
  const [caloriesProgress] = useState(75)
  const [proteinProgress] = useState(85)
  const [workoutProgress] = useState(60)
  const { user } = useAuth()

  // Get user's first name
  const firstName = user?.fullName ? user.fullName.split(' ')[0] : "User"

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {firstName}!</h2>
        <div className="flex items-center space-x-2">
          <Button className="bg-red-500 hover:bg-red-600">
            <Plus className="mr-2 h-4 w-4" /> New Workout
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-red-500 to-red-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">5 Days</div>
            <p className="text-xs text-white/70">+2 days from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Workout</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Leg Day</div>
            <p className="text-xs text-muted-foreground">In 3 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories Today</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,850</div>
            <p className="text-xs text-muted-foreground">of 2,200 goal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">+12% from last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Progress Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Weight Progress</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Today's Goals</CardTitle>
            <CardDescription>Your daily progress overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Flame className="mr-2 h-4 w-4 text-red-500" />
                  Calories
                </div>
                <span>{caloriesProgress}%</span>
              </div>
              <Progress value={caloriesProgress} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Activity className="mr-2 h-4 w-4 text-green-500" />
                  Protein
                </div>
                <span>{proteinProgress}%</span>
              </div>
              <Progress value={proteinProgress} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Dumbbell className="mr-2 h-4 w-4 text-blue-500" />
                  Workouts
                </div>
                <span>{workoutProgress}%</span>
              </div>
              <Progress value={workoutProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Upcoming */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Progress</CardTitle>
            <CardDescription>Your achievements this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <Award className="h-9 w-9 text-yellow-500" />
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">New Personal Best</p>
                  <p className="text-sm text-muted-foreground">Squat: 225 lbs (+10 lbs)</p>
                </div>
                <div className="ml-auto font-medium">Today</div>
              </div>
              <div className="flex items-center">
                <Timer className="h-9 w-9 text-green-500" />
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Workout Streak</p>
                  <p className="text-sm text-muted-foreground">5 days in a row</p>
                </div>
                <div className="ml-auto font-medium">2d ago</div>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-9 w-9 text-blue-500" />
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Weight Goal Progress</p>
                  <p className="text-sm text-muted-foreground">Lost 2 lbs this week</p>
                </div>
                <div className="ml-auto font-medium">3d ago</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Workouts</CardTitle>
            <CardDescription>Your schedule for the week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-red-500" />
                  <span>Leg Day</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-red-500" />
                  <span>Upper Body</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-red-500" />
                  <span>Cardio</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}