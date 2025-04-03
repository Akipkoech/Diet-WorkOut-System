"use client"

import { useState, useEffect } from "react"
import { Calendar, momentLocalizer, Views } from "react-big-calendar"
import moment from "moment"
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft, Search, Filter, Plus, Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/app/contexts/AuthContext"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import "react-big-calendar/lib/css/react-big-calendar.css"

const localizer = momentLocalizer(moment)

// Types based on your backend data structure
interface Exercise {
  exerciseId: number;
  name: string;
  description: string;
  targetMuscleGroup: string;
  equipment: string;
  difficulty: string;
  workoutType: string;
  videoUrl: string | null;
  imageUrl: string | null;
  caloriesBurnRate: number | null;
  instructions: string;
}

interface WorkoutExercise {
  workoutExerciseId: number;
  sessionId: number;
  exerciseId: number;
  sets: number;
  reps: number;
  restPeriod: number;
  order: number;
  exercise: Exercise;
}

interface Session {
  sessionId: number;
  planId: number;
  dayNumber: number;
  name: string;
  description: string;
  targetMuscleGroups: string;
  duration: number;
  exercises: WorkoutExercise[];
}

interface WorkoutPlan {
  planId: number;
  userId: number;
  name: string;
  description: string;
  goal: string;
  difficulty: string;
  durationWeeks: number;
  isAiGenerated: boolean;
  workoutType: string;
  createdAt: string;
  updatedAt: string;
  sessions: Session[];
}

// Calendar event type
interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Session;
  allDay?: boolean;
}

// Function to deduplicate exercises by ID
const deduplicateExercises = (exercises: Exercise[]): Exercise[] => {
  const uniqueExercises = new Map<number, Exercise>();
  
  // Keep only the first occurrence of each exercise ID
  exercises.forEach(exercise => {
    if (!uniqueExercises.has(exercise.exerciseId)) {
      uniqueExercises.set(exercise.exerciseId, exercise);
    }
  });
  
  return Array.from(uniqueExercises.values());
};

