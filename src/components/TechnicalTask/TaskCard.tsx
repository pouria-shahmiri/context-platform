import React from 'react';
import { Card, Flex, Heading, Text, Badge, Box, IconButton } from '@radix-ui/themes';
import { Trash2 } from 'lucide-react';
import { TechnicalTask } from '../../types/technicalTask';
import { useNavigate } from 'react-router-dom';

interface TaskCardProps {
    task: TechnicalTask;
    onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/technical-task/${task.id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this task?")) {
            onDelete(task.id);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL': return 'red';
            case 'HIGH': return 'orange';
            case 'MEDIUM': return 'blue';
            case 'LOW': return 'green';
            default: return 'gray';
        }
    };

    const getTypeBadge = (type: string) => {
        return type === 'NEW_TASK' ? 'blue' : 'amber';
    };

    return (
        <Card className="group cursor-pointer shadow-md hover:shadow-lg transition-shadow mb-2 !rounded-2xl" onClick={handleClick}>
            <Flex direction="column" gap="2">
                <Flex justify="between" align="center">
                    <Flex gap="2" align="center">
                        <Badge color={getTypeBadge(task.type)} variant="soft" radius="full">{task.type.replace('_', ' ')}</Badge>
                        <Badge color={getPriorityColor(task.data.task_metadata.priority)}>{task.data.task_metadata.priority}</Badge>
                    </Flex>
                    <IconButton 
                        variant="ghost" 
                        color="red" 
                        size="1" 
                        onClick={handleDelete}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={14} />
                    </IconButton>
                </Flex>
                <Heading size="3">{task.title}</Heading>
                <Text size="1" color="gray" className="line-clamp-2">
                    {task.data.description.main.summary || task.data.description.main.bug_report || "No description"}
                </Text>
                <Flex justify="between" align="center" mt="2">
                    <Text size="1" color="gray">{task.data.task_metadata.task_id}</Text>
                </Flex>
            </Flex>
        </Card>
    );
};
