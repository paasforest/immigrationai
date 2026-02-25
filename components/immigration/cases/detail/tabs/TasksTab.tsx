'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { immigrationApi } from '@/lib/api/immigration';
import { CaseTask } from '@/types/immigration';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function getUrgencyColor(dueDate: string | null): string {
  if (!dueDate) return 'text-gray-600';
  const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return 'text-red-600';
  if (days <= 2) return 'text-red-600';
  if (days <= 5) return 'text-amber-600';
  return 'text-green-600';
}

interface TasksTabProps {
  caseId: string;
  onRefresh: () => void;
}

export default function TasksTab({ caseId, onRefresh }: TasksTabProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<CaseTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedToId: '',
    priority: 'normal' as const,
    dueDate: '',
  });

  const isAdmin = user?.role === 'org_admin';
  const [orgUsers, setOrgUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [caseId]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await immigrationApi.getTasksByCase(caseId);
      if (response.success && response.data) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
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

  const handleCreateTask = async () => {
    if (!newTask.title) {
      toast.error('Title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await immigrationApi.createTask({
        caseId,
        ...newTask,
        dueDate: newTask.dueDate || undefined,
      });

      if (response.success) {
        toast.success('Task created successfully');
        setIsDialogOpen(false);
        setNewTask({ title: '', description: '', assignedToId: '', priority: 'normal', dueDate: '' });
        fetchTasks();
        onRefresh();
      } else {
        toast.error(response.error || 'Failed to create task');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (task: CaseTask) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      const response = await immigrationApi.updateTask(task.id, {
        status: newStatus,
        ...(newStatus === 'completed' && { completedAt: new Date().toISOString() }),
      });

      if (response.success) {
        fetchTasks();
        onRefresh();
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!isAdmin) return;

    try {
      const response = await immigrationApi.deleteTask(taskId);
      if (response.success) {
        toast.success('Task deleted successfully');
        fetchTasks();
        onRefresh();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete task');
    }
  };

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              <div>
                <Label>Assigned To</Label>
                <Select
                  value={newTask.assignedToId}
                  onValueChange={(value) => setNewTask({ ...newTask, assignedToId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {orgUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask} disabled={isSubmitting}>
                  Create Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending */}
        <div>
          <h3 className="font-semibold mb-4">Pending</h3>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={() => handleToggleComplete(task)}
                onDelete={isAdmin ? () => handleDelete(task.id) : undefined}
              />
            ))}
          </div>
        </div>

        {/* In Progress */}
        <div>
          <h3 className="font-semibold mb-4">In Progress</h3>
          <div className="space-y-3">
            {inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={() => handleToggleComplete(task)}
                onDelete={isAdmin ? () => handleDelete(task.id) : undefined}
              />
            ))}
          </div>
        </div>

        {/* Completed */}
        <div>
          <h3 className="font-semibold mb-4">Completed</h3>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={() => handleToggleComplete(task)}
                onDelete={isAdmin ? () => handleDelete(task.id) : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onToggleComplete,
  onDelete,
}: {
  task: CaseTask;
  onToggleComplete: () => void;
  onDelete?: () => void;
}) {
  const isCompleted = task.status === 'completed';
  const urgencyColor = getUrgencyColor(task.dueDate);

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={onToggleComplete}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <p className={`font-semibold ${isCompleted ? 'line-through text-gray-500' : ''}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {task.assignedTo && (
                <div className="flex items-center gap-1">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs">
                      {getInitials(task.assignedTo.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600">{task.assignedTo.fullName}</span>
                </div>
              )}
              {task.dueDate && (
                <span className={`text-xs ${urgencyColor}`}>
                  {format(new Date(task.dueDate), 'MMM d')}
                </span>
              )}
              <Badge variant="outline" className="text-xs">
                {task.priority}
              </Badge>
            </div>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
