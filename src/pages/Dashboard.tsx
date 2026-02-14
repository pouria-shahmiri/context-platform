import React, { useEffect } from 'react';
import { GitMerge, ArrowRight, BookOpen, Pyramid, LucideIcon, Server, CheckSquare, Layout, Bot, Workflow } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Link, useParams } from 'react-router-dom';
import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedCard } from "@/components/ui/animated-card";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { Loading } from "@/components/ui/loading";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { workspaces, setCurrentWorkspace, currentWorkspace } = useWorkspace();

  useEffect(() => {
    if (workspaceId && workspaces.length > 0) {
      const workspace = workspaces.find(w => w.id === workspaceId);
      if (workspace && (!currentWorkspace || currentWorkspace.id !== workspaceId)) {
        setCurrentWorkspace(workspace);
      }
    }
  }, [workspaceId, workspaces, currentWorkspace, setCurrentWorkspace]);
  
  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-background">
        <Loading />
      </div>
    );
  }

  const ToolCard: React.FC<{
    title: string;
    description: string;
    icon: LucideIcon;
    to: string;
    color: string;
    delay?: number;
  }> = ({ title, description, icon: Icon, to, color, delay = 0 }) => (
    <AnimatedCard delay={delay} className="hover:shadow-lg transition-shadow cursor-pointer border-border h-full flex flex-col">
      <CardHeader>
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", color)}>
          <AnimatedIcon icon={Icon} size={24} className="text-white" animation="scale" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-3">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto pt-0">
        <Link to={to} className="w-full">
          <AnimatedButton variant="secondary" className="w-full cursor-pointer justify-between group">
            Open Tool <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </AnimatedButton>
        </Link>
      </CardContent>
    </AnimatedCard>
  );

  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto p-6 pt-10 max-w-7xl">
        <div className="space-y-10">
        <section className="m-0 p-0">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-base font-semibold tracking-tight whitespace-nowrap">AI &amp; Agents</h2>
            <div className="border-t flex-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ToolCard 
              title="AI Assistant" 
              description="Chat with the AI assistant to get help with your project, generate ideas, or analyze your data."
              icon={Bot}
              to="/ai-chat"
              color="bg-violet-600"
              delay={0.1}
            />
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-base font-semibold tracking-tight whitespace-nowrap">Problem Solving, Thinking and Planning</h2>
            <div className="border-t flex-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ToolCard 
              title="Pyramid Solver" 
              description="Structure your problem solving with a logical pyramid approach. Break down complex issues into manageable questions and answers."
              icon={Pyramid}
              to="/pyramids"
              color="bg-indigo-600"
              delay={0.2}
            />
            <ToolCard 
              title="Diagrams" 
              description="Create and manage visual diagrams to illustrate system flows, architectures, and processes."
              icon={Workflow}
              to="/diagrams"
              color="bg-rose-600"
              delay={0.3}
            />
          </div>
        </section>

        <section className="m-0 p-0">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-base font-semibold tracking-tight whitespace-nowrap">Product design &amp; Management</h2>
            <div className="border-t flex-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ToolCard 
              title="Product Definition" 
              description="Define your product using the structured mindmap. Detail problems, appetites, solutions, and risks in a structured graph."
              icon={GitMerge}
              to="/product-definitions"
              color="bg-teal-600"
              delay={0.4}
            />
            <ToolCard 
              title="UI/UX Architecture" 
              description="Design your application's visual structure, theme, and navigation flow using a visual node editor."
              icon={Layout}
              to="/ui-ux-architectures"
              color="bg-pink-600"
              delay={0.5}
            />
          </div>
        </section>

        <section className="m-0 p-0">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-base font-semibold tracking-tight whitespace-nowrap">Knowledge Base</h2>
            <div className="border-t flex-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ToolCard 
              title="Context &amp; Documents" 
              description="Create and manage knowledge base documents. Use them as context for your product definitions and problem solving."
              icon={BookOpen}
              to="/context-documents"
              color="bg-amber-600"
              delay={0.6}
            />
          </div>
        </section>

        <section className="m-0 p-0">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-base font-semibold tracking-tight whitespace-nowrap">Technical</h2>
            <div className="border-t flex-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ToolCard 
              title="Technical Architecture"
              description="Define the full technical architecture of your application. Specify system layers, technology stack, and engineering standards."
              icon={Server}
              to="/technical-architectures"
              color="bg-purple-600"
              delay={0.7}
            />
            <ToolCard 
              title="Technical Tasks" 
              description="Manage implementation tasks and bug fixes. Link tasks to technical architecture and track progress in pipelines."
              icon={CheckSquare}
              to="/technical-tasks"
              color="bg-blue-600"
              delay={0.8}
            />
          </div>
        </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
