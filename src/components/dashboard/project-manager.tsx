"use client";

import { useState } from "react";
import { Plus, FolderOpen, Star, MoreVertical, Trash2, Edit2, Check, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProject, deleteProject, setDefaultProject, updateProject } from "@/lib/actions/projects";
import type { Project, AccessStatus } from "@/types/database";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ProjectManagerProps {
  projects: Project[];
  accessStatus: AccessStatus;
}

export function ProjectManager({ projects, accessStatus }: ProjectManagerProps) {
  const [showNewProject, setShowNewProject] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    companyUrl: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    company_name: "",
    description: "",
    company_url: "",
  });

  const canCreateMore = projects.length < accessStatus.projectLimit;

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      setError("Project name is required");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await createProject(
      newProject.name.trim(),
      newProject.description.trim() || null,
      newProject.companyUrl.trim() || null
    );

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setNewProject({ name: "", description: "", companyUrl: "" });
    setShowNewProject(false);
    setLoading(false);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? All feedback will be lost.")) {
      return;
    }

    setLoading(true);
    const result = await deleteProject(projectId);
    
    if (result.error) {
      setError(result.error);
    }
    
    setLoading(false);
    setMenuOpen(null);
  };

  const handleSetDefault = async (projectId: string) => {
    setLoading(true);
    const result = await setDefaultProject(projectId);
    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
    setMenuOpen(null);
  };

  const handleStartEdit = (project: Project) => {
    setEditingProject(project.id);
    setEditForm({
      name: project.name,
      company_name: project.company_name || project.name,
      description: project.description || "",
      company_url: project.company_url || "",
    });
    setMenuOpen(null);
  };

  const handleSaveEdit = async (projectId: string) => {
    if (!editForm.name.trim()) {
      setError("Project name is required");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await updateProject(projectId, {
      name: editForm.name.trim(),
      company_name: editForm.company_name.trim() || editForm.name.trim(),
      description: editForm.description.trim() || null,
      company_url: editForm.company_url.trim() || null,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setEditingProject(null);
    }
    
    setLoading(false);
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setEditForm({ name: "", company_name: "", description: "", company_url: "" });
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Projects</h2>
          <p className="text-sm text-muted-foreground">
            {projects.length} of {accessStatus.projectLimit} projects used
          </p>
        </div>
        {canCreateMore && (
          <Button
            onClick={() => setShowNewProject(true)}
            size="sm"
            className="bg-[#f97352] hover:bg-[#e8634a]"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Project
          </Button>
        )}
      </div>

      {!canCreateMore && !showNewProject && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4 text-sm text-amber-700 dark:text-amber-300">
          You&apos;ve reached your project limit. Upgrade your subscription to add more projects.
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 text-sm text-red-700 dark:text-red-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* New project form */}
      {showNewProject && (
        <div className="border border-border rounded-lg p-4 mb-4 bg-muted/50">
          <h3 className="font-medium text-foreground mb-3">Create New Project</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Project Name *</label>
              <Input
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="My Project"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Description</label>
              <Textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Brief description of this project..."
                className="resize-none"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Website URL</label>
              <Input
                value={newProject.companyUrl}
                onChange={(e) => setNewProject({ ...newProject, companyUrl: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => {
                  setShowNewProject(false);
                  setNewProject({ name: "", description: "", companyUrl: "" });
                  setError(null);
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={loading || !newProject.name.trim()}
                size="sm"
                className="bg-[#f97352] hover:bg-[#e8634a]"
              >
                {loading ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Project list */}
      <div className="space-y-2">
        {projects.map((project) => (
          <div
            key={project.id}
            className={cn(
              "border rounded-lg p-3 transition-colors",
              project.is_default ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
            )}
          >
            {editingProject === project.id ? (
              // Edit mode
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Project Name</label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Company Name</label>
                  <Input
                    value={editForm.company_name}
                    onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                    placeholder="Displayed on the public board"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Description</label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="resize-none"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Website URL</label>
                  <Input
                    value={editForm.company_url}
                    onChange={(e) => setEditForm({ ...editForm, company_url: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCancelEdit} variant="outline" size="sm">
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleSaveEdit(project.id)} 
                    disabled={loading}
                    size="sm"
                    className="bg-[#f97352] hover:bg-[#e8634a]"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              // Display mode
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                    project.is_default ? "bg-primary" : "bg-muted"
                  )}>
                    <FolderOpen className={cn(
                      "w-4 h-4",
                      project.is_default ? "text-primary-foreground" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-foreground truncate text-sm">{project.name}</h3>
                      {project.is_default && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded">
                          <Star className="w-3 h-3" />
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">/b/{project.slug}</code>
                      <Link 
                        href={`/b/${project.slug}`} 
                        target="_blank"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                    {project.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{project.description}</p>
                    )}
                  </div>
                </div>

                <div className="relative ml-2">
                  <button
                    onClick={() => setMenuOpen(menuOpen === project.id ? null : project.id)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                  
                  {menuOpen === project.id && (
                    <div className="absolute right-0 top-8 bg-popover border border-border rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                      <button
                        onClick={() => handleStartEdit(project)}
                        className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      {!project.is_default && (
                        <>
                          <button
                            onClick={() => handleSetDefault(project.id)}
                            disabled={loading}
                            className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2 disabled:opacity-50"
                          >
                            <Star className="w-4 h-4" />
                            Set as Default
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            disabled={loading}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {projects.length === 0 && !showNewProject && (
          <div className="text-center py-6 text-muted-foreground">
            <FolderOpen className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm">No projects yet</p>
            <p className="text-xs">Create your first project to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