// API function to fetch user's workout plan
const fetchUserWorkoutPlan = async (userId: string | number): Promise<WorkoutPlan[]> => {
  try {
    console.log(`Fetching workout plans for user ID: ${userId}`);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('token');
    
    console.log(`Using API URL: ${API_URL}`);
    console.log(`Token available: ${!!token}`);
    
    const response = await fetch(`${API_URL}/api/workout-plans/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch workout plan data: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`Workout plans received: ${JSON.stringify(data).substring(0, 100)}...`);
    return data;
  } catch (error) {
    console.error('Error in fetchUserWorkoutPlan:', error);
    throw error;
  }
};

// Calendar view types
type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export default function WorkoutsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [initialTimerValue, setInitialTimerValue] = useState(0); // Store the initial rest period for countdown
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedRestPeriod, setSelectedRestPeriod] = useState<number | null>(null); // Track the selected rest period
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Record<string, number>>({});
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarView>("month"); // Default to "month"
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [highlightedDate, setHighlightedDate] = useState(new Date());
  const [showCreateWorkoutModal, setShowCreateWorkoutModal] = useState(false);

  // Timer effect for countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            // Timer reached 0, stop and reset
            setIsTimerRunning(false);
            return initialTimerValue; // Reset to the initial value
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer, initialTimerValue]);

  // Function to set the timer and start countdown
  const handleSetTimer = (seconds: number) => {
    setTimer(seconds);
    setInitialTimerValue(seconds);
    setSelectedRestPeriod(seconds);
    setIsTimerRunning(false); // Pause the timer when setting a new value
  };

  // Function to calculate the progress percentage for the circular progress bar
  const calculateProgress = () => {
    if (initialTimerValue === 0) return 0;
    return (timer / initialTimerValue) * 100;
  };

  // Function to calculate the current day number based on the plan's start date
  const calculateCurrentDayNumber = (createdAt: string): number => {
    const startDate = new Date(createdAt);
    const today = new Date();
    
    startDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const dayNumber = (diffDays % 7) + 1;
    return dayNumber > 0 ? dayNumber : 1;
  };

  // Fetch user workout plans
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    const loadWorkoutData = async () => {
      try {
        setLoading(true);
        setError(null);

        let userId = user?.id ?? user?.userId;
        if (!userId) {
          setError("User ID not available. Please log in again.");
          setLoading(false);
          return;
        }

        console.log("Auth state:", { 
          isAuthenticated, 
          userId: userId, 
          userObject: user,
          userIdType: userId !== null ? typeof userId : 'null'
        });

        const plans = await fetchUserWorkoutPlan(userId);
        console.log(`Received ${plans.length} workout plans`);
        setWorkoutPlans(plans);

        if (plans.length > 0) {
          const mostRecentPlan = plans.reduce((latest, current) =>
            new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest
          );
          console.log(`Selected most recent plan: ${mostRecentPlan.name}`);
          setActivePlan(mostRecentPlan);
          
          // Use the calculated day number based on the plan's start date
          const currentDayNumber = calculateCurrentDayNumber(mostRecentPlan.createdAt);
          console.log(`Calculated current day number: ${currentDayNumber}`);
          
          const todaySession = mostRecentPlan.sessions.find(s => s.dayNumber === currentDayNumber);
          
          if (todaySession) {
            console.log(`Setting today's session (Day ${currentDayNumber}): ${todaySession.name}`);
            setSelectedSession(todaySession);
            setHighlightedDate(new Date());
            setCalendarDate(new Date());
          } else if (mostRecentPlan.sessions.length > 0) {
            console.log(`No session found for Day ${currentDayNumber}, selecting first available session`);
            setSelectedSession(mostRecentPlan.sessions[0]);
            setHighlightedDate(new Date());
            setCalendarDate(new Date());
          }
          
          generateCalendarEvents(mostRecentPlan);
        } else {
          console.log("No workout plans found for this user");
        }
      } catch (err) {
        console.error("Error fetching workout plans:", err);
        setError("Failed to load your workout plans. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadWorkoutData();
  }, [user, isAuthenticated, authLoading]);

  // Generate calendar events for the full workout plan duration
  const generateCalendarEvents = (plan: WorkoutPlan) => {
    const events: CalendarEvent[] = [];
    const startDate = new Date(plan.createdAt);
    startDate.setHours(0, 0, 0, 0); // Reset time part

    // Start from plan creation date
    const totalDays = plan.durationWeeks * 7;

    for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + dayOffset);
      
      // Calculate the day number (1-7) based on offset
      const dayNumber = (dayOffset % 7) + 1;

      // Find session for this day number
      const session = plan.sessions.find(s => s.dayNumber === dayNumber);
      
      if (session) {
        events.push({
          id: session.sessionId + dayOffset,
          title: `${session.name} (${session.duration} min)`,
          start: new Date(currentDate),
          end: new Date(currentDate),
          resource: session,
          allDay: true
        });
      }
    }

    console.log(`Generated ${events.length} calendar events for ${plan.durationWeeks} weeks`);
    setCalendarEvents(events);
  };

  // Handle calendar event selection
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedSession(event.resource);
    setHighlightedDate(new Date(event.start));
  };

  // Get all exercises from all sessions
  const allExercises = activePlan?.sessions.flatMap(session => 
    session.exercises.map(ex => ex.exercise)
  ) || [];
  
  // Filter and deduplicate exercises based on search query
  const filteredExercises = deduplicateExercises(
    allExercises.filter(exercise => 
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.targetMuscleGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.equipment.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Handle exercise completion
  const toggleExerciseCompletion = (exerciseId: number) => {
    setCompletedExercises(prev => {
      const key = exerciseId.toString();
      const workoutExercise = selectedSession?.exercises.find(we => we.exercise.exerciseId === exerciseId);
      if (!workoutExercise) return prev;
      
      const current = prev[key] || 0;
      const maxSets = workoutExercise.sets;
      const next = (current + 1) > maxSets ? 0 : current + 1;
      return { ...prev, [key]: next };
    });
  };

  // Calculate completion percentage
  const getCompletionPercentage = (exerciseId: number) => {
    const workoutExercise = selectedSession?.exercises.find(we => we.exercise.exerciseId === exerciseId);
    if (!workoutExercise) return 0;
    
    const completed = completedExercises[exerciseId.toString()] || 0;
    return (completed / workoutExercise.sets) * 100;
  };

  // Format duration in minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
  };
  
  // Handle calendar navigation
  const handlePreviousClick = () => {
    const newDate = new Date(highlightedDate);
    if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setHighlightedDate(newDate);
    setCalendarDate(newDate);
  };

  const handleNextClick = () => {
    const newDate = new Date(highlightedDate);
    if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setHighlightedDate(newDate);
    setCalendarDate(newDate);
  };

  const handleTodayClick = () => {
    const today = new Date();
    setHighlightedDate(today);
    setCalendarDate(today);

    // Re-select today's session when navigating to today
    if (activePlan) {
      const currentDayNumber = calculateCurrentDayNumber(activePlan.createdAt);
      const todaySession = activePlan.sessions.find(s => s.dayNumber === currentDayNumber);
      if (todaySession) {
        setSelectedSession(todaySession);
      }
    }
  };

  // Get vibrant color for each workout day
  const getWorkoutDayColor = (dayNumber: number) => {
    const colors = [
      '#FF5733', // Bright Orange
      '#4CAF50', // Green
      '#3498DB', // Blue
      '#E91E63', // Pink
      '#9C27B0', // Purple
      '#FFC107', // Amber
      '#00BCD4', // Cyan
    ];
    
    return dayNumber ? colors[(dayNumber - 1) % colors.length] : '#6B7280';
  };
  
  // Get color for muscle group/workout type
  const getMuscleGroupColor = (muscleGroup: string) => {
    const colors: Record<string, string> = {
      hiit_strength: '#4F46E5',
      cardio_core: '#EF4444',
      tabata: '#F59E0B',
      circuit_training: '#10B981',
      endurance: '#0EA5E9',
      active_recovery: '#8B5CF6',
      rest: '#6B7280',
      core: '#EC4899',
    };
    
    const normalizedGroup = muscleGroup.toLowerCase().replace(/\s+/g, '_');
    return colors[normalizedGroup] || '#3B82F6';
  };
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertDescription>
          Please log in to view your workout plans.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workout Plan</h1>
          <p className="text-muted-foreground">
            {activePlan ? (
              <>Managing your <span className="font-medium">{activePlan.name}</span> ({activePlan.durationWeeks} weeks)</>
            ) : (
              <>Manage your personalized workout schedule</>
            )}
          </p>
        </div>
        <Button 
          className="bg-red-500 hover:bg-red-600"
          onClick={() => setShowCreateWorkoutModal(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Workout
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="workout" className="space-y-6">
          <TabsList>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="workout">Today's Workout</TabsTrigger>
            <TabsTrigger value="exercises">Exercise Library</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            {activePlan ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Goal</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="capitalize">{activePlan.goal.replace(/_/g, ' ')}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Difficulty</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="capitalize">{activePlan.difficulty}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="capitalize">{activePlan.workoutType}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Workout Schedule</CardTitle>
                        <CardDescription>{activePlan.description}</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setCalendarView('month')}
                          className={calendarView === 'month' ? 'bg-primary/10' : ''}
                        >
                          Month
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setCalendarView('week')}
                          className={calendarView === 'week' ? 'bg-primary/10' : ''}
                        >
                          Week
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setCalendarView('day')}
                          className={calendarView === 'day' ? 'bg-primary/10' : ''}
                        >
                          Day
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setCalendarView('agenda')}
                          className={calendarView === 'agenda' ? 'bg-primary/10' : ''}
                        >
                          Agenda
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handlePreviousClick}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleTodayClick}
                      >
                        Today
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleNextClick}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    
                    <Calendar
                      localizer={localizer}
                      events={calendarEvents}
                      startAccessor="start"
                      endAccessor="end"
                      onSelectEvent={handleSelectEvent}
                      style={{ height: 500 }}
                      view={calendarView}
                      date={calendarDate}
                      onNavigate={date => setCalendarDate(date)}
                      onView={(view) => setCalendarView(view as CalendarView)}
                      eventPropGetter={(event: CalendarEvent) => {
                        const dayNumber = event.resource.dayNumber;
                        return { 
                          style: { 
                            backgroundColor: getWorkoutDayColor(dayNumber)
                          } 
                        };
                      }}
                      dayPropGetter={date => {
                        if (
                          date.getDate() === highlightedDate.getDate() &&
                          date.getMonth() === highlightedDate.getMonth() &&
                          date.getFullYear() === highlightedDate.getFullYear()
                        ) {
                          return {
                            style: {
                              border: '2px solid #FF5733',
                              borderRadius: '4px'
                            }
                          };
                        }
                        return {};
                      }}
                      formats={{
                        eventTimeRangeFormat: () => '',
                        timeGutterFormat: () => '',
                        dayRangeHeaderFormat: ({ start, end }) => {
                          return `${moment(start).format('MMM D')} – ${moment(end).format('MMM D')}`;
                        }
                      }}
                      components={{
                        event: (props) => (
                          <div>
                            <strong>{props.event.title}</strong>
                          </div>
                        )
                      }}
                    />
                  </CardContent>
                </Card>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {activePlan.sessions.map((session) => {
                    const dayColor = getWorkoutDayColor(session.dayNumber);
                    return (
                      <Card 
                        key={session.sessionId} 
                        className={`cursor-pointer transition-shadow hover:shadow-md ${
                          selectedSession?.sessionId === session.sessionId ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div 
                          className="h-3 rounded-t-lg" 
                          style={{ backgroundColor: dayColor }}
                        ></div>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{session.name}</CardTitle>
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                borderColor: dayColor,
                                color: dayColor
                              }}
                            >
                              Day {session.dayNumber}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs">
                            {session.targetMuscleGroups.replace(/_/g, ' ').split(' ').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex items-center text-sm">
                            <span className="font-medium mr-1">Duration:</span> {formatDuration(session.duration)}
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="font-medium mr-1">Exercises:</span> {session.exercises.length}
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <p className="text-xs text-muted-foreground line-clamp-2">{session.description}</p>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <h3 className="text-xl font-medium mb-2">No workout plan available</h3>
                    <p className="text-muted-foreground mb-6">
                      You don't have any workout plans set up yet.
                    </p>
                    <Button 
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => setShowCreateWorkoutModal(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Create Workout Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="workout" className="space-y-4">
            {selectedSession ? (
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{selectedSession.name}</CardTitle>
                      <Badge 
                        variant="outline" 
                        style={{ 
                          borderColor: getWorkoutDayColor(selectedSession.dayNumber),
                          color: getWorkoutDayColor(selectedSession.dayNumber)
                        }}
                      >
                        Day {selectedSession.dayNumber}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center justify-between">
                      <span>{selectedSession.targetMuscleGroups.replace(/_/g, ' ').split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}</span>
                      <Badge>{formatDuration(selectedSession.duration)}</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedSession.exercises.length > 0 ? (
                      selectedSession.exercises
                        .sort((a, b) => a.order - b.order)
                        .map((workoutExercise) => (
                        <div key={workoutExercise.workoutExerciseId} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{workoutExercise.exercise.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {workoutExercise.sets} sets × {workoutExercise.reps} reps • Rest: {workoutExercise.restPeriod}s
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{workoutExercise.exercise.targetMuscleGroup}</Badge>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <Info className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{workoutExercise.exercise.instructions}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => toggleExerciseCompletion(workoutExercise.exercise.exerciseId)}
                              >
                                {(completedExercises[workoutExercise.exercise.exerciseId.toString()] || 0)}/{workoutExercise.sets}
                              </Button>
                            </div>
                          </div>
                          <Progress 
                            value={getCompletionPercentage(workoutExercise.exercise.exerciseId)} 
                            className="h-2" 
                          />
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground mb-2">No exercises listed for this session yet.</p>
                        <p>{selectedSession.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Rest Timer</CardTitle>
                    <CardDescription>Track your rest periods between sets</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-center">
                      <div className="relative w-32 h-32">
                        <CircularProgressbar
                          value={calculateProgress()}
                          text={`${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, "0")}`}
                          styles={buildStyles({
                            pathColor: timer === 0 ? "#ef4444" : isTimerRunning ? "#22c55e" : "#6b7280",
                            textColor: timer === 0 ? "#ef4444" : isTimerRunning ? "#22c55e" : "#6b7280",
                            trailColor: "#d1d5db",
                            textSize: "20px",
                            pathTransitionDuration: 0.5,
                          })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-center space-x-4">
                      <Button 
                        variant={isTimerRunning ? "default" : "outline"} 
                        size="icon" 
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className={isTimerRunning ? "bg-green-500 hover:bg-green-600" : ""}
                      >
                        {isTimerRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => {
                          setTimer(initialTimerValue);
                          setIsTimerRunning(false);
                        }}
                      >
                        <RotateCcw className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="flex justify-center space-x-2 flex-wrap gap-y-2">
                      {selectedSession.exercises.length > 0 ? (
                        Array.from(new Set(selectedSession.exercises.map(e => e.restPeriod)))
                          .sort((a, b) => a - b)
                          .map((seconds) => (
                            <Button 
                              key={seconds} 
                              variant={selectedRestPeriod === seconds ? "default" : "outline"} 
                              size="sm" 
                              onClick={() => handleSetTimer(seconds)}
                              className={selectedRestPeriod === seconds ? "bg-blue-500 hover:bg-blue-600" : ""}
                            >
                              {seconds}s
                            </Button>
                          ))
                      ) : (
                        [30, 45, 60, 90].map((seconds) => (
                          <Button 
                            key={seconds} 
                            variant={selectedRestPeriod === seconds ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => handleSetTimer(seconds)}
                            className={selectedRestPeriod === seconds ? "bg-blue-500 hover:bg-blue-600" : ""}
                          >
                            {seconds}s
                          </Button>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <h3 className="text-xl font-medium mb-2">No workout selected</h3>
                    <p className="text-muted-foreground mb-6">
                      Select a workout from your schedule to view details.
                    </p>
                    {activePlan && (
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {activePlan.sessions.slice(0, 4).map((session) => {
                          const dayColor = getWorkoutDayColor(session.dayNumber);
                          return (
                            <Card 
                              key={session.sessionId} 
                              className="cursor-pointer transition-shadow hover:shadow-md"
                              onClick={() => setSelectedSession(session)}
                            >
                              <div 
                                className="h-3 rounded-t-lg" 
                                style={{ backgroundColor: dayColor }}
                              ></div>
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-base">{session.name}</CardTitle>
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs"
                                    style={{ 
                                      borderColor: dayColor,
                                      color: dayColor
                                    }}
                                  >
                                    Day {session.dayNumber}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm">{formatDuration(session.duration)}</p>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="exercises" className="space-y-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exercises by name, muscle group, or equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>

            {filteredExercises.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredExercises.map((exercise) => (
                  <Card key={exercise.exerciseId} className="overflow-hidden">
                    <img
                      src={exercise.imageUrl || "/api/placeholder/400/250"}
                      alt={exercise.name}
                      className="aspect-video object-cover w-full h-48"
                    />
                    <CardHeader>
                      <CardTitle>{exercise.name}</CardTitle>
                      <CardDescription className="flex items-center justify-between">
                        <span>{exercise.targetMuscleGroup}</span>
                        <Badge variant="outline" className="capitalize">{exercise.difficulty}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">{exercise.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Equipment: <span className="font-medium">{exercise.equipment}</span>
                          </p>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{exercise.instructions}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <h3 className="text-xl font-medium mb-2">No exercises found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery 
                        ? `No exercises match your search for "${searchQuery}"`
                        : "Your plan doesn't have any exercises defined yet"
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {showCreateWorkoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Workout Plan</CardTitle>
              <CardDescription>
                This feature will be available soon. You'll be able to create custom workout plans or generate AI-powered ones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                In the meantime, you can explore your existing workout plans or contact our team for assistance.
              </p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" onClick={() => setShowCreateWorkoutModal(false)}>
                Close
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}