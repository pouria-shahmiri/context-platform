import React, { useEffect, useState } from 'react';
import { Flex, Heading, Text, Button, Dialog, TextField, Select, IconButton, Box, DropdownMenu } from '@radix-ui/themes';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
    getPipelines, 
    getTechnicalTasks, 
    createTechnicalTask, 
    createPipeline, 
    deletePipeline, 
    updatePipeline,
    deleteTechnicalTask,
    batchUpdatePipelines,
    batchUpdateTasks
} from '../services/technicalTaskService';
import { getUserTechnicalArchitectures } from '../services/technicalArchitectureService';
import { Pipeline, TechnicalTask, TaskType } from '../types/technicalTask';
import { TechnicalArchitecture } from '../types';
import { TaskCard } from '../components/TechnicalTask/TaskCard';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export const TechnicalTaskBoard: React.FC = () => {
    const { user } = useAuth();
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [tasks, setTasks] = useState<TechnicalTask[]>([]);
    const [architectures, setArchitectures] = useState<TechnicalArchitecture[]>([]);
    const [loading, setLoading] = useState(true);

    // Create Task Modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskType, setNewTaskType] = useState<TaskType>('NEW_TASK');
    const [selectedArch, setSelectedArch] = useState<string>('');

    // Create Pipeline Modal
    const [isPipelineOpen, setIsPipelineOpen] = useState(false);
    const [newPipelineTitle, setNewPipelineTitle] = useState('');

    // Rename Pipeline State
    const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
    const [renameTitle, setRenameTitle] = useState('');

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [fetchedPipelines, fetchedTasks, fetchedArchs] = await Promise.all([
                getPipelines(user.uid),
                getTechnicalTasks(user.uid),
                getUserTechnicalArchitectures(user.uid)
            ]);
            setPipelines(fetchedPipelines);
            setTasks(fetchedTasks);
            setArchitectures(fetchedArchs);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async () => {
        if (!user || !newTaskTitle || !selectedArch) return;
        // Default to first pipeline
        const pipelineId = pipelines[0]?.id;
        if (!pipelineId) return;

        const task = await createTechnicalTask(user.uid, pipelineId, newTaskTitle, newTaskType, selectedArch);
        if (task) {
            setTasks([...tasks, task]);
            setIsCreateOpen(false);
            setNewTaskTitle('');
            setSelectedArch('');
        }
    };

    const handleCreatePipeline = async () => {
        if (!user || !newPipelineTitle) return;
        const pipeline = await createPipeline(user.uid, newPipelineTitle, pipelines.length);
        if (pipeline) {
            setPipelines([...pipelines, pipeline]);
            setIsPipelineOpen(false);
            setNewPipelineTitle('');
        }
    };

    const handleDeletePipeline = async (pipelineId: string) => {
        const pipeline = pipelines.find(p => p.id === pipelineId);
        if (!pipeline) return;

        if (pipelines.length <= 1) {
            alert("You must have at least one pipeline.");
            return;
        }

        if (pipeline.title === "Backlog") {
            alert("The Backlog pipeline cannot be deleted.");
            return;
        }

        // Check if pipeline has tasks
        const hasTasks = tasks.some(t => t.pipelineId === pipelineId);
        if (hasTasks) {
            alert("Cannot delete pipeline with tasks. Please move or delete tasks first.");
            return;
        }

        if (confirm(`Are you sure you want to delete the pipeline "${pipeline.title}"?`)) {
            const success = await deletePipeline(pipelineId);
            if (success) {
                setPipelines(pipelines.filter(p => p.id !== pipelineId));
            }
        }
    };

    const handleRenamePipeline = async () => {
        if (!editingPipeline || !renameTitle) return;
        
        await updatePipeline(editingPipeline.id, { title: renameTitle });
        setPipelines(pipelines.map(p => p.id === editingPipeline.id ? { ...p, title: renameTitle } : p));
        setEditingPipeline(null);
        setRenameTitle('');
    };

    const handleDeleteTask = async (taskId: string) => {
        const success = await deleteTechnicalTask(taskId);
        if (success) {
            setTasks(tasks.filter(t => t.id !== taskId));
        } else {
            alert("Failed to delete task. Please try again.");
        }
    };

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId, type } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // Reordering Pipelines
        if (type === 'pipeline') {
            const newPipelines = Array.from(pipelines);
            const [removed] = newPipelines.splice(source.index, 1);
            newPipelines.splice(destination.index, 0, removed);

            const updatedPipelines = newPipelines.map((p, index) => ({ ...p, order: index }));
            setPipelines(updatedPipelines);
            batchUpdatePipelines(updatedPipelines);
            return;
        }

        // Reordering Tasks
        if (type === 'task') {
            const startPipelineId = source.droppableId;
            const finishPipelineId = destination.droppableId;

            // Helper to sort tasks
            const getSortedTasks = (pid: string) => 
                tasks.filter(t => t.pipelineId === pid).sort((a, b) => (a.order || 0) - (b.order || 0));

            if (startPipelineId === finishPipelineId) {
                const pipelineTasks = getSortedTasks(startPipelineId);
                const [movedTask] = pipelineTasks.splice(source.index, 1);
                pipelineTasks.splice(destination.index, 0, movedTask);

                const updatedPipelineTasks = pipelineTasks.map((t, index) => ({ ...t, order: index }));
                
                const otherTasks = tasks.filter(t => t.pipelineId !== startPipelineId);
                setTasks([...otherTasks, ...updatedPipelineTasks]);
                batchUpdateTasks(updatedPipelineTasks).catch(err => {
                    console.error("Failed to save task order:", err);
                    alert("Failed to save changes. Please refresh.");
                });
            } else {
                const startTasks = getSortedTasks(startPipelineId);
                const finishTasks = getSortedTasks(finishPipelineId);

                const [movedTask] = startTasks.splice(source.index, 1);
                movedTask.pipelineId = finishPipelineId;
                
                finishTasks.splice(destination.index, 0, movedTask);

                const updatedStartTasks = startTasks.map((t, index) => ({...t, order: index}));
                const updatedFinishTasks = finishTasks.map((t, index) => ({...t, order: index}));

                const otherTasks = tasks.filter(t => t.pipelineId !== startPipelineId && t.pipelineId !== finishPipelineId);
                setTasks([...otherTasks, ...updatedStartTasks, ...updatedFinishTasks]);
                batchUpdateTasks([...updatedStartTasks, ...updatedFinishTasks]).catch(err => {
                    console.error("Failed to save task order:", err);
                    alert("Failed to save changes. Please refresh.");
                });
            }
        }
    };

    return (
        <Box className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <Box className="p-4 border-b bg-white">
                <Box className="max-w-[1800px] mx-auto w-full">
                    <Flex justify="between" align="center">
                        <Box>
                            <Heading size="3">Technical Tasks</Heading>
                            <Text color="gray" size="1">Manage your technical implementation tasks in technical task page</Text>
                        </Box>
                        <Flex gap="3">
                            <Dialog.Root open={isPipelineOpen} onOpenChange={setIsPipelineOpen}>
                                <Dialog.Trigger>
                                    <Button variant="outline" color="gray">
                                        <Plus size={16} /> New Pipeline
                                    </Button>
                                </Dialog.Trigger>
                                <Dialog.Content style={{ maxWidth: 400 }}>
                                    <Dialog.Title>Add Pipeline</Dialog.Title>
                                    <Dialog.Description size="2" mb="4">
                                        Create a new column for your task board.
                                    </Dialog.Description>
                                    <Flex direction="column" gap="3">
                                        <label>
                                            <Text as="div" size="2" mb="1" weight="bold">Title</Text>
                                            <TextField.Root 
                                                value={newPipelineTitle}
                                                onChange={(e) => setNewPipelineTitle(e.target.value)}
                                                placeholder="e.g. In Review"
                                            />
                                        </label>
                                        <Flex gap="3" justify="end" mt="4">
                                            <Dialog.Close>
                                                <Button variant="soft" color="gray">Cancel</Button>
                                            </Dialog.Close>
                                            <Button onClick={handleCreatePipeline}>Create</Button>
                                        </Flex>
                                    </Flex>
                                </Dialog.Content>
                            </Dialog.Root>

                            <Dialog.Root open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                <Dialog.Trigger>
                                    <Button variant="solid" color="blue">
                                        <Plus size={16} /> New Task
                                    </Button>
                                </Dialog.Trigger>
                                <Dialog.Content style={{ maxWidth: 450 }}>
                                    <Dialog.Title>Create New Technical Task</Dialog.Title>
                                    <Dialog.Description size="2" mb="4">
                                        Fill in the details below to create a new technical task.
                                    </Dialog.Description>
                                    <Flex direction="column" gap="3">
                                        <label>
                                            <Text as="div" size="2" mb="1" weight="bold">Task Title</Text>
                                            <TextField.Root 
                                                value={newTaskTitle}
                                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                                placeholder="Enter task title"
                                            />
                                        </label>
                                        <label>
                                            <Text as="div" size="2" mb="1" weight="bold">Type</Text>
                                            <Select.Root value={newTaskType} onValueChange={(v) => setNewTaskType(v as TaskType)}>
                                                <Select.Trigger className="w-full" />
                                                <Select.Content>
                                                    <Select.Item value="NEW_TASK">New Task</Select.Item>
                                                    <Select.Item value="FIX_TASK">Fix Task</Select.Item>
                                                </Select.Content>
                                            </Select.Root>
                                        </label>
                                        <label>
                                            <Text as="div" size="2" mb="1" weight="bold">Technical Architecture</Text>
                                            <Select.Root value={selectedArch} onValueChange={setSelectedArch}>
                                                <Select.Trigger className="w-full" placeholder="Select Architecture..." />
                                                <Select.Content>
                                                    {architectures.map(arch => (
                                                        <Select.Item key={arch.id} value={arch.id}>{arch.title}</Select.Item>
                                                    ))}
                                                </Select.Content>
                                            </Select.Root>
                                        </label>
                                        <Flex gap="3" justify="end" mt="4">
                                            <Dialog.Close>
                                                <Button variant="soft" color="gray">Cancel</Button>
                                            </Dialog.Close>
                                            <Button onClick={handleCreateTask} disabled={!newTaskTitle || !selectedArch} color="blue">Create Task</Button>
                                        </Flex>
                                    </Flex>
                                </Dialog.Content>
                            </Dialog.Root>
                        </Flex>
                    </Flex>
                </Box>
            </Box>

            {/* Board Area */}
            <DragDropContext onDragEnd={onDragEnd}>
                <Box className="flex-1 overflow-x-auto p-4">
                    <Box className="max-w-[1800px] mx-auto h-full">
                        <Droppable droppableId="board" type="pipeline" direction="horizontal">
                            {(provided) => (
                                <Flex 
                                    gap="4" 
                                    className="h-full min-w-max"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    {pipelines.map((pipeline, index) => (
                                        <Draggable key={pipeline.id} draggableId={pipeline.id} index={index}>
                                            {(provided) => (
                                                <Box 
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className="w-80 flex flex-col bg-gray-100 rounded-lg h-full max-h-full shadow-md border border-gray-200"
                                                    style={{ ...provided.draggableProps.style }}
                                                >
                                                    <Flex 
                                                        {...provided.dragHandleProps}
                                                        justify="between" 
                                                        align="center" 
                                                        className="p-3 bg-gray-200 rounded-t-lg cursor-grab active:cursor-grabbing border-b border-gray-300"
                                                    >
                                                        <Text weight="bold" size="2">{pipeline.title}</Text>
                                                        <DropdownMenu.Root>
                                                            <DropdownMenu.Trigger>
                                                                <IconButton size="1" variant="ghost" color="gray">
                                                                    <MoreHorizontal size={14} />
                                                                </IconButton>
                                                            </DropdownMenu.Trigger>
                                                            <DropdownMenu.Content>
                                                                <DropdownMenu.Item onClick={() => {
                                                                    setEditingPipeline(pipeline);
                                                                    setRenameTitle(pipeline.title);
                                                                }}>
                                                                    <Pencil size={14} className="mr-2"/> Rename
                                                                </DropdownMenu.Item>
                                                                <DropdownMenu.Item color="red" onClick={() => handleDeletePipeline(pipeline.id)}>
                                                                    <Trash2 size={14} className="mr-2"/> Delete
                                                                </DropdownMenu.Item>
                                                            </DropdownMenu.Content>
                                                        </DropdownMenu.Root>
                                                    </Flex>

                                                    <Droppable droppableId={pipeline.id} type="task">
                                                        {(provided) => (
                                                            <Box 
                                                                className="p-2 flex-1 overflow-y-auto"
                                                                ref={provided.innerRef}
                                                                {...provided.droppableProps}
                                                            >
                                                                {tasks
                                                                    .filter(t => t.pipelineId === pipeline.id)
                                                                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                                                                    .map((task, index) => (
                                                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                                                            {(provided) => (
                                                                                <div
                                                                                    ref={provided.innerRef}
                                                                                    {...provided.draggableProps}
                                                                                    {...provided.dragHandleProps}
                                                                                    style={{ ...provided.draggableProps.style, marginBottom: '8px' }}
                                                                                >
                                                                                    <TaskCard task={task} onDelete={handleDeleteTask} />
                                                                                </div>
                                                                            )}
                                                                        </Draggable>
                                                                    ))
                                                                }
                                                                {provided.placeholder}
                                                            </Box>
                                                        )}
                                                    </Droppable>
                                                </Box>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </Flex>
                            )}
                        </Droppable>
                    </Box>
                </Box>
            </DragDropContext>

            {/* Rename Pipeline Dialog */}
            <Dialog.Root open={!!editingPipeline} onOpenChange={(open) => !open && setEditingPipeline(null)}>
                <Dialog.Content style={{ maxWidth: 400 }}>
                    <Dialog.Title>Rename Pipeline</Dialog.Title>
                    <Flex direction="column" gap="3">
                        <TextField.Root 
                            value={renameTitle}
                            onChange={(e) => setRenameTitle(e.target.value)}
                        />
                        <Flex gap="3" justify="end" mt="4">
                            <Button variant="soft" color="gray" onClick={() => setEditingPipeline(null)}>Cancel</Button>
                            <Button onClick={handleRenamePipeline}>Save</Button>
                        </Flex>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>
        </Box>
    );
};
