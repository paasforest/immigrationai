'use client';

import { useState, useEffect } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, Calendar, User, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  case: {
    id: string;
    referenceNumber: string;
    title: string;
  };
  assignedTo: {
    id: string;
    fullName: string;
  } | null;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'border-red-500';
    case 'high':
      return 'border-orange-500';
    case 'normal':
      return 'border-blue-500';
    case 'low':
      return 'border-gray-400';
    default:
      return 'border-gray-300';
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    case 'in_progress':
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignedToId: 'all',
  });
  const [orgUsers, setOrgUsers] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTask, setNewTask] = useState({
    caseId: '',
    title: '',
    description: '',
    assignedToId: '',
    priority: 'normal' as const,
    dueDate: '',
  });

  useEffect(() => {
    fetchData();
    fetchUsers();
    fetchCases();
  }, [filters]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.priority !== 'all') params.priority = filters.priority;
      if (filters.assignedToId !== 'all') params.assignedToId = filters.assignedToId;

      const response = await immigrationApi.getAllTasksAcrossOrg(params);
      if (response.success && response.data) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await immigrationApi.getOrgUsers();
      if (response.success && response.data) {
        setOrgUsers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchCases = async () => {
    try {
      const response = await immigrationApi.getCases(
        { status: 'open' },
        1,
        100
      );
      if (response.success && response.data?.data) {
        setCases(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    if (!newTask.caseId) {
      toast.error('Please select a case for this task');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await immigrationApi.createTask({
        caseId: newTask.caseId,
        title: newTask.title.trim(),
        description: newTask.description || undefined,
        assignedToId: newTask.assignedToId || undefined,
        priority: newTask.priority,
        dueDate: newTask.dueDate || undefined,
      });

      if (response.success) {
        toast.success('Task created successfully');
        setIsCreateOpen(false);
        setNewTask({
          caseId: '',
          title: '',
          description: '',
          assignedToId: '',
          priority: 'normal',
          dueDate: '',
        });
        fetchData();
      } else {
        toast.error(response.error || 'Failed to create task');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (taskId: string) => {
    try {
      const response = await immigrationApi.updateTask(taskId, { status: 'completed' });
      if (response.success) {
        toast.success('Task marked as completed');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < today && t.status !== 'completed'
  );
  const dueToday = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate).toDateString() === today.toDateString() && t.status !== 'completed'
  );
  const thisWeek = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate) > today &&
      new Date(t.dueDate) <= weekFromNow &&
      t.status !== 'completed'
  );
  const later = tasks.filter(
    (t) => (!t.dueDate || new Date(t.dueDate) > weekFromNow) && t.status !== 'completed'
  );

  const renderTaskRow = (task: Task) => (
    <div
      key={task.id}
      className={`flex items-center gap-4 p-3 border-l-4 rounded ${getPriorityColor(task.priority)} bg-white hover:bg-gray-50`}
    >
      <Checkbox
        checked={task.status === 'completed'}
        onCheckedChange={() => handleComplete(task.id)}
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{task.title}</span>
          <Link
            href={`/dashboard/immigration/cases/${task.case.id}`}
            target="_blank"
            className="text-xs text-[#0F2557] hover:underline"
          >
            {task.case.referenceNumber}
          </Link>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
          {task.assignedTo && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{task.assignedTo.fullName}</span>
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>
      </div>
      {getStatusBadge(task.status)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage tasks across all cases</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {tasks.length} total
          </Badge>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0F2557] hover:bg-[#0a1d42]">
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Case *</Label>
                  <Select
                    value={newTask.caseId}
                    onValueChange={(value) => setNewTask({ ...newTask, caseId: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a case" />
                    </SelectTrigger>
                    <SelectContent>
                      {cases.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="font-mono text-xs mr-2 text-gray-500">
                            {c.referenceNumber}
                          </span>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Title *</Label>
                  <Input
                    className="mt-1"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="e.g. Collect bank statements"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    className="mt-1"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Optional details..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Assigned To</Label>
                    <Select
                      value={newTask.assignedToId}
                      onValueChange={(value) => setNewTask({ ...newTask, assignedToId: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {orgUsers
                          .filter((u) => u.organizationRole !== 'applicant')
                          .map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.fullName || u.email}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value: any) =>
                        setNewTask({ ...newTask, priority: value })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">🔴 Urgent</SelectItem>
                        <SelectItem value="high">🟠 High</SelectItem>
                        <SelectItem value="normal">🔵 Normal</SelectItem>
                        <SelectItem value="low">⚪ Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTask} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Task
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select
                value={filters.priority}
                onValueChange={(value) => setFilters({ ...filters, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Assigned To</label>
              <Select
                value={filters.assignedToId}
                onValueChange={(value) => setFilters({ ...filters, assignedToId: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {orgUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Sections */}
      <div className="space-y-6">
        {/* Overdue */}
        <Card className="border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-900">OVERDUE ({overdue.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {overdue.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No tasks in this group</p>
              </div>
            ) : (
              overdue.map(renderTaskRow)
            )}
          </CardContent>
        </Card>

        {/* Due Today */}
        <Card className="border-amber-200">
          <CardHeader className="bg-amber-50">
            <CardTitle className="text-amber-900">DUE TODAY ({dueToday.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {dueToday.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No tasks in this group</p>
              </div>
            ) : (
              dueToday.map(renderTaskRow)
            )}
          </CardContent>
        </Card>

        {/* This Week */}
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-900">THIS WEEK ({thisWeek.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {thisWeek.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No tasks in this group</p>
              </div>
            ) : (
              thisWeek.map(renderTaskRow)
            )}
          </CardContent>
        </Card>

        {/* Later */}
        <Card className="border-gray-200">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-gray-900">LATER ({later.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {later.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No tasks in this group</p>
              </div>
            ) : (
              later.map(renderTaskRow)
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
