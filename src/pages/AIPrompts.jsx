import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Brain, Plus, Trash2 } from "lucide-react";
import PageHeader from "../components/shared/PageHeader";
import EmptyState from "../components/shared/EmptyState";

const TYPES = ["objection_detection", "stage_detection", "suggestion_generation", "summary_generation", "info_extraction"];
const typeLabels = {
  objection_detection: "Objection Detection",
  stage_detection: "Stage Detection",
  suggestion_generation: "Suggestion Generation",
  summary_generation: "Summary Generation",
  info_extraction: "Info Extraction",
};

export default function AIPrompts() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "objection_detection", prompt_text: "" });

  const { data: prompts = [] } = useQuery({
    queryKey: ["prompts"],
    queryFn: () => base44.entities.AIPrompt.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AIPrompt.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      setOpen(false);
      setForm({ name: "", type: "objection_detection", prompt_text: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AIPrompt.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prompts"] }),
  });

  return (
    <div>
      <PageHeader title="AI Prompts" description="Configure AI behavior for call analysis">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Prompt</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New AI Prompt</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" placeholder="Prompt name" />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => <SelectItem key={t} value={t}>{typeLabels[t]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prompt Template</Label>
                <Textarea value={form.prompt_text} onChange={(e) => setForm({ ...form, prompt_text: e.target.value })} className="mt-1 h-48 font-mono text-xs" placeholder="Enter the AI prompt template..." />
              </div>
              <Button onClick={() => createMutation.mutate(form)} className="w-full">Save Prompt</Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {prompts.length === 0 ? (
        <EmptyState icon={Brain} title="No AI prompts configured" description="Add prompts to customize how the AI analyzes calls" />
      ) : (
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <Card key={prompt.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">{prompt.name}</h3>
                  <Badge variant="secondary" className="text-[10px] mt-1">{typeLabels[prompt.type] || prompt.type}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMutation.mutate(prompt.id)}>
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-muted rounded-lg p-3 max-h-40 overflow-auto">
                {prompt.prompt_text}
              </pre>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}